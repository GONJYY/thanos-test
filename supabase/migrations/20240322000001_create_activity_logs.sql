-- Create activity_logs table to track all changes in the system
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  entity_type TEXT NOT NULL, -- 'user', 'class', 'schedule', 'announcement', 'enrollment'
  entity_id UUID, -- ID of the affected entity
  entity_name TEXT, -- Name/title of the affected entity for display
  details JSONB, -- Additional details about the change
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for activity_logs table
DROP POLICY IF EXISTS "Activity logs are viewable by admins" ON public.activity_logs;
CREATE POLICY "Activity logs are viewable by admins"
ON public.activity_logs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

DROP POLICY IF EXISTS "Activity logs can be inserted by authenticated users" ON public.activity_logs;
CREATE POLICY "Activity logs can be inserted by authenticated users"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for activity_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'activity_logs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
  END IF;
END $$;

-- Create function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_entity_name TEXT,
  p_details JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (
    action,
    entity_type,
    entity_id,
    entity_name,
    details,
    user_id
  ) VALUES (
    p_action,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_details,
    COALESCE(p_user_id, auth.uid())
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
