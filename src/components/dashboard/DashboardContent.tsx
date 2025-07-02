import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, db } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import {
  LineChart,
  BarChart,
  Calendar as CalendarIcon,
  Upload,
  FileText,
  Bell,
  Users,
  BookOpen,
  Clock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import ClassCard from "./ClassCard";

interface DashboardContentProps {
  activeTab?: string;
  userRole?: "student" | "teacher" | "admin";
  userId?: string;
}

const DashboardContent = ({
  activeTab = "overview",
  userRole = "student",
  userId = "1",
}: DashboardContentProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state for creating users
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
  });

  // Form state for creating classes
  const [newClassData, setNewClassData] = useState({
    name: "",
    description: "",
    teacher_id: "",
    room: "",
  });
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false);
  const [createClassLoading, setCreateClassLoading] = useState(false);

  // Form state for editing classes
  const [editClassData, setEditClassData] = useState({
    id: "",
    name: "",
    description: "",
    teacher_id: "",
    room: "",
  });
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [editClassLoading, setEditClassLoading] = useState(false);

  // Form state for editing users
  const [editUserData, setEditUserData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
  });
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);

  // Form state for editing schedules
  const [editScheduleData, setEditScheduleData] = useState({
    id: "",
    class_id: "",
    day_of_week: 0,
    start_time: "",
    end_time: "",
    room: "",
  });
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] =
    useState(false);
  const [editScheduleLoading, setEditScheduleLoading] = useState(false);

  // Form state for creating schedules
  const [newScheduleData, setNewScheduleData] = useState({
    class_id: "",
    day_of_week: 0,
    start_time: "",
    end_time: "",
    room: "",
  });
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] =
    useState(false);
  const [createScheduleLoading, setCreateScheduleLoading] = useState(false);

  // Form state for student assignments
  const [assignmentData, setAssignmentData] = useState({
    class_id: "",
    student_ids: [] as string[],
  });
  const [isAssignStudentsDialogOpen, setIsAssignStudentsDialogOpen] =
    useState(false);
  const [assignStudentsLoading, setAssignStudentsLoading] = useState(false);
  const [classStudents, setClassStudents] = useState<any[]>([]);

  // Form state for creating announcements
  const [newAnnouncementData, setNewAnnouncementData] = useState({
    title: "",
    content: "",
    class_id: "",
  });
  const [isCreateAnnouncementDialogOpen, setIsCreateAnnouncementDialogOpen] =
    useState(false);
  const [createAnnouncementLoading, setCreateAnnouncementLoading] =
    useState(false);

  // Form state for creating exams
  const [newExamData, setNewExamData] = useState({
    name: "",
    class_id: "",
    max_grade: 100,
  });
  const [isCreateExamDialogOpen, setIsCreateExamDialogOpen] = useState(false);
  const [createExamLoading, setCreateExamLoading] = useState(false);

  // Form state for file upload
  const [fileUploadData, setFileUploadData] = useState({
    class_id: "",
    name: "",
    description: "",
    category_id: "",
  });
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state for file categories
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    class_id: "",
  });
  const [isCreateCategoryDialogOpen, setIsCreateCategoryDialogOpen] =
    useState(false);
  const [createCategoryLoading, setCreateCategoryLoading] = useState(false);
  const [editCategoryData, setEditCategoryData] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] =
    useState(false);
  const [editCategoryLoading, setEditCategoryLoading] = useState(false);

  // Form state for grade entry
  const [gradeEntryData, setGradeEntryData] = useState<{
    [studentId: string]: number;
  }>({});
  const [saveGradesLoading, setSaveGradesLoading] = useState(false);

  // Real data state
  const [classes, setClasses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [fileCategories, setFileCategories] = useState<any[]>([]);
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [studentsWithGrades, setStudentsWithGrades] = useState<any[]>([]);

  // Helper function to format schedule
  const formatSchedule = (schedules: any[]) => {
    const dayNames = ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"];
    const groupedByClass = schedules.reduce((acc, schedule) => {
      const className = schedule.classes?.name || "Unknown";
      if (!acc[className]) acc[className] = [];
      acc[className].push({
        day: dayNames[schedule.day_of_week],
        time: `${schedule.start_time} - ${schedule.end_time}`,
      });
      return acc;
    }, {});

    return Object.entries(groupedByClass).map(
      ([className, times]: [string, any]) => ({
        className,
        schedule: times.map((t: any) => t.day).join(", "),
        time: times[0]?.time || "",
      }),
    );
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Helper function to calculate grade average
  const calculateGradeAverage = (studentGrades: any[]) => {
    if (!studentGrades.length) return 0;
    const total = studentGrades.reduce(
      (sum, grade) => sum + (grade.grade / grade.max_grade) * 100,
      0,
    );
    return Math.round(total / studentGrades.length);
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !fileUploadData.class_id) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε αρχείο και τάξη.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Ο χρήστης δεν είναι συνδεδεμένος.",
        variant: "destructive",
      });
      return;
    }

    setFileUploadLoading(true);
    try {
      const { data, error } = await db.uploadFile({
        file: selectedFile,
        class_id: fileUploadData.class_id,
        uploaded_by: user.id,
        name: fileUploadData.name || selectedFile.name,
        category_id: fileUploadData.category_id || undefined,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία μεταφόρτωσης αρχείου.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Το αρχείο μεταφορτώθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setFileUploadData({
        class_id: "",
        name: "",
        description: "",
        category_id: "",
      });
      setSelectedFile(null);
      setIsFileUploadDialogOpen(false);

      // Refresh files list
      const classIds = classes.map((c) => c.id);
      const { data: filesData } = await db.getClassFilesWithCategories(
        classIds.length > 0 ? classIds : undefined,
      );
      if (filesData) {
        const formattedFiles = filesData.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: formatFileSize(file.file_size),
          uploadedBy: file.users?.name || "Άγνωστος",
          date: new Date(file.created_at).toLocaleDateString(),
          class: file.classes?.name || "Άγνωστο",
          category: file.file_categories?.name || "Γενικά",
          file_path: file.file_path,
        }));
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    } finally {
      setFileUploadLoading(false);
    }
  };

  // Handle file download
  const handleFileDownload = (filePath: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string) => {
    try {
      const { error } = await db.deleteFile(fileId);

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία διαγραφής αρχείου.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Το αρχείο διαγράφηκε επιτυχώς!",
      });

      // Refresh files list
      const classIds = classes.map((c) => c.id);
      const { data: filesData } = await db.getClassFilesWithCategories(
        classIds.length > 0 ? classIds : undefined,
      );
      if (filesData) {
        const formattedFiles = filesData.map((file: any) => ({
          id: file.id,
          name: file.name,
          size: formatFileSize(file.file_size),
          uploadedBy: file.users?.name || "Άγνωστος",
          date: new Date(file.created_at).toLocaleDateString(),
          class: file.classes?.name || "Άγνωστο",
          category: file.file_categories?.name || "Γενικά",
          file_path: file.file_path,
        }));
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    }
  };

  // Handle creating a file category
  const handleCreateCategory = async () => {
    if (!newCategoryData.name || !newCategoryData.class_id) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όνομα κατηγορίας και επιλέξτε τάξη.",
        variant: "destructive",
      });
      return;
    }

    setCreateCategoryLoading(true);
    try {
      const { data, error } = await db.createFileCategory({
        name: newCategoryData.name,
        description: newCategoryData.description || null,
        class_id: newCategoryData.class_id,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία δημιουργίας κατηγορίας.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η κατηγορία δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewCategoryData({ name: "", description: "", class_id: "" });
      setIsCreateCategoryDialogOpen(false);

      // Refresh categories list
      const { data: categoriesData } = await db.getFileCategories();
      if (categoriesData) {
        setFileCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    } finally {
      setCreateCategoryLoading(false);
    }
  };

  // Handle deleting a file category
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { error } = await db.deleteFileCategory(categoryId);

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία διαγραφής κατηγορίας.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η κατηγορία διαγράφηκε επιτυχώς!",
      });

      // Refresh categories list
      const { data: categoriesData } = await db.getFileCategories();
      if (categoriesData) {
        setFileCategories(categoriesData);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    }
  };

  // Handle creating a new user
  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Προσοχή!",
        description: "Συμπλήρωσε όλα τα υποχρεωτικά πεδία.",
        variant: "destructive",
      });
      return;
    }

    setCreateUserLoading(true);
    try {
      const { data, error } = await db.createUser(newUserData);

      if (error) {
        toast({
          title: "Προσοχή!",
          description: error.message || "Ο χρήστης δεν δημιουργήθηκε.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία!",
        description: "Ο χρήστης δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewUserData({ name: "", email: "", role: "student", password: "" });
      setIsCreateUserDialogOpen(false);

      // Refresh users list
      if (userRole === "admin") {
        const { data: usersData } = await db.getAllUsers();
        if (usersData) {
          const formattedUsers = usersData.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar_url,
          }));
          setUsers(formattedUsers);
        }
      }
    } catch (error) {
      console.error("Πρόβλημα στην δημιουργία χρήστη:", error);
      toast({
        title: "Προσοχή!",
        description: "Κάποιο πρόβλημα συνέβη!",
        variant: "destructive",
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await db.deleteUser(userId);

      if (error) {
        toast({
          title: "Προσοχή!",
          description: error.message || "Ο χρήστης δεν διαγράφηκε.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία!",
        description: "Ο χρήστης διαγράφηκε!",
      });

      // Refresh users list
      const { data: usersData } = await db.getAllUsers();
      if (usersData) {
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar_url,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Πρόβλημα κατά την διαγραφή χρήστη:", error);
      toast({
        title: "Προσοχή!",
        description: "Κάποιο πρόβλημα συνέβη.",
        variant: "destructive",
      });
    }
  };

  // Handle creating a new class
  const handleCreateClass = async () => {
    if (!newClassData.name) {
      toast({
        title: "Προσοχή!",
        description: "Παρακαλώ βάλτε όνομα τάξης.",
        variant: "destructive",
      });
      return;
    }

    setCreateClassLoading(true);
    try {
      const { data, error } = await db.createClass({
        name: newClassData.name,
        description: newClassData.description || null,
        teacher_id: newClassData.teacher_id || null,
        room: newClassData.room || null,
      });

      if (error) {
        toast({
          title: "Προσοχή!",
          description: error.message || "Δεν δημιουργήθηκε η τάξη.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η τάξη δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewClassData({ name: "", description: "", teacher_id: "", room: "" });
      setIsCreateClassDialogOpen(false);

      // Refresh classes list
      if (userRole === "admin") {
        const { data: allClasses } = await db.getAllClasses();
        if (allClasses) {
          const formattedClasses = allClasses.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            teacher: cls.users?.name || "Δεν επιλέχθηκε καθηγητής",
            students: cls.class_enrollments?.[0]?.count || 0,
            room: cls.room,
            description: cls.description,
          }));
          setClasses(formattedClasses);
        }
      }
    } catch (error) {
      console.error("Πρόβλημα κατά την δημιουργία τάξης:", error);
      toast({
        title: "Πρόβλημα!",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    } finally {
      setCreateClassLoading(false);
    }
  };

  // Handle creating a new announcement
  const handleCreateAnnouncement = async () => {
    if (!newAnnouncementData.title || !newAnnouncementData.content) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε τίτλο και περιεχόμενο.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Σφάλμα",
        description: "Ο χρήστης δεν είναι συνδεδεμένος.",
        variant: "destructive",
      });
      return;
    }

    setCreateAnnouncementLoading(true);
    try {
      const announcementPayload = {
        title: newAnnouncementData.title,
        content: newAnnouncementData.content,
        class_id:
          newAnnouncementData.class_id === ""
            ? null
            : newAnnouncementData.class_id,
        author_id: user.id,
      };

      console.log("Creating announcement with payload:", announcementPayload);

      const { data, error } = await db.createAnnouncement(announcementPayload);

      if (error) {
        console.error("Announcement creation error:", error);
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία δημιουργίας ανακοίνωσης.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η ανακοίνωση δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewAnnouncementData({ title: "", content: "", class_id: "" });
      setIsCreateAnnouncementDialogOpen(false);

      // Refresh announcements list
      const classIds = classes.map((c) => c.id);
      const { data: announcementsData } = await db.getAnnouncements(
        classIds.length > 0 ? classIds : undefined,
      );
      if (announcementsData) {
        const formattedAnnouncements = announcementsData.map(
          (announcement: any) => ({
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            date: new Date(announcement.created_at).toLocaleDateString(),
            class: announcement.classes?.name || "General",
            author: announcement.users?.name || "Unknown",
          }),
        );
        setAnnouncements(formattedAnnouncements);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setCreateAnnouncementLoading(false);
    }
  };

  // Handle editing a class
  const handleEditClass = async () => {
    if (!editClassData.name) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ εισάγετε όνομα τάξης.",
        variant: "destructive",
      });
      return;
    }

    setEditClassLoading(true);
    try {
      const { data, error } = await db.updateClass(editClassData.id, {
        name: editClassData.name,
        description: editClassData.description || null,
        teacher_id: editClassData.teacher_id || null,
        room: editClassData.room || null,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update class.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η τάξη ενημερώθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setEditClassData({
        id: "",
        name: "",
        description: "",
        teacher_id: "",
        room: "",
      });
      setIsEditClassDialogOpen(false);

      // Refresh classes list
      if (userRole === "admin") {
        const { data: allClasses } = await db.getAllClasses();
        if (allClasses) {
          const formattedClasses = allClasses.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            teacher: cls.users?.name || "No Teacher Assigned",
            students: cls.class_enrollments?.[0]?.count || 0,
            room: cls.room,
            description: cls.description,
          }));
          setClasses(formattedClasses);
        }
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setEditClassLoading(false);
    }
  };

  // Handle deleting a class
  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await db.deleteClass(classId);

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία διαγραφής τάξης.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η τάξη διαγράφηκε επιτυχώς!",
      });

      // Refresh classes list
      if (userRole === "admin") {
        const { data: allClasses } = await db.getAllClasses();
        if (allClasses) {
          const formattedClasses = allClasses.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            teacher: cls.users?.name || "No Teacher Assigned",
            students: cls.class_enrollments?.[0]?.count || 0,
            room: cls.room,
            description: cls.description,
          }));
          setClasses(formattedClasses);
        }
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Handle creating a schedule
  const handleCreateSchedule = async () => {
    if (
      !newScheduleData.class_id ||
      !newScheduleData.start_time ||
      !newScheduleData.end_time
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setCreateScheduleLoading(true);
    try {
      const { data, error } = await db.createSchedule({
        class_id: newScheduleData.class_id,
        day_of_week: newScheduleData.day_of_week,
        start_time: newScheduleData.start_time,
        end_time: newScheduleData.end_time,
        room: newScheduleData.room || null,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία δημιουργίας προγράμματος.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Το πρόγραμμα δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewScheduleData({
        class_id: "",
        day_of_week: 0,
        start_time: "",
        end_time: "",
        room: "",
      });
      setIsCreateScheduleDialogOpen(false);

      // Refresh schedules list
      const classIds = classes.map((c) => c.id);
      const { data: schedulesData } = await db.getClassSchedules(
        classIds.length > 0 ? classIds : undefined,
      );
      if (schedulesData) {
        const formattedSchedules = schedulesData.map((schedule: any) => {
          const dayNames = [
            "Κυριακή",
            "Δευτέρα",
            "Τρίτη",
            "Τετάρτη",
            "Πέμπτη",
            "Παρασκευή",
            "Σάββατο",
          ];
          return {
            id: schedule.id,
            class: schedule.classes?.name || "Unknown",
            day: dayNames[schedule.day_of_week],
            time: `${schedule.start_time} - ${schedule.end_time}`,
            room: schedule.room,
          };
        });
        setScheduleItems(formattedSchedules);
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setCreateScheduleLoading(false);
    }
  };

  // Handle editing a schedule
  const handleEditSchedule = async () => {
    if (
      !editScheduleData.class_id ||
      !editScheduleData.start_time ||
      !editScheduleData.end_time
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setEditScheduleLoading(true);
    try {
      const { data, error } = await db.updateSchedule(editScheduleData.id, {
        class_id: editScheduleData.class_id,
        day_of_week: editScheduleData.day_of_week,
        start_time: editScheduleData.start_time,
        end_time: editScheduleData.end_time,
        room: editScheduleData.room || null,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία ενημέρωσης προγράμματος.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Το πρόγραμμα ενημερώθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setEditScheduleData({
        id: "",
        class_id: "",
        day_of_week: 0,
        start_time: "",
        end_time: "",
        room: "",
      });
      setIsEditScheduleDialogOpen(false);

      // Refresh schedules list
      const classIds = classes.map((c) => c.id);
      const { data: schedulesData } = await db.getClassSchedules(
        classIds.length > 0 ? classIds : undefined,
      );
      if (schedulesData) {
        const formattedSchedules = schedulesData.map((schedule: any) => {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          return {
            id: schedule.id,
            class: schedule.classes?.name || "Unknown",
            day: dayNames[schedule.day_of_week],
            time: `${schedule.start_time} - ${schedule.end_time}`,
            room: schedule.room,
          };
        });
        setScheduleItems(formattedSchedules);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setEditScheduleLoading(false);
    }
  };

  // Handle deleting a schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await db.deleteSchedule(scheduleId);

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία διαγραφής προγράμματος.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Το πρόγραμμα διαγράφηκε επιτυχώς!",
      });

      // Refresh schedules list
      const classIds = classes.map((c) => c.id);
      const { data: schedulesData } = await db.getClassSchedules(
        classIds.length > 0 ? classIds : undefined,
      );
      if (schedulesData) {
        const formattedSchedules = schedulesData.map((schedule: any) => {
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          return {
            id: schedule.id,
            class: schedule.classes?.name || "Unknown",
            day: dayNames[schedule.day_of_week],
            time: `${schedule.start_time} - ${schedule.end_time}`,
            room: schedule.room,
          };
        });
        setScheduleItems(formattedSchedules);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Handle assigning students to class
  const handleAssignStudents = async () => {
    if (!assignmentData.class_id || assignmentData.student_ids.length === 0) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μια τάξη και τουλάχιστον έναν μαθητή.",
        variant: "destructive",
      });
      return;
    }

    setAssignStudentsLoading(true);
    try {
      const promises = assignmentData.student_ids.map((studentId) =>
        db.enrollStudent(studentId, assignmentData.class_id),
      );

      const results = await Promise.all(promises);
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        toast({
          title: "Σφάλμα",
          description: `Αποτυχία ανάθεσης ${errors.length} μαθητών.`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: `Επιτυχής ανάθεση ${assignmentData.student_ids.length} μαθητών στην τάξη!`,
      });

      // Reset form and close dialog
      setAssignmentData({ class_id: "", student_ids: [] });
      setIsAssignStudentsDialogOpen(false);

      // Refresh class students if viewing a specific class
      if (assignmentData.class_id) {
        const { data: studentsData } = await db.getClassStudents(
          assignmentData.class_id,
        );
        if (studentsData) {
          const formattedStudents = studentsData.map((enrollment: any) => ({
            id: enrollment.users.id,
            name: enrollment.users.name,
            email: enrollment.users.email,
            avatar: enrollment.users.avatar_url,
          }));
          setClassStudents(formattedStudents);
        }
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setAssignStudentsLoading(false);
    }
  };

  // Handle editing a user
  const handleEditUser = async () => {
    if (!editUserData.name || !editUserData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setEditUserLoading(true);
    try {
      const { data, error } = await db.updateUser(editUserData.id, {
        name: editUserData.name,
        email: editUserData.email,
        role: editUserData.role,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία ενημέρωσης χρήστη.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Ο χρήστης ενημερώθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setEditUserData({ id: "", name: "", email: "", role: "" });
      setIsEditUserDialogOpen(false);

      // Refresh users list
      const { data: usersData } = await db.getAllUsers();
      if (usersData) {
        const formattedUsers = usersData.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar_url,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setEditUserLoading(false);
    }
  };

  // Handle removing student from class
  const handleRemoveStudent = async (studentId: string, classId: string) => {
    try {
      const { error } = await db.removeStudentFromClass(studentId, classId);

      if (error) {
        toast({
          title: "Σφάλμα",
          description:
            error.message || "Αποτυχία αφαίρεσης μαθητή από την τάξη.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Ο μαθητής αφαιρέθηκε από την τάξη επιτυχώς!",
      });

      // Refresh class students
      const { data: studentsData } = await db.getClassStudents(classId);
      if (studentsData) {
        const formattedStudents = studentsData.map((enrollment: any) => ({
          id: enrollment.users.id,
          name: enrollment.users.name,
          email: enrollment.users.email,
          avatar: enrollment.users.avatar_url,
        }));
        setClassStudents(formattedStudents);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Load class students when a class is selected
  const loadClassStudents = async (classId: string) => {
    try {
      const { data: studentsData } = await db.getClassStudents(classId);
      if (studentsData) {
        const formattedStudents = studentsData.map((enrollment: any) => ({
          id: enrollment.users.id,
          name: enrollment.users.name,
          email: enrollment.users.email,
          avatar: enrollment.users.avatar_url,
        }));
        setClassStudents(formattedStudents);
      }
    } catch (error) {
      console.error("Error loading class students:", error);
    }
  };

  // Load students with grades for a specific exam
  const loadStudentsWithGrades = async (classId: string, examId: string) => {
    try {
      const { data, error } = await supabase.rpc('load_students_with_grades', {
        p_class_id: classId,
        p_exam_id: examId,
      });

      if (error) {
        console.error('Error loading students with grades:', error);
        return;
      }

      const formattedStudents = data.map((student: any) => ({
        id: student.student_id,
        name: student.student_name,
        email: student.student_email,
        avatar_url: student.student_avatar_url,
        grade: student.grade,
      }));

      setStudentsWithGrades(formattedStudents);
    } catch (error) {
      console.error('Error loading students with grades:', error);
    }
  };

  // Handle creating an exam
  const handleCreateExam = async () => {
    if (!newExamData.name || !newExamData.class_id) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ συμπληρώστε όνομα εξέτασης και επιλέξτε τάξη.",
        variant: "destructive",
      });
      return;
    }

    setCreateExamLoading(true);
    try {
      const { data, error } = await db.createExam({
        name: newExamData.name,
        class_id: newExamData.class_id,
        max_grade: newExamData.max_grade,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία δημιουργίας εξέτασης.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Η εξέταση δημιουργήθηκε επιτυχώς!",
      });

      // Reset form and close dialog
      setNewExamData({ name: "", class_id: "", max_grade: 100 });
      setIsCreateExamDialogOpen(false);

      // Refresh exams list
      const classIds = classes.map((c) => c.id);
      const { data: examsData } = await db.getAllExams(classIds);
      if (examsData) {
        setExams(examsData);
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    } finally {
      setCreateExamLoading(false);
    }
  };

  // Handle saving grades
  const handleSaveGrades = async () => {
    if (!selectedExam || Object.keys(gradeEntryData).length === 0) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε εξέταση και εισάγετε βαθμούς.",
        variant: "destructive",
      });
      return;
    }

    setSaveGradesLoading(true);
    try {
      const { error } = await supabase.rpc('handle_save_grades', {
        p_exam_id: selectedExam,
        p_grades: gradeEntryData,
      });

      if (error) {
        toast({
          title: "Σφάλμα",
          description: error.message || "Αποτυχία αποθήκευσης βαθμών.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Επιτυχία",
        description: "Οι βαθμοί αποθηκεύτηκαν επιτυχώς!",
      });

      // Reset grade entry data
      setGradeEntryData({});

      // Refresh students with grades
      const currentClassId = classes.find(c => 
        exams.find(e => e.id === selectedExam)?.class_id === c.id
      )?.id;
      
      if (currentClassId) {
        await loadStudentsWithGrades(currentClassId, selectedExam);
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      toast({
        title: "Σφάλμα",
        description: "Συνέβη κάποιο πρόβλημα!",
        variant: "destructive",
      });
    } finally {
      setSaveGradesLoading(false);
    }
  };

  // Fetch data based on user role
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get classes based on user role
        const { data: classesData, error: classesError } =
          await db.getUserClasses(user.id, userRole);
        if (classesError) {
          console.error("Error fetching classes:", classesError);
          // Don't throw error, just log it and continue with empty data
        }

        let formattedClasses: any[] = [];
        let classIds: string[] = [];

        if (userRole === "student" && classesData && !classesError) {
          formattedClasses = classesData.map((enrollment: any) => ({
            id: enrollment.classes.id,
            name: enrollment.classes.name,
            teacher: enrollment.classes.users?.name || "Άγνωστος Καθηγητής",
            room: enrollment.classes.room,
            description: enrollment.classes.description,
          }));
          classIds = formattedClasses.map((c) => c.id);
        } else if (userRole === "teacher" && classesData && !classesError) {
          formattedClasses = classesData.map((cls: any) => ({
            id: cls.id,
            name: cls.name,
            students: cls.class_enrollments?.[0]?.count || 0,
            room: cls.room,
            description: cls.description,
          }));
          classIds = formattedClasses.map((c) => c.id);
        } else if (userRole === "admin") {
          const { data: allClasses, error: allClassesError } =
            await db.getAllClasses();
          if (allClasses && !allClassesError) {
            formattedClasses = allClasses.map((cls: any) => ({
              id: cls.id,
              name: cls.name,
              teacher: cls.users?.name || "No Teacher Assigned",
              students: cls.class_enrollments?.[0]?.count || 0,
              room: cls.room,
              description: cls.description,
            }));
            classIds = formattedClasses.map((c) => c.id);
          }
        }

        setClasses(formattedClasses);

        // Get schedules
        const { data: schedulesData, error: schedulesError } =
          await db.getClassSchedules(
            classIds.length > 0 ? classIds : undefined,
          );
        if (schedulesData && !schedulesError) {
          const formattedSchedules = schedulesData.map((schedule: any) => {
            const dayNames = [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ];
            return {
              id: schedule.id,
              class: schedule.classes?.name || "Unknown",
              day: dayNames[schedule.day_of_week],
              time: `${schedule.start_time} - ${schedule.end_time}`,
              room: schedule.room,
            };
          });
          setScheduleItems(formattedSchedules);
        }

        // Get announcements
        const { data: announcementsData, error: announcementsError } =
          await db.getAnnouncements(classIds.length > 0 ? classIds : undefined);
        if (announcementsData && !announcementsError) {
          const formattedAnnouncements = announcementsData.map(
            (announcement: any) => ({
              id: announcement.id,
              title: announcement.title,
              content: announcement.content,
              date: new Date(announcement.created_at).toLocaleDateString(),
              class: announcement.classes?.name || "Γενικό",
              author: announcement.users?.name || "Άγνωστος",
            }),
          );
          setAnnouncements(formattedAnnouncements);
        }

        // Get files with categories
        const { data: filesData, error: filesError } =
          await db.getClassFilesWithCategories(
            classIds.length > 0 ? classIds : undefined,
          );
        if (filesData && !filesError) {
          const formattedFiles = filesData.map((file: any) => ({
            id: file.id,
            name: file.name,
            size: formatFileSize(file.file_size),
            uploadedBy: file.users?.name || "Άγνωστος",
            date: new Date(file.created_at).toLocaleDateString(),
            class: file.classes?.name || "Άγνωστο",
            category: file.file_categories?.name || "Γενικά",
            file_path: file.file_path,
          }));
          setFiles(formattedFiles);
        }

        // Get file categories
        const { data: categoriesData, error: categoriesError } =
          await db.getFileCategories();
        if (categoriesData && !categoriesError) {
          setFileCategories(categoriesData);
        }

        // Get grades for students
        if (userRole === "student") {
          const { data: gradesData, error: gradesError } =
            await db.getStudentGrades(user.id, classIds);
          if (gradesData && !gradesError) {
            setGrades(gradesData);
          }
        }

        // Get exams for teachers
        if (userRole === "teacher" && classIds.length > 0) {
          const { data: examsData, error: examsError } =
            await db.getAllExams(classIds);
          if (examsData && !examsError) {
            setExams(examsData);
          }
        }

        // Get all users for admin
        if (userRole === "admin") {
          const { data: usersData, error: usersError } = await db.getAllUsers();
          if (usersData && !usersError) {
            const formattedUsers = usersData.map((user: any) => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatar: user.avatar_url,
            }));
            setUsers(formattedUsers);
          }

          // Get activity logs for admin
          const { data: logsData, error: logsError } =
            await db.getActivityLogs(20);
          if (logsData && !logsError) {
            const formattedLogs = logsData.map((log: any) => ({
              id: log.id,
              action: log.action,
              entityType: log.entity_type,
              entityName: log.entity_name,
              details: log.details,
              userName: log.users?.name || "Άγνωστος Χρήστης",
              createdAt: log.created_at,
            }));
            setActivityLogs(formattedLogs);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Φόρτωση δεδομένων πίνακα ελέγχου...
          </p>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Render content based on user role and selected navigation item
  const renderContent = () => {
    // Student views
    if (userRole === "student") {
      switch (activeTab) {
        case "overview":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">
                  Καλώς ήρθες πίσω, Μαθητή!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Εδώ είναι μια επισκόπηση της ακαδημαϊκής σου προόδου και των
                  επερχόμενων δραστηριοτήτων.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-3">Οι Τάξεις σου</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((classItem) => {
                    const classGrades = grades.filter(
                      (g) => g.classes?.name === classItem.name,
                    );
                    const gradeAverage = calculateGradeAverage(classGrades);
                    const classAnnouncements = announcements.filter(
                      (a) => a.class === classItem.name,
                    );
                    const classSchedules = scheduleItems.filter(
                      (s) => s.class === classItem.name,
                    );
                    const scheduleText = classSchedules
                      .map((s) => s.day)
                      .join(", ");
                    const timeText = classSchedules[0]?.time || "";

                    return (
                      <ClassCard
                        key={classItem.id}
                        name={classItem.name}
                        teacher={classItem.teacher}
                        schedule={scheduleText}
                        time={timeText}
                        gradeAverage={gradeAverage}
                        announcementCount={classAnnouncements.length}
                        userRole={userRole}
                      />
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-500" />
                      Πρόσφατες Ανακοινώσεις
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="border-b pb-3">
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                {announcement.title}
                              </h4>
                              <Badge variant="outline">
                                {announcement.class}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {announcement.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {announcement.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-orange-500" />
                      Επισκόπηση Βαθμών
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-r from-orange-100 to-orange-200 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Δεν υπάρχουν ακόμη βαθμολογίες
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "classes":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Οι Τάξεις μου</h2>
                <p className="text-muted-foreground mb-6">
                  Προβολή και διαχείριση όλων των εγγεγραμμένων τάξεων σου.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => {
                    const classGrades = grades.filter(
                      (g) => g.classes?.name === classItem.name,
                    );
                    const gradeAverage = calculateGradeAverage(classGrades);
                    const classAnnouncements = announcements.filter(
                      (a) => a.class === classItem.name,
                    );
                    const classSchedules = scheduleItems.filter(
                      (s) => s.class === classItem.name,
                    );
                    const scheduleText = classSchedules
                      .map((s) => s.day)
                      .join(", ");
                    const timeText = classSchedules[0]?.time || "";

                    return (
                      <ClassCard
                        key={classItem.id}
                        name={classItem.name}
                        teacher={classItem.teacher}
                        schedule={scheduleText}
                        time={timeText}
                        gradeAverage={gradeAverage}
                        announcementCount={classAnnouncements.length}
                        userRole={userRole}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );

        case "grades":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Οι Βαθμοί μου</h2>
                <p className="text-muted-foreground mb-6">
                  Προβολή της ακαδημαϊκής σου επίδοσης σε όλες τις τάξεις.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Σύνοψη Βαθμών</CardTitle>
                    <CardDescription>
                      Η τρέχουσα ακαδημαϊκή σου κατάσταση
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] bg-gradient-to-r from-orange-100 to-orange-200 rounded-md flex items-center justify-center mb-6">
                      <p className="text-muted-foreground">
                        Δεν υπάρχουν ακόμη βαθμολογίες
                      </p>
                    </div>

                    <div className="space-y-6">
                      {classes.map((classItem) => {
                        const classGrades = grades.filter(
                          (g) => g.exams?.classes?.name === classItem.name,
                        );
                        const gradeAverage = calculateGradeAverage(classGrades);
                        const letterGrade =
                          gradeAverage >= 90
                            ? "A"
                            : gradeAverage >= 80
                              ? "B"
                              : gradeAverage >= 70
                                ? "C"
                                : gradeAverage >= 60
                                  ? "D"
                                  : "F";

                        return (
                          <Card key={classItem.id}>
                            <CardHeader>
                              <div className="flex justify-between items-center">
                                <CardTitle>{classItem.name}</CardTitle>
                                <Badge
                                  className={
                                    gradeAverage >= 90
                                      ? "bg-green-500"
                                      : gradeAverage >= 80
                                        ? "bg-blue-500"
                                        : gradeAverage >= 70
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                  }
                                >
                                  {gradeAverage > 0
                                    ? `${gradeAverage}% (${letterGrade})`
                                    : "Δεν υπάρχουν βαθμοί"}
                                </Badge>
                              </div>
                              <CardDescription>
                                Μέσος όρος:{" "}
                                {gradeAverage > 0
                                  ? `${gradeAverage}%`
                                  : "Δεν υπάρχουν βαθμοί ακόμα"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              {classGrades.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Εξέταση</TableHead>
                                      <TableHead>Βαθμός</TableHead>
                                      <TableHead>Μέγιστος</TableHead>
                                      <TableHead>Ποσοστό</TableHead>
                                      <TableHead>Ημερομηνία</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {classGrades.map((grade) => {
                                      const maxGrade =
                                        grade.exams?.max_grade || 100;
                                      const percentage = Math.round(
                                        (grade.grade / maxGrade) * 100,
                                      );

                                      return (
                                        <TableRow key={grade.id}>
                                          <TableCell>
                                            {grade.exams?.name ||
                                              "Άγνωστη Εξέταση"}
                                          </TableCell>
                                          <TableCell>{grade.grade}</TableCell>
                                          <TableCell>{maxGrade}</TableCell>
                                          <TableCell>
                                            <Badge
                                              className={
                                                percentage >= 90
                                                  ? "bg-green-500"
                                                  : percentage >= 80
                                                    ? "bg-blue-500"
                                                    : percentage >= 70
                                                      ? "bg-yellow-500"
                                                      : "bg-red-500"
                                              }
                                            >
                                              {percentage}%
                                            </Badge>
                                          </TableCell>
                                          <TableCell>
                                            {new Date(
                                              grade.created_at,
                                            ).toLocaleDateString()}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  <p>
                                    Δεν υπάρχουν βαθμοί για αυτή την τάξη ακόμα.
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "announcements":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Ανακοινώσεις</h2>
                <p className="text-muted-foreground mb-6">
                  Μείνετε ενημερωμένοι με τις τελευταίες ανακοινώσεις από τις
                  τάξεις σας.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">Όλες</TabsTrigger>
                    {classes.map((classItem) => (
                      <TabsTrigger
                        key={classItem.id}
                        value={`class-${classItem.id}`}
                      >
                        {classItem.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>{announcement.title}</CardTitle>
                              <Badge>{announcement.class}</Badge>
                            </div>
                            <CardDescription>
                              {announcement.date}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>{announcement.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {classes.map((classItem) => (
                    <TabsContent
                      key={classItem.id}
                      value={`class-${classItem.id}`}
                    >
                      <div className="space-y-4">
                        {announcements
                          .filter((a) => a.class === classItem.name)
                          .map((announcement) => (
                            <Card key={announcement.id}>
                              <CardHeader>
                                <CardTitle>{announcement.title}</CardTitle>
                                <CardDescription>
                                  {announcement.date}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p>{announcement.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        case "files":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Αρχεία Τάξης</h2>
                <p className="text-muted-foreground mb-6">
                  Πρόσβαση και λήψη αρχείων που μοιράζονται οι εκπαιδευτικοί
                  σας.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Files</TabsTrigger>
                    {classes.map((classItem) => (
                      <TabsTrigger
                        key={classItem.id}
                        value={`class-${classItem.id}`}
                      >
                        {classItem.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <Card key={file.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="h-4 w-4 text-orange-500" />
                              {file.name}
                            </CardTitle>
                            <CardDescription>{file.class}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <p>Μέγεθος: {file.size}</p>
                              <p>Κατηγορία: {file.category}</p>
                              <p>Μεταφορτώθηκε από: {file.uploadedBy}</p>
                              <p>Ημερομηνία: {file.date}</p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button variant="outline" size="sm">
                                Preview
                              </Button>
                              <Button size="sm">Download</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {classes.map((classItem) => (
                    <TabsContent
                      key={classItem.id}
                      value={`class-${classItem.id}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files
                          .filter((f) => f.class === classItem.name)
                          .map((file) => (
                            <Card key={file.id}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-orange-500" />
                                  {file.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm">
                                  <p>Μέγεθος: {file.size}</p>
                                  <p>Μεταφορτώθηκε από: {file.uploadedBy}</p>
                                  <p>Ημερομηνία: {file.date}</p>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(file.file_path, "_blank")
                                    }
                                  >
                                    Προεπισκόπηση
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleFileDownload(
                                        file.file_path,
                                        file.name,
                                      )
                                    }
                                  >
                                    Λήψη
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        case "schedule":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Το Πρόγραμμά μου</h2>
                <p className="text-muted-foreground mb-6">
                  Προβολή του εβδομαδιαίου προγράμματος τάξεων σου.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Weekly Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Room</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.day}</TableCell>
                            <TableCell>{item.class}</TableCell>
                            <TableCell>{item.time}</TableCell>
                            <TableCell>{item.room}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-orange-500" />
                      Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        default:
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Επιλέξτε μια επιλογή από την πλαϊνή μπάρα
              </p>
            </div>
          );
      }
    }

    // Teacher views
    else if (userRole === "teacher") {
      switch (activeTab) {
        case "overview":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">
                  Καλώς ήρθες πίσω, Καθηγητή!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Διαχειριστείτε τις τάξεις και τις δραστηριότητες των μαθητών
                  σας.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-3">Οι τάξεις σας</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((classItem) => {
                    const classSchedules = scheduleItems.filter(
                      (s) => s.class === classItem.name,
                    );
                    const scheduleText = classSchedules
                      .map((s) => s.day)
                      .join(", ");
                    const timeText = classSchedules[0]?.time || "";
                    const classAnnouncements = announcements.filter(
                      (a) => a.class === classItem.name,
                    );

                    return (
                      <ClassCard
                        key={classItem.id}
                        name={classItem.name}
                        schedule={scheduleText}
                        time={timeText}
                        studentCount={classItem.students || 0}
                        announcementCount={classAnnouncements.length}
                        userRole={userRole}
                      />
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-500" />
                      Πρόσφατες Ανακοινώσεις
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <div key={announcement.id} className="border-b pb-3">
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                {announcement.title}
                              </h4>
                              <Badge variant="outline">
                                {announcement.class}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {announcement.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {announcement.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Σημερινό Πρόγραμμα
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-3">
                        {scheduleItems
                          .filter((item) => item.day === "Monday") // Just for demo purposes
                          .map((item) => (
                            <Card key={item.id}>
                              <CardContent className="p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">
                                      {item.class}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {item.time}
                                    </p>
                                  </div>
                                  <Badge>{item.room}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "classes":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Οι τάξεις μου</h2>
                <p className="text-muted-foreground mb-6">
                  Εδώ μπορείτε να διαχειριστείτε τα μαθήματα και τους μαθητές
                  σας
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => {
                    const classSchedules = scheduleItems.filter(
                      (s) => s.class === classItem.name,
                    );
                    const scheduleText = classSchedules
                      .map((s) => s.day)
                      .join(", ");
                    const timeText = classSchedules[0]?.time || "";
                    const classAnnouncements = announcements.filter(
                      (a) => a.class === classItem.name,
                    );

                    return (
                      <ClassCard
                        key={classItem.id}
                        name={classItem.name}
                        schedule={scheduleText}
                        time={timeText}
                        studentCount={classItem.students || 0}
                        announcementCount={classAnnouncements.length}
                        userRole={userRole}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );

        case "files":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Αρχεία Τάξης</h2>
                <p className="text-muted-foreground mb-6">
                  Μεταφόρτωση και διαχείριση αρχείων για τις τάξεις σας.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="all">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="all">All Files</TabsTrigger>
                      {classes.slice(0, 3).map((classItem) => (
                        <TabsTrigger
                          key={classItem.id}
                          value={`class-${classItem.id}`}
                        >
                          {classItem.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <div className="flex gap-2">
                      <Dialog
                        open={isCreateCategoryDialogOpen}
                        onOpenChange={setIsCreateCategoryDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Κατηγορίες
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Διαχείριση Κατηγοριών Αρχείων</DialogTitle>
                            <DialogDescription>
                              Δημιουργήστε και διαχειριστείτε κατηγορίες για τα αρχεία σας.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="category-class"
                                className="text-sm font-medium"
                              >
                                Τάξη
                              </label>
                              <Select
                                value={newCategoryData.class_id}
                                onValueChange={(value) =>
                                  setNewCategoryData({
                                    ...newCategoryData,
                                    class_id: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Επιλέξτε τάξη" />
                                </SelectTrigger>
                                <SelectContent>
                                  {classes.map((classItem) => (
                                    <SelectItem
                                      key={classItem.id}
                                      value={classItem.id}
                                    >
                                      {classItem.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label
                                htmlFor="category-name"
                                className="text-sm font-medium"
                              >
                                Όνομα Κατηγορίας
                              </label>
                              <Input
                                id="category-name"
                                placeholder="π.χ. Εξετάσεις, Βιβλία, Ασκήσεις"
                                value={newCategoryData.name}
                                onChange={(e) =>
                                  setNewCategoryData({
                                    ...newCategoryData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <label
                                htmlFor="category-description"
                                className="text-sm font-medium"
                              >
                                Περιγραφή (Προαιρετικό)
                              </label>
                              <Textarea
                                id="category-description"
                                placeholder="Περιγραφή της κατηγορίας"
                                value={newCategoryData.description}
                                onChange={(e) =>
                                  setNewCategoryData({
                                    ...newCategoryData,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="border rounded-lg p-4">
                              <h4 className="font-medium mb-2">Υπάρχουσες Κατηγορίες</h4>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {fileCategories
                                  .filter(cat => newCategoryData.class_id ? cat.class_id === newCategoryData.class_id : true)
                                  .map((category) => (
                                    <div key={category.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                      <span className="text-sm">{category.name}</span>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteCategory(category.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewCategoryData({ name: "", description: "", class_id: "" });
                                setIsCreateCategoryDialogOpen(false);
                              }}
                              disabled={createCategoryLoading}
                            >
                              Κλείσιμο
                            </Button>
                            <Button
                              onClick={handleCreateCategory}
                              disabled={createCategoryLoading}
                            >
                              {createCategoryLoading
                                ? "Δημιουργία..."
                                : "Δημιουργία Κατηγορίας"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isFileUploadDialogOpen}
                        onOpenChange={setIsFileUploadDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button>
                            <Upload className="h-4 w-4 mr-2" />
                            Μεταφόρτωση Αρχείου
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Μεταφόρτωση Νέου Αρχείου</DialogTitle>
                          <DialogDescription>
                            Μεταφορτώστε ένα αρχείο για να το μοιραστείτε με
                            τους μαθητές σας.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="file-class"
                              className="text-sm font-medium"
                            >
                              Τάξη
                            </label>
                            <Select
                              value={fileUploadData.class_id}
                              onValueChange={(value) =>
                                setFileUploadData({
                                  ...fileUploadData,
                                  class_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Επιλέξτε τάξη" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((classItem) => (
                                  <SelectItem
                                    key={classItem.id}
                                    value={classItem.id}
                                  >
                                    {classItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="file-title"
                              className="text-sm font-medium"
                            >
                              Τίτλος Αρχείου
                            </label>
                            <Input
                              id="file-title"
                              placeholder="Εισάγετε τίτλο αρχείου"
                              value={fileUploadData.name}
                              onChange={(e) =>
                                setFileUploadData({
                                  ...fileUploadData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="file-description"
                              className="text-sm font-medium"
                            >
                              Περιγραφή (Προαιρετικό)
                            </label>
                            <Textarea
                              id="file-description"
                              placeholder="Εισάγετε περιγραφή αρχείου"
                              value={fileUploadData.description}
                              onChange={(e) =>
                                setFileUploadData({
                                  ...fileUploadData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="file-category"
                              className="text-sm font-medium"
                            >
                              Κατηγορία
                            </label>
                            <Select
                              value={fileUploadData.category_id}
                              onValueChange={(value) =>
                                setFileUploadData({
                                  ...fileUploadData,
                                  category_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Επιλέξτε κατηγορία" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Γενικά</SelectItem>
                                {fileCategories
                                  .filter(cat => cat.class_id === fileUploadData.class_id)
                                  .map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="file-upload"
                              className="text-sm font-medium"
                            >
                              Αρχείο
                            </label>
                            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                              {selectedFile ? (
                                <p className="text-sm text-green-600 mb-2">
                                  Επιλέχθηκε: {selectedFile.name}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground mb-2">
                                  Σύρετε και αφήστε το αρχείο σας εδώ, ή κάντε
                                  κλικ για περιήγηση
                                </p>
                              )}
                              <Input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setSelectedFile(file);
                                    if (!fileUploadData.name) {
                                      setFileUploadData({
                                        ...fileUploadData,
                                        name: file.name,
                                      });
                                    }
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() =>
                                  document
                                    .getElementById("file-upload")
                                    ?.click()
                                }
                              >
                                Περιήγηση Αρχείων
                              </Button>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setFileUploadData({
                                class_id: "",
                                name: "",
                                description: "",
                                category_id: "",
                              });
                              setSelectedFile(null);
                              setIsFileUploadDialogOpen(false);
                            }}
                            disabled={fileUploadLoading}
                          >
                            Ακύρωση
                          </Button>
                          <Button
                            onClick={handleFileUpload}
                            disabled={fileUploadLoading}
                          >
                            {fileUploadLoading
                              ? "Μεταφόρτωση..."
                              : "Μεταφόρτωση"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <Card key={file.id}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <FileText className="h-4 w-4 text-orange-500" />
                              {file.name}
                            </CardTitle>
                            <CardDescription>{file.class}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm">
                              <p>Μέγεθος: {file.size}</p>
                              <p>Μεταφορτώθηκε: {file.date}</p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(file.file_path, "_blank")
                                }
                              >
                                Προεπισκόπηση
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleFileDownload(file.file_path, file.name)
                                }
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Λήψη
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Διαγραφή
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Είστε σίγουρος;
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Ακύρωση
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-500 hover:bg-red-600"
                                      onClick={() => handleFileDelete(file.id)}
                                    >
                                      Διαγραφή
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {classes.slice(0, 3).map((classItem) => (
                    <TabsContent
                      key={classItem.id}
                      value={`class-${classItem.id}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files
                          .filter((f) => f.class === classItem.name)
                          .map((file) => (
                            <Card key={file.id}>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-orange-500" />
                                  {file.name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-sm">
                                  <p>Μέγεθος: {file.size}</p>
                                  <p>Μεταφορτώθηκε: {file.date}</p>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleFileDownload(file.id, file.name)
                                    }
                                  >
                                    Προεπισκόπηση
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleFileDownload(file.id, file.name)
                                    }
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Λήψη
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Διαγραφή
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Είστε σίγουρος;
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Αυτή η ενέργεια δεν μπορεί να
                                          αναιρεθεί.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Ακύρωση
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-red-500 hover:bg-red-600"
                                          onClick={() =>
                                            handleFileDelete(file.id)
                                          }
                                        >
                                          Διαγραφή
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        case "announcements":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Ανακοινώσεις</h2>
                <p className="text-muted-foreground mb-6">
                  Δημιουργήστε και διαχειριστείτε ανακοινώσεις για τις τάξεις
                  σας.
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="all">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger value="all">
                        Όλες οι Ανακοινώσεις
                      </TabsTrigger>
                      {classes.slice(0, 3).map((classItem) => (
                        <TabsTrigger
                          key={classItem.id}
                          value={`class-${classItem.id}`}
                        >
                          {classItem.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    <Dialog
                      open={isCreateAnnouncementDialogOpen}
                      onOpenChange={setIsCreateAnnouncementDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Νέα Ανακοίνωση
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Δημιουργία Νέας Ανακοίνωσης</DialogTitle>
                          <DialogDescription>
                            Κάνε ανακοινώσεις στους μαθητές σου
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="announcement-class"
                              className="text-sm font-medium"
                            >
                              Class
                            </label>
                            <Select
                              value={newAnnouncementData.class_id}
                              onValueChange={(value) =>
                                setNewAnnouncementData({
                                  ...newAnnouncementData,
                                  class_id: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Επιλέξτε τάξη" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.slice(0, 3).map((classItem) => (
                                  <SelectItem
                                    key={classItem.id}
                                    value={classItem.id}
                                  >
                                    {classItem.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="announcement-title"
                              className="text-sm font-medium"
                            >
                              Τίτλος
                            </label>
                            <Input
                              id="announcement-title"
                              placeholder="Εισάγετε τίτλο ανακοίνωσης"
                              value={newAnnouncementData.title}
                              onChange={(e) =>
                                setNewAnnouncementData({
                                  ...newAnnouncementData,
                                  title: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="announcement-content"
                              className="text-sm font-medium"
                            >
                              Περιεχόμενο
                            </label>
                            <Textarea
                              id="announcement-content"
                              placeholder="Εισάγετε περιεχόμενο ανακοίνωσης"
                              rows={5}
                              value={newAnnouncementData.content}
                              onChange={(e) =>
                                setNewAnnouncementData({
                                  ...newAnnouncementData,
                                  content: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setNewAnnouncementData({
                                title: "",
                                content: "",
                                class_id: "",
                              });
                              setIsCreateAnnouncementDialogOpen(false);
                            }}
                            disabled={createAnnouncementLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleCreateAnnouncement}
                            disabled={createAnnouncementLoading}
                          >
                            {createAnnouncementLoading
                              ? "Δημιουργία..."
                              : "Δημοσίευση Ανακοίνωσης"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <TabsContent value="all">
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <Card key={announcement.id}>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <CardTitle>{announcement.title}</CardTitle>
                              <Badge>{announcement.class}</Badge>
                            </div>
                            <CardDescription>
                              {announcement.date}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p>{announcement.content}</p>
                          </CardContent>
                          <div className="px-6 pb-4 flex gap-2 justify-end">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {classes.slice(0, 3).map((classItem) => (
                    <TabsContent
                      key={classItem.id}
                      value={`class-${classItem.id}`}
                    >
                      <div className="space-y-4">
                        {announcements
                          .filter((a) => a.class === classItem.name)
                          .map((announcement) => (
                            <Card key={announcement.id}>
                              <CardHeader>
                                <CardTitle>{announcement.title}</CardTitle>
                                <CardDescription>
                                  {announcement.date}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <p>{announcement.content}</p>
                              </CardContent>
                              <div className="px-6 pb-4 flex gap-2 justify-end">
                                <Button variant="outline" size="sm">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        case "grades":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Διαχείριση Βαθμών</h2>
                    <p className="text-muted-foreground">
                      Δημιουργήστε εξετάσεις και εισάγετε βαθμούς για τους
                      μαθητές σας.
                    </p>
                  </div>
                  <Dialog
                    open={isCreateExamDialogOpen}
                    onOpenChange={setIsCreateExamDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Νέα Εξέταση
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Δημιουργία Νέας Εξέτασης</DialogTitle>
                        <DialogDescription>
                          Δημιουργήστε μια νέα εξέταση για μια από τις τάξεις
                          σας.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="exam-name"
                            className="text-sm font-medium"
                          >
                            Όνομα Εξέτασης
                          </label>
                          <Input
                            id="exam-name"
                            placeholder="π.χ. Μεσοπρόθεσμη Εξέταση, Τελική Εξέταση"
                            value={newExamData.name}
                            onChange={(e) =>
                              setNewExamData({
                                ...newExamData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="exam-class"
                            className="text-sm font-medium"
                          >
                            Τάξη
                          </label>
                          <Select
                            value={newExamData.class_id}
                            onValueChange={(value) =>
                              setNewExamData({
                                ...newExamData,
                                class_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τάξη" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem
                                  key={classItem.id}
                                  value={classItem.id}
                                >
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="max-grade"
                            className="text-sm font-medium"
                          >
                            Μέγιστος Βαθμός
                          </label>
                          <Input
                            id="max-grade"
                            type="number"
                            placeholder="100"
                            value={newExamData.max_grade}
                            onChange={(e) =>
                              setNewExamData({
                                ...newExamData,
                                max_grade: parseInt(e.target.value) || 100,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewExamData({
                              name: "",
                              class_id: "",
                              max_grade: 100,
                            });
                            setIsCreateExamDialogOpen(false);
                          }}
                          disabled={createExamLoading}
                        >
                          Ακύρωση
                        </Button>
                        <Button
                          onClick={handleCreateExam}
                          disabled={createExamLoading}
                        >
                          {createExamLoading
                            ? "Δημιουργία..."
                            : "Δημιουργία Εξέτασης"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs
                  defaultValue={classes[0]?.id || ""}
                  onValueChange={(value) => {
                    setSelectedExam("");
                    setStudentsWithGrades([]);
                  }}
                >
                  <TabsList className="mb-4">
                    {classes.map((classItem) => (
                      <TabsTrigger key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {classes.map((classItem) => {
                    const classExams = exams.filter(
                      (e) => e.class_id === classItem.id,
                    );

                    return (
                      <TabsContent key={classItem.id} value={classItem.id}>
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                {classItem.name} - Εξετάσεις
                              </CardTitle>
                              <CardDescription>
                                Επιλέξτε μια εξέταση για να εισάγετε βαθμούς
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex gap-4 items-center">
                                  <Select
                                    value={selectedExam}
                                    onValueChange={(value) => {
                                      setSelectedExam(value);
                                      loadStudentsWithGrades(
                                        classItem.id,
                                        value,
                                      );
                                    }}
                                  >
                                    <SelectTrigger className="w-[300px]">
                                      <SelectValue placeholder="Επιλέξτε εξέταση" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {classExams.map((exam) => (
                                        <SelectItem
                                          key={exam.id}
                                          value={exam.id}
                                        >
                                          {exam.name} (Μέγιστος:{" "}
                                          {exam.max_grade})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      const sortedStudents = [
                                        ...studentsWithGrades,
                                      ].sort((a, b) =>
                                        a.name.localeCompare(b.name),
                                      );
                                      setStudentsWithGrades(sortedStudents);
                                    }}
                                    disabled={!selectedExam}
                                  >
                                    Ταξινόμηση Μαθητών
                                  </Button>
                                </div>

                                {selectedExam &&
                                  studentsWithGrades.length > 0 && (
                                    <div className="space-y-4">
                                      <div className="flex justify-between items-center">
                                        <h4 className="font-medium">
                                          Εισαγωγή Βαθμών
                                        </h4>
                                        <Button
                                          onClick={handleSaveGrades}
                                          disabled={saveGradesLoading}
                                        >
                                          <Save className="h-4 w-4 mr-2" />
                                          {saveGradesLoading
                                            ? "Αποθήκευση..."
                                            : "Αποθήκευση Βαθμών"}
                                        </Button>
                                      </div>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Μαθητής</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Βαθμός</TableHead>
                                            <TableHead>Ποσοστό</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {studentsWithGrades.map((student) => {
                                            const currentGrade =
                                              gradeEntryData[student.id] ||
                                              student.grade ||
                                              "";
                                            const selectedExamData = exams.find(
                                              (e) => e.id === selectedExam,
                                            );
                                            const maxGrade =
                                              selectedExamData?.max_grade ||
                                              100;
                                            const percentage = currentGrade
                                              ? Math.round(
                                                  (currentGrade / maxGrade) *
                                                    100,
                                                )
                                              : null;

                                            return (
                                              <TableRow key={student.id}>
                                                <TableCell>
                                                  <div className="flex items-center gap-2">
                                                    <Avatar>
                                                      <AvatarImage
                                                        src={student.avatar_url}
                                                        alt={student.name}
                                                      />
                                                      <AvatarFallback>
                                                        {student.name.charAt(0)}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                    <span>{student.name}</span>
                                                  </div>
                                                </TableCell>
                                                <TableCell>
                                                  {student.email}
                                                </TableCell>
                                                <TableCell>
                                                  <Input
                                                    type="number"
                                                    placeholder={`0-${maxGrade}`}
                                                    value={currentGrade}
                                                    onChange={(e) => {
                                                      const value = parseFloat(
                                                        e.target.value,
                                                      );
                                                      if (
                                                        !isNaN(value) ||
                                                        e.target.value === ""
                                                      ) {
                                                        setGradeEntryData({
                                                          ...gradeEntryData,
                                                          [student.id]: isNaN(
                                                            value,
                                                          )
                                                            ? 0
                                                            : value,
                                                        });
                                                      }
                                                    }}
                                                    className="w-20"
                                                    min="0"
                                                    max={maxGrade}
                                                  />
                                                </TableCell>
                                                <TableCell>
                                                  {percentage !== null && (
                                                    <Badge
                                                      className={
                                                        percentage >= 90
                                                          ? "bg-green-500"
                                                          : percentage >= 80
                                                            ? "bg-blue-500"
                                                            : percentage >= 70
                                                              ? "bg-yellow-500"
                                                              : "bg-red-500"
                                                      }
                                                    >
                                                      {percentage}%
                                                    </Badge>
                                                  )}
                                                </TableCell>
                                              </TableRow>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}

                                {classExams.length === 0 && (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <p>
                                      Δεν υπάρχουν εξετάσεις για αυτή την τάξη.
                                    </p>
                                    <p>
                                      Δημιουργήστε μια νέα εξέταση για να
                                      ξεκινήσετε.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        case "schedule":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">Το Πρόγραμμά μου</h2>
                <p className="text-muted-foreground mb-6">
                  Προβολή του προγράμματος διδασκαλίας σας.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      Weekly Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Room</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.day}</TableCell>
                            <TableCell>{item.class}</TableCell>
                            <TableCell>{item.time}</TableCell>
                            <TableCell>{item.room}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-orange-500" />
                      Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        default:
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Επίλεξε μία κατηγορία από το navbar
              </p>
            </div>
          );
      }
    }

    // Admin views
    else if (userRole === "admin") {
      switch (activeTab) {
        case "overview":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <h2 className="text-2xl font-bold mb-4">
                  Πίνακας Ελέγχου Διαχειριστή
                </h2>
                <p className="text-muted-foreground mb-6">
                  Διαχείριση χρηστών, τάξεων και σχολικών λειτουργιών.
                </p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      Χρήστες
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{users.length}</div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Σύνολο εγγεγραμμένων χρηστών
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Μαθητές:</span>
                        <span>
                          {users.filter((u) => u.role === "student").length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Εκπαιδευτικοί:</span>
                        <span>
                          {users.filter((u) => u.role === "teacher").length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Διαχειριστές:</span>
                        <span>
                          {users.filter((u) => u.role === "admin").length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                      Τάξεις
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{classes.length}</div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Ενεργές τάξεις
                    </p>
                    <div className="mt-4">
                      <Dialog
                        open={isCreateClassDialogOpen}
                        onOpenChange={setIsCreateClassDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Προσθήκη Νέας Τάξης
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Δημιουργία Νέας Τάξης</DialogTitle>
                            <DialogDescription>
                              Προσθέστε μια νέα τάξη στο σύστημα.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="class-name"
                                className="text-sm font-medium"
                              >
                                Όνομα τάξης
                              </label>
                              <Input
                                id="class-name"
                                placeholder="Όνομα τάξης"
                                value={newClassData.name}
                                onChange={(e) =>
                                  setNewClassData({
                                    ...newClassData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="teacher"
                                className="text-sm font-medium"
                              >
                                Καθηγητής
                              </label>
                              <Select
                                value={newClassData.teacher_id}
                                onValueChange={(value) =>
                                  setNewClassData({
                                    ...newClassData,
                                    teacher_id: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Επιλέξτε καθηγητή" />
                                </SelectTrigger>
                                <SelectContent>
                                  {users
                                    .filter((user) => user.role === "teacher")
                                    .map((teacher) => (
                                      <SelectItem
                                        key={teacher.id}
                                        value={teacher.id}
                                      >
                                        {teacher.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="room"
                                className="text-sm font-medium"
                              >
                                Αίθουσα
                              </label>
                              <Input
                                id="room"
                                placeholder="Αίθουσα"
                                value={newClassData.room}
                                onChange={(e) =>
                                  setNewClassData({
                                    ...newClassData,
                                    room: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="description"
                                className="text-sm font-medium"
                              >
                                Περιγραφή
                              </label>
                              <Textarea
                                id="description"
                                placeholder="Περιγραφή Τάξης"
                                value={newClassData.description}
                                onChange={(e) =>
                                  setNewClassData({
                                    ...newClassData,
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewClassData({
                                  name: "",
                                  description: "",
                                  teacher_id: "",
                                  room: "",
                                });
                                setIsCreateClassDialogOpen(false);
                              }}
                              disabled={createClassLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateClass}
                              disabled={createClassLoading}
                            >
                              {createClassLoading
                                ? "Δημιουργείται..."
                                : "Δημιουργία Τάξης"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-orange-500" />
                      Announcements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {announcements.length}
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Ενεργές ανακοινώσεις
                    </p>
                    <div className="mt-4">
                      <Dialog
                        open={isCreateAnnouncementDialogOpen}
                        onOpenChange={setIsCreateAnnouncementDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Νέα Ανακοίνωση
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Δημιουργία Ανακοίνωσης</DialogTitle>
                            <DialogDescription>
                              Οι ανακοινώσεις των admin φαίνονται σε όλους τους
                              μαθητές ή σε συγκεκριμένες τάξεις
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="announcement-class"
                                className="text-sm font-medium"
                              >
                                Τάξη (Προαιρετικό)
                              </label>
                              <Select
                                value={newAnnouncementData.class_id}
                                onValueChange={(value) =>
                                  setNewAnnouncementData({
                                    ...newAnnouncementData,
                                    class_id: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Επιλέξτε τάξη (προαιρετικό)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">
                                    Γενική Ανακοίνωση
                                  </SelectItem>
                                  {classes.map((classItem) => (
                                    <SelectItem
                                      key={classItem.id}
                                      value={classItem.id}
                                    >
                                      {classItem.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="announcement-title"
                                className="text-sm font-medium"
                              >
                                Τίτλος
                              </label>
                              <Input
                                id="announcement-title"
                                placeholder="Εισάγετε τίτλο ανακοίνωσης"
                                value={newAnnouncementData.title}
                                onChange={(e) =>
                                  setNewAnnouncementData({
                                    ...newAnnouncementData,
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="announcement-content"
                                className="text-sm font-medium"
                              >
                                Περιεχόμενο
                              </label>
                              <Textarea
                                id="announcement-content"
                                placeholder="Εισάγετε περιεχόμενο ανακοίνωσης"
                                rows={5}
                                value={newAnnouncementData.content}
                                onChange={(e) =>
                                  setNewAnnouncementData({
                                    ...newAnnouncementData,
                                    content: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setNewAnnouncementData({
                                  title: "",
                                  content: "",
                                  class_id: "",
                                });
                                setIsCreateAnnouncementDialogOpen(false);
                              }}
                              disabled={createAnnouncementLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateAnnouncement}
                              disabled={createAnnouncementLoading}
                            >
                              {createAnnouncementLoading
                                ? "Δημοσίευση..."
                                : "Δημοσίευση Ανακοίνωσης"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Πρόσφατη Δραστηριότητα</CardTitle>
                    <CardDescription>
                      Τελευταίες ενέργειες σε όλη την πλατφόρμα
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {activityLogs.length > 0 ? (
                          activityLogs.map((log) => {
                            const getActionText = () => {
                              switch (log.action) {
                                case "create":
                                  switch (log.entityType) {
                                    case "user":
                                      return `Δημιουργήθηκε νέος λογαριασμός ${log.details?.role || "user"}`;
                                    case "class":
                                      return "Δημιουργήθηκε νέα τάξη";
                                    case "schedule":
                                      return "Δημιουργήθηκε νέο πρόγραμμα";
                                    case "announcement":
                                      return "Δημιορυγήθηκε νέα ανακοίνωση";
                                    case "enrollment":
                                      return "Αλλαγή στους μαθητές της τάξης";
                                    default:
                                      return "Νέο αντικείμενο";
                                  }
                                case "update":
                                  switch (log.entityType) {
                                    case "user":
                                      return "Αλλαγή στο προφίλ";
                                    case "class":
                                      return "Αλλαγή στις πληροφορίες της τάξης";
                                    case "schedule":
                                      return "Αλλαγή στο προγραμμα";
                                    default:
                                      return "Αλλαγή σε αντικείμενο";
                                  }
                                case "delete":
                                  switch (log.entityType) {
                                    case "user":
                                      return "Διαγραφή λογαριασμού";
                                    case "class":
                                      return "Διαγραφή τάξης";
                                    case "schedule":
                                      return "Διαγραφή προγράμματος";
                                    case "enrollment":
                                      return "Αφαίρεση μαθητή από τάξη";
                                    default:
                                      return "Διαγραφή αντικειμένου";
                                  }
                                default:
                                  return "Αλλαγή!";
                              }
                            };

                            const getBadgeText = () => {
                              switch (log.entityType) {
                                case "user":
                                  return "Διαχείρηση Χρήστη";
                                case "class":
                                  return "Διαχείρηση Τάξης";
                                case "schedule":
                                  return "Αλλαγή προγράμματος";
                                case "announcement":
                                  return "Δημοσιεύσεις";
                                case "enrollment":
                                  return "Εγγραφή μαθητών";
                                default:
                                  return "Σύστημα";
                              }
                            };

                            const formatDate = (dateString: string) => {
                              const date = new Date(dateString);
                              const now = new Date();
                              const diffInHours = Math.floor(
                                (now.getTime() - date.getTime()) /
                                  (1000 * 60 * 60),
                              );

                              if (diffInHours < 1) {
                                return "Μόλις τώρα";
                              } else if (diffInHours < 24) {
                                return `${diffInHours} ώρ${diffInHours > 1 ? "ες" : "α"} πριν`;
                              } else {
                                return date.toLocaleDateString();
                              }
                            };

                            return (
                              <div key={log.id} className="border-b pb-3">
                                <div className="flex justify-between">
                                  <h4 className="font-medium">
                                    {getActionText()}
                                  </h4>
                                  <Badge variant="outline">
                                    {getBadgeText()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {log.entityName} by {log.userName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDate(log.createdAt)}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            <p>Δεν υπάρχει πρόσφατη δραστηριότητα</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "users":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Διαχείρηση χρηστών</h2>
                    <p className="text-muted-foreground">
                      Δημιουργία/Επεξεργασία/Διαγραφή χρηστών
                    </p>
                  </div>

                  <Dialog
                    open={isCreateUserDialogOpen}
                    onOpenChange={setIsCreateUserDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Προσθήκη Χρήστη
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Δημιουργία νέου χρήστη</DialogTitle>
                        <DialogDescription>
                          Προσθέστε έναν νέο χρήστη στο σύστημα
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="full-name"
                            className="text-sm font-medium"
                          >
                            Πλήρες Όνομα
                          </label>
                          <Input
                            id="full-name"
                            placeholder="Εισάγετε πλήρες όνομα"
                            value={newUserData.name}
                            onChange={(e) =>
                              setNewUserData({
                                ...newUserData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium"
                          >
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Εισάγετε διεύθυνση email"
                            value={newUserData.email}
                            onChange={(e) =>
                              setNewUserData({
                                ...newUserData,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="role" className="text-sm font-medium">
                            Ρόλος
                          </label>
                          <Select
                            value={newUserData.role}
                            onValueChange={(value) =>
                              setNewUserData({ ...newUserData, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε ρόλο" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Μαθητής</SelectItem>
                              <SelectItem value="teacher">Καθηγητής</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="password"
                            className="text-sm font-medium"
                          >
                            Κωδικός
                          </label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Εισάγετε κωδικό πρόσβασης"
                            value={newUserData.password}
                            onChange={(e) =>
                              setNewUserData({
                                ...newUserData,
                                password: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewUserData({
                              name: "",
                              email: "",
                              role: "student",
                              password: "",
                            });
                            setIsCreateUserDialogOpen(false);
                          }}
                          disabled={createUserLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateUser}
                          disabled={createUserLoading}
                        >
                          {createUserLoading
                            ? "Δημιουργία..."
                            : "Δημιουργία Χρήστη"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Χρήστες</CardTitle>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Αναζήτηση χρηστών..."
                          className="w-[200px]"
                        />
                        <Select>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Φιλτράρισμα ανά ρόλο" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Όλοι οι ρόλοι</SelectItem>
                            <SelectItem value="student">Μαθητές</SelectItem>
                            <SelectItem value="teacher">
                              Εκπαιδευτικοί
                            </SelectItem>
                            <SelectItem value="admin">Διαχειριστές</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Όνομα</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Ρόλος</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar>
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                  />
                                  <AvatarFallback>
                                    {user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  user.role === "admin"
                                    ? "bg-red-500"
                                    : user.role === "teacher"
                                      ? "bg-blue-500"
                                      : "bg-green-500"
                                }
                              >
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditUserData({
                                      id: user.id,
                                      name: user.name,
                                      email: user.email,
                                      role: user.role,
                                    });
                                    setIsEditUserDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Είσαι σίγουρος;
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ΠΡΟΣΟΧΉ! Αυτή η ενέργεια είναι οριστική
                                        και δεν μπορεί να αναιρεθεί!
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() =>
                                          handleDeleteUser(user.id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "classes":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Διαχείρηση τάξεων</h2>
                    <p className="text-muted-foreground">
                      Δημιουργία/Επεξεργασία/Διαγραφή Τάξεων
                    </p>
                  </div>

                  <Dialog
                    open={isCreateClassDialogOpen}
                    onOpenChange={setIsCreateClassDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Προσθήκη Τάξης
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Δημιουργία νέας τάξης</DialogTitle>
                        <DialogDescription>
                          Δημιουργήστε μια νέα τάξη στο σύστημα
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="class-name"
                            className="text-sm font-medium"
                          >
                            Όνομα τάξης
                          </label>
                          <Input
                            id="class-name"
                            placeholder="Εισάγετε όνομα τάξης"
                            value={newClassData.name}
                            onChange={(e) =>
                              setNewClassData({
                                ...newClassData,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="teacher"
                            className="text-sm font-medium"
                          >
                            Καθηγητής
                          </label>
                          <Select
                            value={newClassData.teacher_id}
                            onValueChange={(value) =>
                              setNewClassData({
                                ...newClassData,
                                teacher_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε καθηγητή" />
                            </SelectTrigger>
                            <SelectContent>
                              {users
                                .filter((user) => user.role === "teacher")
                                .map((teacher) => (
                                  <SelectItem
                                    key={teacher.id}
                                    value={teacher.id}
                                  >
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="room" className="text-sm font-medium">
                            Αίθουσα
                          </label>
                          <Input
                            id="room"
                            placeholder="Εισάγετε αίθουσα"
                            value={newClassData.room}
                            onChange={(e) =>
                              setNewClassData({
                                ...newClassData,
                                room: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="description"
                            className="text-sm font-medium"
                          >
                            Περιγραφή
                          </label>
                          <Textarea
                            id="description"
                            placeholder="Εισάγετε περιγραφή τάξης"
                            value={newClassData.description}
                            onChange={(e) =>
                              setNewClassData({
                                ...newClassData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewClassData({
                              name: "",
                              description: "",
                              teacher_id: "",
                              room: "",
                            });
                            setIsCreateClassDialogOpen(false);
                          }}
                          disabled={createClassLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateClass}
                          disabled={createClassLoading}
                        >
                          {createClassLoading
                            ? "Δημιουργείται..."
                            : "Δημιουργία τάξης"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Τάξεις</CardTitle>
                      <Input
                        placeholder="Αναζήτηση τάξεων..."
                        className="w-[250px]"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Όνομα τάξης</TableHead>
                          <TableHead>Καθηγητής</TableHead>
                          <TableHead>Πρόγραμμα</TableHead>
                          <TableHead>Μαθητές</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell>{classItem.name}</TableCell>
                            <TableCell>{classItem.teacher}</TableCell>
                            <TableCell>{classItem.schedule}</TableCell>
                            <TableCell>{classItem.students || 0}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        loadClassStudents(classItem.id)
                                      }
                                    >
                                      <Users className="h-3 w-3 mr-1" />
                                      Μαθητές
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {classItem.name} - Μαθητές
                                      </DialogTitle>
                                      <DialogDescription>
                                        Μαθητές που ανήκουν σε αυτή την τάξη
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Μαθητής</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Ενέργειες</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {classStudents.map((student) => (
                                            <TableRow key={student.id}>
                                              <TableCell>
                                                <div className="flex items-center gap-2">
                                                  <Avatar>
                                                    <AvatarImage
                                                      src={student.avatar}
                                                      alt={student.name}
                                                    />
                                                    <AvatarFallback>
                                                      {student.name.charAt(0)}
                                                    </AvatarFallback>
                                                  </Avatar>
                                                  <span>{student.name}</span>
                                                </div>
                                              </TableCell>
                                              <TableCell>
                                                {student.email}
                                              </TableCell>
                                              <TableCell>
                                                <AlertDialog>
                                                  <AlertDialogTrigger asChild>
                                                    <Button
                                                      variant="destructive"
                                                      size="sm"
                                                    >
                                                      <X className="h-3 w-3 mr-1" />
                                                      Remove
                                                    </Button>
                                                  </AlertDialogTrigger>
                                                  <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                      <AlertDialogTitle>
                                                        Αφαίρεση Μαθητή;
                                                      </AlertDialogTitle>
                                                      <AlertDialogDescription>
                                                        Είστε σίγουρος ότι
                                                        θέλετε να αφαιρέσετε
                                                        τον/την {student.name}{" "}
                                                        από την τάξη;
                                                      </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                      <AlertDialogCancel>
                                                        Ακύρωση
                                                      </AlertDialogCancel>
                                                      <AlertDialogAction
                                                        className="bg-red-500 hover:bg-red-600"
                                                        onClick={() =>
                                                          handleRemoveStudent(
                                                            student.id,
                                                            classItem.id,
                                                          )
                                                        }
                                                      >
                                                        Αφαίρεση
                                                      </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                  </AlertDialogContent>
                                                </AlertDialog>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Find the teacher_id from users array
                                    const teacher = users.find(
                                      (u) =>
                                        u.name === classItem.teacher &&
                                        u.role === "teacher",
                                    );
                                    setEditClassData({
                                      id: classItem.id,
                                      name: classItem.name,
                                      description: classItem.description || "",
                                      teacher_id: teacher?.id || "",
                                      room: classItem.room || "",
                                    });
                                    setIsEditClassDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Είστε σίγουρος;
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ΠΡΟΣΟΧΗ! Αυτή η αλλαγή είναι οριστική
                                        και δε μπορει να επαναφερθεί!
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Ακύρωση
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() =>
                                          handleDeleteClass(classItem.id)
                                        }
                                      >
                                        Διαγραφή
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "schedule":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Διαχείριση Προγράμματος
                    </h2>
                    <p className="text-muted-foreground">
                      Δημιουργία/Αλλαγή προγράμματος
                    </p>
                  </div>

                  <Dialog
                    open={isCreateScheduleDialogOpen}
                    onOpenChange={setIsCreateScheduleDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Προσθήκη Μαθήματος
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Δημιουργία Νέου Προγράμματος</DialogTitle>
                        <DialogDescription>
                          Προσθέστε ένα νέο μάθημα στο πρόγραμμα
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="schedule-class"
                            className="text-sm font-medium"
                          >
                            Τάξη
                          </label>
                          <Select
                            value={newScheduleData.class_id}
                            onValueChange={(value) =>
                              setNewScheduleData({
                                ...newScheduleData,
                                class_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τάξη" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem
                                  key={classItem.id}
                                  value={classItem.id}
                                >
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="schedule-day"
                            className="text-sm font-medium"
                          >
                            Μέρα
                          </label>
                          <Select
                            value={newScheduleData.day_of_week.toString()}
                            onValueChange={(value) =>
                              setNewScheduleData({
                                ...newScheduleData,
                                day_of_week: parseInt(value),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε μέρα" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Δευτέρα</SelectItem>
                              <SelectItem value="2">Τρίτη</SelectItem>
                              <SelectItem value="3">Τετάρτη</SelectItem>
                              <SelectItem value="4">Πέμπτη</SelectItem>
                              <SelectItem value="5">Παρασκευή</SelectItem>
                              <SelectItem value="6">Σάββατο</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="start-time"
                              className="text-sm font-medium"
                            >
                              Ώρα έναρξης
                            </label>
                            <Input
                              id="start-time"
                              type="time"
                              value={newScheduleData.start_time}
                              onChange={(e) =>
                                setNewScheduleData({
                                  ...newScheduleData,
                                  start_time: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label
                              htmlFor="end-time"
                              className="text-sm font-medium"
                            >
                              Ώρα λήξης
                            </label>
                            <Input
                              id="end-time"
                              type="time"
                              value={newScheduleData.end_time}
                              onChange={(e) =>
                                setNewScheduleData({
                                  ...newScheduleData,
                                  end_time: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="room" className="text-sm font-medium">
                            Αίθουσα
                          </label>
                          <Input
                            id="room"
                            placeholder="Αίθουσα"
                            value={newScheduleData.room}
                            onChange={(e) =>
                              setNewScheduleData({
                                ...newScheduleData,
                                room: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setNewScheduleData({
                              class_id: "",
                              day_of_week: 0,
                              start_time: "",
                              end_time: "",
                              room: "",
                            });
                            setIsCreateScheduleDialogOpen(false);
                          }}
                          disabled={createScheduleLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateSchedule}
                          disabled={createScheduleLoading}
                        >
                          {createScheduleLoading
                            ? "Δημιουργία..."
                            : "Δημιουργία Προγράμματος"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Πρόγραμμα Τάξεων</CardTitle>
                      <div className="flex gap-2">
                        <Select>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Φιλτράρισμα ανά μέρα" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Όλες τις μέρες</SelectItem>
                            <SelectItem value="monday">Δευτέρα</SelectItem>
                            <SelectItem value="tuesday">Τρίτη</SelectItem>
                            <SelectItem value="wednesday">Τετάρτη</SelectItem>
                            <SelectItem value="thursday">Πέμπτη</SelectItem>
                            <SelectItem value="friday">Παρασκευή</SelectItem>
                            <SelectItem value="saturday">Σάββατο</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Φιλτράρισμα ανά τάξη" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Όλες οι τάξεις</SelectItem>
                            {classes.map((classItem) => (
                              <SelectItem
                                key={classItem.id}
                                value={classItem.id.toString()}
                              >
                                {classItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Class</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Ενέργειες</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scheduleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.day}</TableCell>
                            <TableCell>{item.class}</TableCell>
                            <TableCell>{item.time}</TableCell>
                            <TableCell>{item.room}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const dayNames = [
                                      "Κυριακή",
                                      "Δευτέρα",
                                      "Τρίτη",
                                      "Τετάρτη",
                                      "Πέμπτη",
                                      "Παρασκευή",
                                      "Σάββατο",
                                    ];
                                    const dayIndex = dayNames.indexOf(item.day);
                                    const [startTime, endTime] =
                                      item.time.split(" - ");
                                    setEditScheduleData({
                                      id: item.id,
                                      class_id:
                                        classes.find(
                                          (c) => c.name === item.class,
                                        )?.id || "",
                                      day_of_week: dayIndex,
                                      start_time: startTime,
                                      end_time: endTime,
                                      room: item.room || "",
                                    });
                                    setIsEditScheduleDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Είσαι σίγουρος;
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        ΠΡΟΣΟΧΗ! Αυτή η αλλαγή είναι οριστική
                                        και δε μπορεί να επαναφερθεί!
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Ακύρωση
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600"
                                        onClick={() =>
                                          handleDeleteSchedule(item.id)
                                        }
                                      >
                                        Διαγραφή
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );

        case "assignments":
          return (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-background p-6 rounded-lg"
            >
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Ανάθεση μαθητών</h2>
                    <p className="text-muted-foreground">
                      Ανάθεσε μαθητές στις τάξεις
                    </p>
                  </div>

                  <Dialog
                    open={isAssignStudentsDialogOpen}
                    onOpenChange={setIsAssignStudentsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ανάθεση μαθητών
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ανάθεσε μαθητές σε τάξη</DialogTitle>
                        <DialogDescription>
                          Επιλέξτε μια τάξη και μαθητές για ανάθεση
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="assignment-class"
                            className="text-sm font-medium"
                          >
                            Τάξη
                          </label>
                          <Select
                            value={assignmentData.class_id}
                            onValueChange={(value) =>
                              setAssignmentData({
                                ...assignmentData,
                                class_id: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Επιλέξτε τάξη" />
                            </SelectTrigger>
                            <SelectContent>
                              {classes.map((classItem) => (
                                <SelectItem
                                  key={classItem.id}
                                  value={classItem.id}
                                >
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Επιλογή Μαθητών
                          </label>
                          <div className="border rounded-md p-4 h-[200px] overflow-y-auto">
                            {users
                              .filter((user) => user.role === "student")
                              .map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center space-x-2 py-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`student-${student.id}`}
                                    className="rounded border-gray-300"
                                    checked={assignmentData.student_ids.includes(
                                      student.id,
                                    )}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAssignmentData({
                                          ...assignmentData,
                                          student_ids: [
                                            ...assignmentData.student_ids,
                                            student.id,
                                          ],
                                        });
                                      } else {
                                        setAssignmentData({
                                          ...assignmentData,
                                          student_ids:
                                            assignmentData.student_ids.filter(
                                              (id) => id !== student.id,
                                            ),
                                        });
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`student-${student.id}`}
                                    className="text-sm"
                                  >
                                    {student.name}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAssignmentData({
                              class_id: "",
                              student_ids: [],
                            });
                            setIsAssignStudentsDialogOpen(false);
                          }}
                          disabled={assignStudentsLoading}
                        >
                          Ακύρωση
                        </Button>
                        <Button
                          onClick={handleAssignStudents}
                          disabled={assignStudentsLoading}
                        >
                          {assignStudentsLoading
                            ? "Ανάθεση..."
                            : "Ανάθεση Μαθητών"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="class-1">
                  <TabsList className="mb-4">
                    {classes.map((classItem) => (
                      <TabsTrigger
                        key={classItem.id}
                        value={`class-${classItem.id}`}
                      >
                        {classItem.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {classes.map((classItem) => (
                    <TabsContent
                      key={classItem.id}
                      value={`class-${classItem.id}`}
                    >
                      <Card>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>{classItem.name} - Μαθητές</CardTitle>
                            <Button
                              size="sm"
                              onClick={() => {
                                setAssignmentData({
                                  class_id: classItem.id,
                                  student_ids: [],
                                });
                                setIsAssignStudentsDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Προσθήκη μαθητών
                            </Button>
                          </div>
                          <CardDescription>
                            Διαχείριση μαθητών της τάξης
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Μαθητής</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Ενέργειες</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {classStudents.map((student) => (
                                <TableRow key={student.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar>
                                        <AvatarImage
                                          src={student.avatar}
                                          alt={student.name}
                                        />
                                        <AvatarFallback>
                                          {student.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{student.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{student.email}</TableCell>
                                  <TableCell>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                          <X className="h-3 w-3 mr-1" />
                                          Αφαίρεση
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Αφαίρεση μαθητή;
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Είστε σίγουρος ότι θέλετε να
                                            αφαιρέσετε τον/την {student.name}{" "}
                                            από την τάξη;
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>
                                            Ακύρωση
                                          </AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={() =>
                                              handleRemoveStudent(
                                                student.id,
                                                classItem.id,
                                              )
                                            }
                                          >
                                            Αφαίρεση
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </motion.div>
            </motion.div>
          );

        default:
          return (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Επιλέξτε μια επιλογή από την πλαϊνή μπάρα
              </p>
            </div>
          );
      }
    }

    // Default view if no role is specified
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">
          Συνδεθείτε για να δείτε αυτή τη σελίδα
        </p>
      </div>
    );
  };

  return <div className="w-full h-full bg-background">{renderContent()}</div>;
};

export default DashboardContent;
