-- Adding document processing logs table for tracking processing steps
CREATE TABLE IF NOT EXISTS document_processing_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adding missing columns to documents table for complete medical analysis
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS medical_data JSONB,
ADD COLUMN IF NOT EXISTS missing_records JSONB;

-- Adding index for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_processing_status ON documents(processing_status);
CREATE INDEX IF NOT EXISTS idx_processing_logs_document_id ON document_processing_logs(document_id);
