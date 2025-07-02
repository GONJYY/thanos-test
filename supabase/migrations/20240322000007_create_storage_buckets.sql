-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('class-files', 'class-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the class-files bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'class-files');
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'class-files' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE USING (bucket_id = 'class-files' AND auth.uid() = owner);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE USING (bucket_id = 'class-files' AND auth.uid() = owner);

-- Enable realtime for activity_logs table (conditional check)
DO $
BEGIN
    -- Check if activity_logs table exists and is not already in the publication
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs' AND table_schema = 'public')
       AND NOT EXISTS (
           SELECT 1 FROM pg_publication_tables 
           WHERE pubname = 'supabase_realtime' 
           AND tablename = 'activity_logs'
           AND schemaname = 'public'
       ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
    END IF;
END $;