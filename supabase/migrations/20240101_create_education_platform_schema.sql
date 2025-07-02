-- Create users table to mirror auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for users table
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
CREATE POLICY "Users can view all users"
ON public.users FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users"
ON public.users FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
ON public.users FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for classes table
DROP POLICY IF EXISTS "Classes are viewable by everyone" ON public.classes;
CREATE POLICY "Classes are viewable by everyone"
ON public.classes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Teachers can update their classes" ON public.classes;
CREATE POLICY "Teachers can update their classes"
ON public.classes FOR UPDATE
USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all classes" ON public.classes;
CREATE POLICY "Admins can manage all classes"
ON public.classes FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create class_enrollments table (many-to-many relationship between students and classes)
CREATE TABLE IF NOT EXISTS public.class_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Create policies for class_enrollments table
DROP POLICY IF EXISTS "Enrollments are viewable by everyone" ON public.class_enrollments;
CREATE POLICY "Enrollments are viewable by everyone"
ON public.class_enrollments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.class_enrollments;
CREATE POLICY "Admins can manage enrollments"
ON public.class_enrollments FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for schedules table
DROP POLICY IF EXISTS "Schedules are viewable by everyone" ON public.schedules;
CREATE POLICY "Schedules are viewable by everyone"
ON public.schedules FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage schedules" ON public.schedules;
CREATE POLICY "Admins can manage schedules"
ON public.schedules FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for announcements table
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements are viewable by everyone"
ON public.announcements FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Teachers can manage their announcements" ON public.announcements;
CREATE POLICY "Teachers can manage their announcements"
ON public.announcements FOR ALL
USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all announcements" ON public.announcements;
CREATE POLICY "Admins can manage all announcements"
ON public.announcements FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create grades table
CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  assignment_name TEXT NOT NULL,
  grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 100),
  max_grade DECIMAL(5,2) DEFAULT 100,
  graded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for grades table
DROP POLICY IF EXISTS "Students can view their own grades" ON public.grades;
CREATE POLICY "Students can view their own grades"
ON public.grades FOR SELECT
USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can manage grades for their classes" ON public.grades;
CREATE POLICY "Teachers can manage grades for their classes"
ON public.grades FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.classes 
  WHERE id = class_id AND teacher_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can manage all grades" ON public.grades;
CREATE POLICY "Admins can manage all grades"
ON public.grades FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Create files table
CREATE TABLE IF NOT EXISTS public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create policies for files table
DROP POLICY IF EXISTS "Files are viewable by everyone" ON public.files;
CREATE POLICY "Files are viewable by everyone"
ON public.files FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Teachers can manage files for their classes" ON public.files;
CREATE POLICY "Teachers can manage files for their classes"
ON public.files FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.classes 
  WHERE id = class_id AND teacher_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can manage all files" ON public.files;
CREATE POLICY "Admins can manage all files"
ON public.files FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Enable realtime for all tables (only if not already added)
DO $$
BEGIN
  -- Add tables to realtime publication if not already present
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'classes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE classes;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'class_enrollments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE class_enrollments;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'schedules'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'grades'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE grades;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'files'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE files;
  END IF;
END $$;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a new user (for admin use)
CREATE OR REPLACE FUNCTION public.create_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_user_id
  FROM public.users
  WHERE email = user_email;
  
  IF new_user_id IS NOT NULL THEN
    RETURN json_build_object('error', 'User already exists');
  END IF;
  
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Insert into public.users
  INSERT INTO public.users (id, name, email, role, avatar_url)
  VALUES (
    new_user_id,
    user_name,
    user_email,
    user_role,
    CONCAT('https://api.dicebear.com/7.x/avataaars/svg?seed=', user_email)
  );
  
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'message', 'User created successfully'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample data
INSERT INTO public.classes (name, description, room) VALUES
  ('Mathematics 101', 'Introduction to Algebra and Geometry', 'Room 101'),
  ('Physics 202', 'Classical Mechanics and Thermodynamics', 'Room 202'),
  ('Literature 303', 'Modern American Literature', 'Room 303'),
  ('Computer Science 404', 'Data Structures and Algorithms', 'Room 404');

-- Insert sample schedules
INSERT INTO public.schedules (class_id, day_of_week, start_time, end_time, room)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN 1 -- Monday
    WHEN c.name = 'Physics 202' THEN 2 -- Tuesday
    WHEN c.name = 'Literature 303' THEN 3 -- Wednesday
    WHEN c.name = 'Computer Science 404' THEN 1 -- Monday
  END,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN '10:00:00'::time
    WHEN c.name = 'Physics 202' THEN '13:00:00'::time
    WHEN c.name = 'Literature 303' THEN '14:30:00'::time
    WHEN c.name = 'Computer Science 404' THEN '09:00:00'::time
  END,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN '11:30:00'::time
    WHEN c.name = 'Physics 202' THEN '14:30:00'::time
    WHEN c.name = 'Literature 303' THEN '16:00:00'::time
    WHEN c.name = 'Computer Science 404' THEN '10:30:00'::time
  END,
  c.room
FROM public.classes c;

