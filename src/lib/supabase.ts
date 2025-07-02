import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
  signUp: async (
    email: string,
    password: string,
    userData: { name: string; role: string },
  ) => {
    // Generate random avatar on signup
    const randomSeed = Math.random().toString(36).substring(2, 15);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          avatar_url: avatarUrl,
        },
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Update avatar with real storage
  updateUserAvatar: async (userId: string, file: File) => {
    try {
      const fileExtension = file.name.split(".").pop();
      const fileName = `avatar-${userId}-${Date.now()}.${fileExtension}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        return { data: null, error: uploadError };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user record
      const { data, error } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if database update fails
        await supabase.storage.from("avatars").remove([filePath]);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error updating avatar:", error);
      return { data: null, error };
    }
  },

  // Get files with categories
  getClassFilesWithCategories: async (classIds?: string[]) => {
    let query = supabase
      .from("files")
      .select(
        `
        id,
        name,
        file_size,
        mime_type,
        file_path,
        created_at,
        classes (
          name
        ),
        users!files_uploaded_by_fkey (
          name
        ),
        file_categories (
          id,
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (classIds && classIds.length > 0) {
      query = query.in("class_id", classIds);
    }

    const { data, error } = await query;
    return { data, error };
  },
};

// Database helper functions
export const db = {
  // File category management
  createFileCategory: async (categoryData: {
    name: string;
    description?: string;
    class_id: string;
  }) => {
    const { data, error } = await supabase
      .from("file_categories")
      .insert(categoryData)
      .select()
      .single();

    if (data && !error) {
      await db.logActivity("create", "file_category", data.id, data.name, {
        class_id: data.class_id,
      });
    }

    return { data, error };
  },

  updateFileCategory: async (
    categoryId: string,
    categoryData: {
      name?: string;
      description?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("file_categories")
      .update(categoryData)
      .eq("id", categoryId)
      .select()
      .single();

    if (data && !error) {
      await db.logActivity("update", "file_category", data.id, data.name, {
        changes: categoryData,
      });
    }

    return { data, error };
  },

  deleteFileCategory: async (categoryId: string) => {
    // Get category data before deletion for logging
    const { data: categoryData } = await supabase
      .from("file_categories")
      .select("name, class_id")
      .eq("id", categoryId)
      .single();

    const { error } = await supabase
      .from("file_categories")
      .delete()
      .eq("id", categoryId);

    if (!error && categoryData) {
      await db.logActivity(
        "delete",
        "file_category",
        categoryId,
        categoryData.name,
        {
          class_id: categoryData.class_id,
        },
      );
    }

    return { error };
  },

  getFileCategories: async (classId?: string) => {
    let query = supabase.from("file_categories").select("*").order("name");

    if (classId) {
      query = query.eq("class_id", classId);
    }

    const { data, error } = await query;
    return { data, error };
  },
  // Create a new user (admin function)
  createUser: async (userData: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => {
    try {
      // Generate random avatar for new user
      const randomSeed = Math.random().toString(36).substring(2, 15);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

      // Use Supabase auth to create the user with proper authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            avatar_url: avatarUrl,
          },
        },
      });

      if (authError) {
        console.error("Auth signup error:", authError);
        return { data: null, error: authError };
      }

      if (!authData.user) {
        return { data: null, error: { message: "Failed to create user" } };
      }

      // The trigger will automatically create the user in public.users
      // Wait a moment and then fetch the user data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const { data: userData2, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", userData.email)
        .single();

      if (userError) {
        console.error("User fetch error:", userError);
        return { data: null, error: userError };
      }

      // Log the activity
      await db.logActivity("create", "user", userData2.id, userData2.name, {
        role: userData2.role,
        email: userData2.email,
      });

      return { data: userData2, error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { data: null, error };
    }
  },

  // Delete a user (admin function)
  deleteUser: async (userId: string) => {
    try {
      // Get user data before deletion for logging
      const { data: userData } = await supabase
        .from("users")
        .select("name, email, role")
        .eq("id", userId)
        .single();

      // Delete from public.users directly
      const { error } = await supabase.from("users").delete().eq("id", userId);

      if (error) {
        console.error("User delete error:", error);
        return { error };
      }

      // Log the activity
      if (userData) {
        await db.logActivity("delete", "user", userId, userData.name, {
          role: userData.role,
          email: userData.email,
        });
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { error };
    }
  },
  // Get user's enrolled classes (for students)
  getUserClasses: async (userId: string, role: string) => {
    if (role === "student") {
      const { data, error } = await supabase
        .from("class_enrollments")
        .select(
          `
          classes (
            id,
            name,
            description,
            room,
            users!classes_teacher_id_fkey (
              name
            )
          )
        `,
        )
        .eq("student_id", userId);
      return { data, error };
    } else if (role === "teacher") {
      const { data, error } = await supabase
        .from("classes")
        .select(
          `
          id,
          name,
          description,
          room,
          class_enrollments(count)
        `,
        )
        .eq("teacher_id", userId);
      return { data, error };
    } else {
      // Admin gets all classes
      const { data, error } = await supabase.from("classes").select(`
          id,
          name,
          description,
          room,
          users!classes_teacher_id_fkey (
            name
          ),
          class_enrollments(count)
        `);
      return { data, error };
    }
  },

  // Get class schedules
  getClassSchedules: async (classIds?: string[]) => {
    let query = supabase.from("schedules").select(`
        id,
        day_of_week,
        start_time,
        end_time,
        room,
        classes (
          name
        )
      `);

    if (classIds && classIds.length > 0) {
      query = query.in("class_id", classIds);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get announcements
  getAnnouncements: async (classIds?: string[]) => {
    let query = supabase
      .from("announcements")
      .select(
        `
        id,
        title,
        content,
        created_at,
        classes (
          name
        ),
        users!announcements_author_id_fkey (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (classIds && classIds.length > 0) {
      query = query.in("class_id", classIds);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get student grades with exam information
  getStudentGrades: async (studentId: string, classIds?: string[]) => {
    let query = supabase
      .from("grades")
      .select(
        `
        id,
        grade,
        created_at,
        exams (
          id,
          name,
          max_grade,
          class_id,
          classes (
            name
          )
        )
      `,
      )
      .eq("student_id", studentId);

    const { data, error } = await query;

    if (error) return { data: null, error };

    // Filter by class IDs if provided
    if (classIds && classIds.length > 0 && data) {
      const filteredData = data.filter(
        (grade) => grade.exams && classIds.includes(grade.exams.class_id),
      );
      return { data: filteredData, error: null };
    }

    return { data, error };
  },

  // Get class files
  getClassFiles: async (classIds?: string[]) => {
    let query = supabase
      .from("files")
      .select(
        `
        id,
        name,
        file_size,
        mime_type,
        created_at,
        classes (
          name
        ),
        users!files_uploaded_by_fkey (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (classIds && classIds.length > 0) {
      query = query.in("class_id", classIds);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get all users (for admin)
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });
    return { data, error };
  },

  // Get all classes (for admin)
  getAllClasses: async () => {
    const { data, error } = await supabase.from("classes").select(`
        id,
        name,
        description,
        room,
        users!classes_teacher_id_fkey (
          name
        ),
        class_enrollments(count)
      `);
    return { data, error };
  },

  // Get all schedules (for admin)
  getAllSchedules: async () => {
    const { data, error } = await supabase
      .from("schedules")
      .select(
        `
        id,
        day_of_week,
        start_time,
        end_time,
        room,
        classes (
          name
        )
      `,
      )
      .order("day_of_week");
    return { data, error };
  },

  // Create a new class
  createClass: async (classData: {
    name: string;
    description?: string;
    teacher_id?: string;
    room?: string;
  }) => {
    const { data, error } = await supabase
      .from("classes")
      .insert(classData)
      .select()
      .single();

    if (data && !error) {
      // Log the activity
      await db.logActivity("create", "class", data.id, data.name, {
        room: data.room,
        teacher_id: data.teacher_id,
      });
    }

    return { data, error };
  },

  // Update a class
  updateClass: async (
    classId: string,
    classData: {
      name?: string;
      description?: string;
      teacher_id?: string;
      room?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("classes")
      .update(classData)
      .eq("id", classId)
      .select()
      .single();

    if (data && !error) {
      // Log the activity
      await db.logActivity("update", "class", data.id, data.name, {
        changes: classData,
      });
    }

    return { data, error };
  },

  // Delete a class
  deleteClass: async (classId: string) => {
    // Get class data before deletion for logging
    const { data: classData } = await supabase
      .from("classes")
      .select("name, room")
      .eq("id", classId)
      .single();

    const { error } = await supabase.from("classes").delete().eq("id", classId);

    if (!error && classData) {
      // Log the activity
      await db.logActivity("delete", "class", classId, classData.name, {
        room: classData.room,
      });
    }

    return { error };
  },

  // Create a new announcement
  createAnnouncement: async (announcementData: {
    title: string;
    content: string;
    class_id?: string;
    author_id: string;
  }) => {
    const { data, error } = await supabase
      .from("announcements")
      .insert(announcementData)
      .select()
      .single();

    if (data && !error) {
      // Log the activity
      await db.logActivity("create", "announcement", data.id, data.title, {
        class_id: data.class_id,
      });
    }

    return { data, error };
  },

  // Update an announcement
  updateAnnouncement: async (
    announcementId: string,
    announcementData: {
      title?: string;
      content?: string;
      class_id?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("announcements")
      .update(announcementData)
      .eq("id", announcementId)
      .select()
      .single();
    return { data, error };
  },

  // Delete an announcement
  deleteAnnouncement: async (announcementId: string) => {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementId);
    return { error };
  },

  // Update a user
  updateUser: async (
    userId: string,
    userData: {
      name?: string;
      email?: string;
      role?: string;
      avatar_url?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", userId)
      .select()
      .single();

    if (data && !error) {
      // Log the activity
      await db.logActivity("update", "user", data.id, data.name, {
        changes: userData,
      });
    }

    return { data, error };
  },

  // Create a schedule
  createSchedule: async (scheduleData: {
    class_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room?: string;
  }) => {
    const { data, error } = await supabase
      .from("schedules")
      .insert(scheduleData)
      .select(
        `
        *,
        classes(name)
      `,
      )
      .single();

    if (data && !error) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      // Log the activity
      await db.logActivity(
        "create",
        "schedule",
        data.id,
        `${data.classes?.name || "Class"} - ${dayNames[data.day_of_week]}`,
        {
          day: dayNames[data.day_of_week],
          time: `${data.start_time} - ${data.end_time}`,
          room: data.room,
        },
      );
    }

    return { data, error };
  },

  // Update a schedule
  updateSchedule: async (
    scheduleId: string,
    scheduleData: {
      class_id?: string;
      day_of_week?: number;
      start_time?: string;
      end_time?: string;
      room?: string;
    },
  ) => {
    const { data, error } = await supabase
      .from("schedules")
      .update(scheduleData)
      .eq("id", scheduleId)
      .select(
        `
        *,
        classes(name)
      `,
      )
      .single();

    if (data && !error) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      // Log the activity
      await db.logActivity(
        "update",
        "schedule",
        data.id,
        `${data.classes?.name || "Class"} - ${dayNames[data.day_of_week]}`,
        { changes: scheduleData },
      );
    }

    return { data, error };
  },

  // Delete a schedule
  deleteSchedule: async (scheduleId: string) => {
    // Get schedule data before deletion for logging
    const { data: scheduleData } = await supabase
      .from("schedules")
      .select(
        `
        *,
        classes(name)
      `,
      )
      .eq("id", scheduleId)
      .single();

    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", scheduleId);

    if (!error && scheduleData) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      // Log the activity
      await db.logActivity(
        "delete",
        "schedule",
        scheduleId,
        `${scheduleData.classes?.name || "Class"} - ${dayNames[scheduleData.day_of_week]}`,
        {
          day: dayNames[scheduleData.day_of_week],
          time: `${scheduleData.start_time} - ${scheduleData.end_time}`,
          room: scheduleData.room,
        },
      );
    }

    return { error };
  },

  // Enroll student in class
  enrollStudent: async (studentId: string, classId: string) => {
    const { data, error } = await supabase
      .from("class_enrollments")
      .insert({ student_id: studentId, class_id: classId })
      .select(
        `
        *,
        users(name),
        classes(name)
      `,
      )
      .single();

    if (data && !error) {
      // Log the activity
      await db.logActivity(
        "create",
        "enrollment",
        data.id,
        `${data.users?.name} enrolled in ${data.classes?.name}`,
        { student_id: studentId, class_id: classId },
      );
    }

    return { data, error };
  },

  // Remove student from class
  removeStudentFromClass: async (studentId: string, classId: string) => {
    // Get enrollment data before deletion for logging
    const { data: enrollmentData } = await supabase
      .from("class_enrollments")
      .select(
        `
        *,
        users(name),
        classes(name)
      `,
      )
      .eq("student_id", studentId)
      .eq("class_id", classId)
      .single();

    const { error } = await supabase
      .from("class_enrollments")
      .delete()
      .eq("student_id", studentId)
      .eq("class_id", classId);

    if (!error && enrollmentData) {
      // Log the activity
      await db.logActivity(
        "delete",
        "enrollment",
        enrollmentData.id,
        `${enrollmentData.users?.name} removed from ${enrollmentData.classes?.name}`,
        { student_id: studentId, class_id: classId },
      );
    }

    return { error };
  },

  // Get students enrolled in a class
  getClassStudents: async (classId: string) => {
    const { data, error } = await supabase
      .from("class_enrollments")
      .select(
        `
        users (
          id,
          name,
          email,
          avatar_url
        )
      `,
      )
      .eq("class_id", classId);
    return { data, error };
  },

  // Get activity logs (for admin)
  getActivityLogs: async (limit: number = 50) => {
    const { data, error } = await supabase
      .from("activity_logs")
      .select(
        `
        *,
        users(name)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Create an exam
  createExam: async (examData: {
    name: string;
    class_id: string;
    max_grade?: number;
  }) => {
    try {
      const { data, error } = await supabase.rpc("handle_create_exam", {
        p_name: examData.name,
        p_class_id: examData.class_id,
        p_max_grade: examData.max_grade || 100,
      });

      if (error) {
        console.error("Error creating exam:", error);
        return { data: null, error };
      }

      // Fetch the created exam data
      const { data: examData2, error: fetchError } = await supabase
        .from("exams")
        .select("*")
        .eq("id", data)
        .single();

      return { data: examData2, error: fetchError };
    } catch (error) {
      console.error("Unexpected error creating exam:", error);
      return { data: null, error };
    }
  },

  // Get exams for a class
  getClassExams: async (classId: string) => {
    const { data, error } = await supabase
      .from("exams")
      .select(
        `
        id,
        name,
        max_grade,
        created_at,
        classes (
          name
        )
      `,
      )
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get all exams for teacher/admin
  getAllExams: async (classIds?: string[]) => {
    let query = supabase
      .from("exams")
      .select(
        `
        id,
        name,
        max_grade,
        created_at,
        class_id,
        classes (
          name
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (classIds && classIds.length > 0) {
      query = query.in("class_id", classIds);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Add or update a grade for a student on an exam
  addOrUpdateGrade: async (gradeData: {
    exam_id: string;
    student_id: string;
    grade: number;
    graded_by: string;
  }) => {
    const { data, error } = await supabase
      .from("grades")
      .upsert({
        exam_id: gradeData.exam_id,
        student_id: gradeData.student_id,
        grade: gradeData.grade,
        graded_by: gradeData.graded_by,
      })
      .select(
        `
        *,
        exams (
          name,
          classes (
            name
          )
        ),
        users!grades_student_id_fkey (
          name
        )
      `,
      )
      .single();

    if (data && !error) {
      await db.logActivity(
        "create",
        "grade",
        data.id,
        `${data.users?.name} - ${data.exams?.name}`,
        {
          grade: data.grade,
          exam: data.exams?.name,
          class: data.exams?.classes?.name,
        },
      );
    }

    return { data, error };
  },

  // Get grades for an exam
  getExamGrades: async (examId: string) => {
    const { data, error } = await supabase
      .from("grades")
      .select(
        `
        id,
        grade,
        created_at,
        users!grades_student_id_fkey (
          id,
          name,
          email
        ),
        exams (
          name,
          max_grade
        )
      `,
      )
      .eq("exam_id", examId)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  // Get students in a class with their grades for a specific exam
  getClassStudentsWithGrades: async (classId: string, examId?: string) => {
    // First get all students in the class
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("class_enrollments")
      .select(
        `
        users (
          id,
          name,
          email,
          avatar_url
        )
      `,
      )
      .eq("class_id", classId);

    if (enrollmentError) return { data: null, error: enrollmentError };

    const students = enrollments?.map((e) => e.users).filter(Boolean) || [];

    // If examId is provided, get grades for that exam
    if (examId) {
      const { data: grades, error: gradesError } = await supabase
        .from("grades")
        .select("student_id, grade")
        .eq("exam_id", examId);

      if (gradesError) return { data: null, error: gradesError };

      // Merge students with their grades
      const studentsWithGrades = students.map((student) => {
        const grade = grades?.find((g) => g.student_id === student.id);
        return {
          ...student,
          grade: grade?.grade || null,
        };
      });

      return { data: studentsWithGrades, error: null };
    }

    return { data: students, error: null };
  },

  // Delete an exam
  deleteExam: async (examId: string) => {
    // Get exam data before deletion for logging
    const { data: examData } = await supabase
      .from("exams")
      .select(
        `
        name,
        classes (
          name
        )
      `,
      )
      .eq("id", examId)
      .single();

    const { error } = await supabase.from("exams").delete().eq("id", examId);

    if (!error && examData) {
      await db.logActivity("delete", "exam", examId, examData.name, {
        class: examData.classes?.name,
      });
    }

    return { error };
  },

  // Log activity function
  logActivity: async (
    action: string,
    entityType: string,
    entityId: string,
    entityName: string,
    details?: any,
  ) => {
    try {
      const { data, error } = await supabase.rpc("log_activity", {
        p_action: action,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_entity_name: entityName,
        p_details: details || null,
      });

      if (error) {
        console.error("Error logging activity:", error);
      }

      return { data, error };
    } catch (error) {
      console.error("Unexpected error logging activity:", error);
      return { data: null, error };
    }
  },

  // Upload file for teachers with real storage
  uploadFile: async (fileData: {
    file: File;
    class_id: string;
    uploaded_by: string;
    name?: string;
    category_id?: string;
  }) => {
    try {
      const fileName = fileData.name || fileData.file.name;
      const fileSize = fileData.file.size;
      const mimeType = fileData.file.type;
      const fileExtension = fileName.split(".").pop();
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
      const filePath = `class-files/${fileData.class_id}/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("files")
        .upload(filePath, fileData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        return { data: null, error: uploadError };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("files").getPublicUrl(filePath);

      // Insert file record into database
      const { data, error } = await supabase
        .from("files")
        .insert({
          name: fileName,
          file_path: publicUrl,
          file_size: fileSize,
          mime_type: mimeType,
          class_id: fileData.class_id,
          uploaded_by: fileData.uploaded_by,
          category_id: fileData.category_id || null,
        })
        .select()
        .single();

      if (error) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from("files").remove([filePath]);
        console.error("File database insert error:", error);
        return { data: null, error };
      }

      // Log the activity
      await db.logActivity("create", "file", data.id, fileName, {
        class_id: fileData.class_id,
        file_size: fileSize,
        category_id: fileData.category_id,
      });

      return { data, error: null };
    } catch (error) {
      console.error("Unexpected error uploading file:", error);
      return { data: null, error };
    }
  },

  // Download file for students
  downloadFile: async (fileId: string) => {
    try {
      // Get file information from database
      const { data: fileData, error } = await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .single();

      if (error) {
        console.error("File download error:", error);
        return { data: null, error };
      }

      // Return file data with public URL for download
      return { data: fileData, error: null };
    } catch (error) {
      console.error("Unexpected error downloading file:", error);
      return { data: null, error };
    }
  },

  // Delete file
  deleteFile: async (fileId: string) => {
    try {
      // Get file data before deletion for logging and storage cleanup
      const { data: fileData } = await supabase
        .from("files")
        .select("name, class_id, file_path")
        .eq("id", fileId)
        .single();

      if (fileData) {
        // Extract storage path from public URL
        const url = new URL(fileData.file_path);
        const pathParts = url.pathname.split("/");
        const storagePath = pathParts
          .slice(pathParts.indexOf("class-files"))
          .join("/");

        // Delete from storage
        await supabase.storage.from("files").remove([storagePath]);
      }

      // Delete from database
      const { error } = await supabase.from("files").delete().eq("id", fileId);

      if (error) {
        console.error("File delete error:", error);
        return { error };
      }

      // Log the activity
      if (fileData) {
        await db.logActivity("delete", "file", fileId, fileData.name, {
          class_id: fileData.class_id,
        });
      }

      return { error: null };
    } catch (error) {
      console.error("Unexpected error deleting file:", error);
      return { error };
    }
  },
};

// Helper function to calculate grade average
const calculateGradeAverage = (studentGrades: any[]) => {
  if (!studentGrades.length) return 0;
  const total = studentGrades.reduce((sum, grade) => {
    const maxGrade = grade.exams?.max_grade || 100;
    return sum + (grade.grade / maxGrade) * 100;
  }, 0);
  return Math.round(total / studentGrades.length);
};
