-- ==============================================================================
-- 005_complaint_supporters.sql
-- "Me too" support: citizens affected by an existing complaint join it
-- instead of filing a duplicate. One row per citizen per complaint.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.complaint_supporters (
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (complaint_id, citizen_id)
);

CREATE INDEX IF NOT EXISTS idx_complaint_supporters_citizen ON public.complaint_supporters(citizen_id);

ALTER TABLE public.complaint_supporters ENABLE ROW LEVEL SECURITY;

-- Support counts are not sensitive: any signed-in user may read them
CREATE POLICY "Supporters readable by authenticated users"
    ON public.complaint_supporters FOR SELECT
    TO authenticated
    USING (true);

-- Citizens can only add or remove their own support
CREATE POLICY "Citizens manage own support"
    ON public.complaint_supporters FOR ALL
    TO authenticated
    USING (citizen_id = auth.uid())
    WITH CHECK (citizen_id = auth.uid() AND public.current_user_role() = 'citizen');
