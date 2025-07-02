CREATE TABLE IF NOT EXISTS file_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE files ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES file_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_file_categories_class_id ON file_categories(class_id);
CREATE INDEX IF NOT EXISTS idx_files_category_id ON files(category_id);

INSERT INTO file_categories (name, description, class_id) 
SELECT 'General', 'General files', id FROM classes 
ON CONFLICT DO NOTHING;

alter publication supabase_realtime add table file_categories;
