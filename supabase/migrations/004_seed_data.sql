-- ==============================================================================
-- 004_seed_data.sql
-- Seed Departments, Categories, Subcategories, and Admin Setup Helper
-- ==============================================================================

-- 1. Seed Municipal Departments
INSERT INTO public.departments (id, name) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Public Works (Roads & Bridges)'),
    ('11111111-1111-1111-1111-111111111102', 'Sanitation & Solid Waste Management'),
    ('11111111-1111-1111-1111-111111111103', 'Water Supply & Sewerage Board'),
    ('11111111-1111-1111-1111-111111111104', 'Electricity & Public Lighting'),
    ('11111111-1111-1111-1111-111111111105', 'Stormwater Drainage & Flood Control'),
    ('11111111-1111-1111-1111-111111111106', 'Horticulture & Urban Parks'),
    ('11111111-1111-1111-1111-111111111107', 'Traffic & Transport Management'),
    ('11111111-1111-1111-1111-111111111108', 'Town Planning & Anti-Encroachment'),
    ('11111111-1111-1111-1111-111111111109', 'Pollution Control & Environment'),
    ('11111111-1111-1111-1111-111111111110', 'General Civic Administration')
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name;

-- 2. Seed Categories with Department Mapping
INSERT INTO public.categories (id, name, icon, department_id) VALUES
    ('22222222-2222-2222-2222-222222222201', 'Roads', '🛣️', '11111111-1111-1111-1111-111111111101'),
    ('22222222-2222-2222-2222-222222222202', 'Sanitation', '🗑️', '11111111-1111-1111-1111-111111111102'),
    ('22222222-2222-2222-2222-222222222203', 'Water supply', '💧', '11111111-1111-1111-1111-111111111103'),
    ('22222222-2222-2222-2222-222222222204', 'Electricity', '💡', '11111111-1111-1111-1111-111111111104'),
    ('22222222-2222-2222-2222-222222222205', 'Drainage', '🚰', '11111111-1111-1111-1111-111111111105'),
    ('22222222-2222-2222-2222-222222222206', 'Parks', '🌳', '11111111-1111-1111-1111-111111111106'),
    ('22222222-2222-2222-2222-222222222207', 'Traffic', '🚦', '11111111-1111-1111-1111-111111111107'),
    ('22222222-2222-2222-2222-222222222208', 'Encroachment', '🏗️', '11111111-1111-1111-1111-111111111108'),
    ('22222222-2222-2222-2222-222222222209', 'Noise/Pollution', '🔊', '11111111-1111-1111-1111-111111111109'),
    ('22222222-2222-2222-2222-222222222210', 'Other', '📋', '11111111-1111-1111-1111-111111111110')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon, department_id = EXCLUDED.department_id;

-- 3. Seed Realistic Subcategories
INSERT INTO public.subcategories (category_id, name) VALUES
    -- Roads
    ('22222222-2222-2222-2222-222222222201', 'Pothole or damaged road surface'),
    ('22222222-2222-2222-2222-222222222201', 'Broken or missing manhole cover'),
    ('22222222-2222-2222-2222-222222222201', 'Damaged speed breaker'),
    ('22222222-2222-2222-2222-222222222201', 'Damaged or missing street sign'),

    -- Sanitation
    ('22222222-2222-2222-2222-222222222202', 'Garbage dump not cleared'),
    ('22222222-2222-2222-2222-222222222202', 'Overflowing community dustbin'),
    ('22222222-2222-2222-2222-222222222202', 'Dead animal removal required'),
    ('22222222-2222-2222-2222-222222222202', 'Irregular door-to-door garbage collection'),

    -- Water supply
    ('22222222-2222-2222-2222-222222222203', 'No water supply in locality'),
    ('22222222-2222-2222-2222-222222222203', 'Contaminated / muddy tap water'),
    ('22222222-2222-2222-2222-222222222203', 'Water main pipe leak / burst'),
    ('22222222-2222-2222-2222-222222222203', 'Extremely low water pressure'),

    -- Electricity
    ('22222222-2222-2222-2222-222222222204', 'Streetlight flickering or completely dark'),
    ('22222222-2222-2222-2222-222222222204', 'Dangling live wire / electric pole hazard'),
    ('22222222-2222-2222-2222-222222222204', 'Transformer sparking / failure'),
    ('22222222-2222-2222-2222-222222222204', 'Unannounced extended power cut'),

    -- Drainage
    ('22222222-2222-2222-2222-222222222205', 'Clogged roadside drain causing waterlogging'),
    ('22222222-2222-2222-2222-222222222205', 'Open gutter emitting foul smell'),
    ('22222222-2222-2222-2222-222222222205', 'Sewage line backflow on street'),

    -- Parks
    ('22222222-2222-2222-2222-222222222206', 'Broken children play equipment / swing'),
    ('22222222-2222-2222-2222-222222222206', 'Overgrown grass and neglected park maintenance'),
    ('22222222-2222-2222-2222-222222222206', 'Dangerous hanging tree branch / fallen tree'),

    -- Traffic
    ('22222222-2222-2222-2222-222222222207', 'Traffic signal stuck or non-functional'),
    ('22222222-2222-2222-2222-222222222207', 'Illegal parking blocking emergency vehicular movement'),
    ('22222222-2222-2222-2222-222222222207', 'Missing pedestrian zebra crossing'),

    -- Encroachment
    ('22222222-2222-2222-2222-222222222208', 'Pedestrian footpath blocked by commercial stalls'),
    ('22222222-2222-2222-2222-222222222208', 'Unauthorized construction extending onto road'),
    ('22222222-2222-2222-2222-222222222208', 'Illegal commercial hoardings and banners'),

    -- Noise/Pollution
    ('22222222-2222-2222-2222-222222222209', 'Industrial toxic smoke / noxious fumes'),
    ('22222222-2222-2222-2222-222222222209', 'Heavy construction noise during prohibited night hours'),
    ('22222222-2222-2222-2222-222222222209', 'Illegal open burning of dry leaves and plastic'),

    -- Other
    ('22222222-2222-2222-2222-222222222210', 'General civic grievance'),
    ('22222222-2222-2222-2222-222222222210', 'Public health hazard inquiry');

-- 4. Storage Bucket Setup (complaint-photos)
-- Creates the public storage bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-photos', 'complaint-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
CREATE POLICY "Public Read Complaint Photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'complaint-photos');

CREATE POLICY "Authenticated Users Upload Complaint Photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'complaint-photos');
