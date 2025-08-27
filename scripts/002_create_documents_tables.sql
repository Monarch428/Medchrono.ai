-- Create documents table for storing document metadata and content
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  content TEXT, -- Extracted text content
  file_data BYTEA, -- Binary file data
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  key_findings JSONB DEFAULT '[]'::jsonb,
  timeline_events JSONB DEFAULT '[]'::jsonb,
  medical_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster case-based queries
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(processing_status);

-- Create document_processing_logs table for tracking processing steps
CREATE TABLE IF NOT EXISTS document_processing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL, -- started, completed, failed
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
