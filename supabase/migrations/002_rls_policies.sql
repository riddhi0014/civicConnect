-- ==============================================================================
-- 002_rls_policies.sql
-- Row Level Security (RLS) Policies for CivicConnect
-- ==============================================================================

-- Helper function to fetch the current user's role without recursive policy triggering
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------
-- Users can read their own profile, officers/admins can be read by authenticated users, admins read all
CREATE POLICY "Profiles are viewable by owner or admin"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR public.current_user_role() = 'admin'
        OR role IN ('officer', 'admin')
    );

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY "Users can update own profile, admin can update all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.current_user_role() = 'admin')
    WITH CHECK (
        public.current_user_role() = 'admin' 
        OR (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
    );

-- -----------------------------------------------------------------------------
-- DEPARTMENTS, CATEGORIES, SUBCATEGORIES POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Departments are readable by everyone"
    ON public.departments FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Departments manageable by admin"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Categories are readable by everyone"
    ON public.categories FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Categories manageable by admin"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.current_user_role() = 'admin');

CREATE POLICY "Subcategories are readable by everyone"
    ON public.subcategories FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Subcategories manageable by admin"
    ON public.subcategories FOR ALL
    TO authenticated
    USING (public.current_user_role() = 'admin');

-- -----------------------------------------------------------------------------
-- COMPLAINTS POLICIES
-- -----------------------------------------------------------------------------
-- Citizens see only their own complaints
-- Officers see only complaints assigned to them
-- Admins see all complaints
CREATE POLICY "Complaints select policy"
    ON public.complaints FOR SELECT
    TO authenticated
    USING (
        citizen_id = auth.uid()
        OR assigned_officer_id = auth.uid()
        OR public.current_user_role() = 'admin'
    );

-- Citizens can insert their own complaints, admin can insert any
CREATE POLICY "Complaints insert policy"
    ON public.complaints FOR INSERT
    TO authenticated
    WITH CHECK (
        (citizen_id = auth.uid() AND public.current_user_role() = 'citizen')
        OR public.current_user_role() = 'admin'
    );

-- Citizens can update their own complaint status (confirm / reopen)
-- Officers can update their assigned complaints (in_progress, resolved)
-- Admins can update all complaints
CREATE POLICY "Complaints update policy"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (
        citizen_id = auth.uid()
        OR assigned_officer_id = auth.uid()
        OR public.current_user_role() = 'admin'
    )
    WITH CHECK (
        citizen_id = auth.uid()
        OR assigned_officer_id = auth.uid()
        OR public.current_user_role() = 'admin'
    );

-- -----------------------------------------------------------------------------
-- COMPLAINT EVENTS POLICIES (Audit Trail)
-- -----------------------------------------------------------------------------
CREATE POLICY "Complaint events select policy"
    ON public.complaint_events FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = complaint_events.complaint_id
            AND (
                c.citizen_id = auth.uid()
                OR c.assigned_officer_id = auth.uid()
                OR public.current_user_role() = 'admin'
            )
        )
    );

CREATE POLICY "Complaint events insert policy"
    ON public.complaint_events FOR INSERT
    TO authenticated
    WITH CHECK (
        actor_id = auth.uid()
        OR public.current_user_role() = 'admin'
    );

-- -----------------------------------------------------------------------------
-- RESOLUTIONS POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Resolutions select policy"
    ON public.resolutions FOR SELECT
    TO authenticated
    USING (
        officer_id = auth.uid()
        OR public.current_user_role() = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = resolutions.complaint_id
            AND c.citizen_id = auth.uid()
        )
    );

CREATE POLICY "Resolutions insert policy"
    ON public.resolutions FOR INSERT
    TO authenticated
    WITH CHECK (
        (officer_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = resolutions.complaint_id
            AND c.assigned_officer_id = auth.uid()
        ))
        OR public.current_user_role() = 'admin'
    );

-- -----------------------------------------------------------------------------
-- FEEDBACK POLICIES
-- -----------------------------------------------------------------------------
CREATE POLICY "Feedback select policy"
    ON public.feedback FOR SELECT
    TO authenticated
    USING (
        citizen_id = auth.uid()
        OR public.current_user_role() = 'admin'
        OR EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = feedback.complaint_id
            AND c.assigned_officer_id = auth.uid()
        )
    );

-- Citizen can only submit feedback for their own complaints that are resolved or closed
CREATE POLICY "Feedback insert policy"
    ON public.feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        citizen_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.complaints c
            WHERE c.id = feedback.complaint_id
            AND c.citizen_id = auth.uid()
            AND c.status IN ('resolved', 'closed')
        )
    );
