-- ==============================================================================
-- 003_analytics_views.sql
-- Analytics & Reporting Views for Admin Dashboard
-- ==============================================================================

-- 1. Complaints by Category
CREATE OR REPLACE VIEW public.view_complaints_by_category AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    c.icon AS category_icon,
    COUNT(comp.id) AS total_count
FROM public.categories c
LEFT JOIN public.complaints comp ON comp.category_id = c.id
GROUP BY c.id, c.name, c.icon
ORDER BY total_count DESC;

-- 2. Complaints by Status
CREATE OR REPLACE VIEW public.view_complaints_by_status AS
SELECT 
    status,
    COUNT(*) AS total_count
FROM public.complaints
GROUP BY status;

-- 3. Complaints per Week (Weekly intake trend)
CREATE OR REPLACE VIEW public.view_complaints_per_week AS
SELECT 
    date_trunc('week', created_at) AS week_start,
    to_char(date_trunc('week', created_at), 'DD Mon') AS week_label,
    COUNT(*) AS total_count
FROM public.complaints
WHERE created_at >= (now() - INTERVAL '8 weeks')
GROUP BY date_trunc('week', created_at)
ORDER BY week_start ASC;

-- 4. Complaints by Ward
CREATE OR REPLACE VIEW public.view_complaints_by_ward AS
SELECT 
    COALESCE(ward, 'Unassigned') AS ward,
    COUNT(*) AS total_count
FROM public.complaints
GROUP BY ward
ORDER BY total_count DESC;

-- 5. Officer Performance Metrics
CREATE OR REPLACE VIEW public.view_officer_performance AS
SELECT 
    p.id AS officer_id,
    p.full_name,
    d.name AS department_name,
    p.ward,
    COUNT(c.id) FILTER (WHERE c.status IN ('resolved', 'closed')) AS resolved_count,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (c.resolved_at - c.created_at)) / 3600.0) 
        FILTER (WHERE c.resolved_at IS NOT NULL)::numeric, 
        1
    ) AS avg_resolution_hours,
    ROUND(
        AVG(f.rating)::numeric, 
        1
    ) AS avg_rating,
    COUNT(c.id) FILTER (
        WHERE c.due_at < now() 
        AND c.status IN ('submitted', 'assigned', 'in_progress', 'reopened')
    ) AS overdue_count
FROM public.profiles p
JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.complaints c ON c.assigned_officer_id = p.id
LEFT JOIN public.feedback f ON f.complaint_id = c.id
WHERE p.role = 'officer'
GROUP BY p.id, p.full_name, d.name, p.ward
ORDER BY resolved_count DESC;

-- 6. Overall City KPIs
CREATE OR REPLACE VIEW public.view_overall_kpis AS
SELECT 
    COUNT(*) AS total_complaints,
    COUNT(*) FILTER (WHERE status IN ('submitted', 'assigned', 'in_progress', 'reopened')) AS open_complaints,
    ROUND(
        AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600.0) 
        FILTER (WHERE resolved_at IS NOT NULL)::numeric, 
        1
    ) AS avg_resolution_hours,
    COALESCE(
        ROUND(
            (100.0 * COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND (due_at IS NULL OR resolved_at <= due_at)) /
            NULLIF(COUNT(*) FILTER (WHERE resolved_at IS NOT NULL), 0))::numeric,
            1
        ),
        100.0
    ) AS pct_within_sla,
    COALESCE(
        ROUND((SELECT AVG(rating)::numeric FROM public.feedback), 1),
        5.0
    ) AS avg_rating
FROM public.complaints;
