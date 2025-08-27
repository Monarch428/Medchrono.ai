-- Create chronology templates and entries tables
CREATE TABLE IF NOT EXISTS chronology_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id TEXT NOT NULL,
    patient_name TEXT,
    date_of_birth DATE,
    gender TEXT,
    case_details TEXT,
    incident_date DATE,
    past_medical_history TEXT,
    past_surgical_history TEXT,
    family_history TEXT,
    social_history TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chronology_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chronology_id UUID REFERENCES chronology_templates(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    provider_name TEXT,
    events TEXT NOT NULL,
    pdf_reference TEXT,
    document_id UUID REFERENCES documents(id),
    entry_type TEXT, -- 'police_report', 'ems', 'er_visit', 'follow_up', 'pt', 'imaging', 'other'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS missing_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chronology_id UUID REFERENCES chronology_templates(id) ON DELETE CASCADE,
    provider_name TEXT,
    date_range TEXT,
    records_required TEXT,
    significance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chronology_entries_chronology_id ON chronology_entries(chronology_id);
CREATE INDEX IF NOT EXISTS idx_chronology_entries_date ON chronology_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_missing_records_chronology_id ON missing_records(chronology_id);
