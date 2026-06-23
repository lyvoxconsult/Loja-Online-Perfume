-- Add notes field to lessons table for agenda observations
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add student_name for easier querying (optional - we already have profiles join)
-- ALTER TABLE lessons ADD COLUMN IF NOT EXISTS student_name TEXT;

-- Create index for scheduled_at for better calendar performance
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at ON lessons(scheduled_at);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);

-- Enable RLS on lessons (if not already enabled)
-- ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Policy for gestor (all access) - already exists likely
-- Policy for student (own only) - create if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'students_can_view_own_lessons'
  ) THEN
    CREATE POLICY students_can_view_own_lessons ON lessons
      FOR SELECT
      TO authenticated
      USING (auth.uid() = student_id);
  END IF;
END $$;