-- Add Wednesday schedule for Mathematics and Friday for Literature
INSERT INTO public.schedules (class_id, day_of_week, start_time, end_time, room)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN 3 -- Wednesday
    WHEN c.name = 'Literature 303' THEN 5 -- Friday
    WHEN c.name = 'Physics 202' THEN 4 -- Thursday
    WHEN c.name = 'Computer Science 404' THEN 4 -- Thursday
  END,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN '10:00:00'::time
    WHEN c.name = 'Literature 303' THEN '14:30:00'::time
    WHEN c.name = 'Physics 202' THEN '13:00:00'::time
    WHEN c.name = 'Computer Science 404' THEN '09:00:00'::time
  END,
  CASE 
    WHEN c.name = 'Mathematics 101' THEN '11:30:00'::time
    WHEN c.name = 'Literature 303' THEN '16:00:00'::time
    WHEN c.name = 'Physics 202' THEN '14:30:00'::time
    WHEN c.name = 'Computer Science 404' THEN '10:30:00'::time
  END,
  c.room
FROM public.classes c;

-- Create sample users directly in public.users
DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  teacher1_id UUID := gen_random_uuid();
  teacher2_id UUID := gen_random_uuid();
  teacher3_id UUID := gen_random_uuid();
  teacher4_id UUID := gen_random_uuid();
  student1_id UUID := gen_random_uuid();
  student2_id UUID := gen_random_uuid();
  student3_id UUID := gen_random_uuid();
  student4_id UUID := gen_random_uuid();
  student5_id UUID := gen_random_uuid();
BEGIN
  -- Insert sample users into public.users only if they don't exist
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT admin_id, 'Admin User', 'admin@school.edu', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@school.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@school.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT teacher1_id, 'Dr. Sarah Johnson', 'sarah.johnson@school.edu', 'teacher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.johnson@school.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'sarah.johnson@school.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT teacher2_id, 'Prof. Michael Chen', 'michael.chen@school.edu', 'teacher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael.chen@school.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'michael.chen@school.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT teacher3_id, 'Ms. Emily Davis', 'emily.davis@school.edu', 'teacher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily.davis@school.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'emily.davis@school.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT teacher4_id, 'Dr. Robert Wilson', 'robert.wilson@school.edu', 'teacher', 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert.wilson@school.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'robert.wilson@school.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT student1_id, 'Alice Smith', 'alice.smith@student.edu', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice.smith@student.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'alice.smith@student.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT student2_id, 'Bob Johnson', 'bob.johnson@student.edu', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob.johnson@student.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'bob.johnson@student.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT student3_id, 'Carol Williams', 'carol.williams@student.edu', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol.williams@student.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'carol.williams@student.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT student4_id, 'David Brown', 'david.brown@student.edu', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david.brown@student.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'david.brown@student.edu');
  
  INSERT INTO public.users (id, name, email, role, avatar_url)
  SELECT student5_id, 'Eva Martinez', 'eva.martinez@student.edu', 'student', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eva.martinez@student.edu'
  WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'eva.martinez@student.edu');
END $$;

-- Update classes with proper teacher assignments
UPDATE public.classes 
SET teacher_id = (SELECT id FROM public.users WHERE email = 'sarah.johnson@school.edu' LIMIT 1)
WHERE name = 'Mathematics 101';

UPDATE public.classes 
SET teacher_id = (SELECT id FROM public.users WHERE email = 'michael.chen@school.edu' LIMIT 1)
WHERE name = 'Physics 202';

UPDATE public.classes 
SET teacher_id = (SELECT id FROM public.users WHERE email = 'emily.davis@school.edu' LIMIT 1)
WHERE name = 'Literature 303';

UPDATE public.classes 
SET teacher_id = (SELECT id FROM public.users WHERE email = 'robert.wilson@school.edu' LIMIT 1)
WHERE name = 'Computer Science 404';

-- Insert sample enrollments (prevent duplicates)
INSERT INTO public.class_enrollments (student_id, class_id)
SELECT s.id, c.id
FROM public.users s
CROSS JOIN public.classes c
WHERE s.role = 'student'
AND c.name IN ('Mathematics 101', 'Physics 202')
ON CONFLICT (student_id, class_id) DO NOTHING;

-- Insert sample announcements (prevent duplicates)
INSERT INTO public.announcements (title, content, class_id, author_id)
SELECT 
  'Welcome to ' || c.name,
  'Welcome to the new semester! Please check the syllabus and be prepared for our first class.',
  c.id,
  c.teacher_id
FROM public.classes c
WHERE c.teacher_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.announcements a 
  WHERE a.class_id = c.id AND a.title = 'Welcome to ' || c.name
);

-- Insert sample grades (prevent duplicates)
INSERT INTO public.grades (student_id, class_id, assignment_name, grade, graded_by)
SELECT 
  e.student_id,
  e.class_id,
  'Assignment 1',
  85 + (RANDOM() * 15)::INTEGER,
  c.teacher_id
FROM public.class_enrollments e
JOIN public.classes c ON e.class_id = c.id
WHERE c.teacher_id IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.grades g 
  WHERE g.student_id = e.student_id 
  AND g.class_id = e.class_id 
  AND g.assignment_name = 'Assignment 1'
);