import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  BookOpen,
  BarChart2,
  FileText,
  Users,
  Edit3,
  Clipboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "student" | "teacher" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Get current user data from auth context
  const currentUser: User = {
    id: user?.id || "1",
    name: user?.user_metadata?.name || "User",
    email: user?.email || "user@example.com",
    role: (user?.user_metadata?.role as UserRole) || "student",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "default"}`,
  };

  // Icon mapping
  const getIcon = (iconName: string) => {
    const iconMap = {
      layout: LayoutDashboard,
      calendar: Calendar,
      "book-open": BookOpen,
      "bar-chart-2": BarChart2,
      "file-text": FileText,
      bell: Bell,
      users: Users,
      "edit-3": Edit3,
      clipboard: Clipboard,
      settings: Settings,
    };
    return iconMap[iconName as keyof typeof iconMap] || LayoutDashboard;
  };

  // Navigation items based on user role
  const getNavigationItems = (role: UserRole) => {
    const commonItems = [
      { id: "overview", label: "Επισκόπηση", icon: "layout" },
      { id: "schedule", label: "Πρόγραμμα", icon: "calendar" },
    ];

    switch (role) {
      case "student":
        return [
          ...commonItems,
          { id: "classes", label: "Οι Τάξεις μου", icon: "book-open" },
          { id: "grades", label: "Βαθμοί", icon: "bar-chart-2" },
          { id: "files", label: "Αρχεία", icon: "file-text" },
          { id: "announcements", label: "Ανακοινώσεις", icon: "bell" },
        ];
      case "teacher":
        return [
          ...commonItems,
          { id: "classes", label: "Οι Τάξεις μου", icon: "book-open" },
          { id: "students", label: "Μαθητές", icon: "users" },
          { id: "files", label: "Αρχεία", icon: "file-text" },
          { id: "announcements", label: "Ανακοινώσεις", icon: "bell" },
          { id: "grades", label: "Διαχείριση Βαθμών", icon: "edit-3" },
        ];
      case "admin":
        return [
          ...commonItems,
          { id: "users", label: "Διαχείριση Χρηστών", icon: "users" },
          { id: "classes", label: "Διαχείριση Τάξεων", icon: "book-open" },
          {
            id: "assignments",
            label: "Αναθέσεις Μαθητών",
            icon: "clipboard",
          },
          { id: "settings", label: "Ρυθμίσεις Συστήματος", icon: "settings" },
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems(currentUser.role);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.div
        className={`bg-white border-r border-gray-200 ${isSidebarOpen ? "w-64" : "w-24"} transition-all duration-300 ease-in-out flex flex-col`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="relative h-20 flex items-center justify-center bg-gradient-to-r from-orange-50 to-white">
          {isSidebarOpen ? (
            <img
              src="src/img/nav-big.png"
              alt="Σχολική Πύλη"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <img
              src="src/img/nav-small.png"
              alt="Σχολική Πύλη"
              className="h-16 w-16 object-contain"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute top-2 right-2 z-10"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 pt-5 px-2">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const IconComponent = getIcon(item.icon);
              return (
                <li key={item.id}>
                  <Button
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className={`w-full justify-${isSidebarOpen ? "start" : "center"} h-10 px-3`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <IconComponent
                      size={18}
                      className={isSidebarOpen ? "mr-3" : ""}
                    />
                    <span className={`${!isSidebarOpen && "sr-only"}`}>
                      {item.label}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} />
                    <AvatarFallback>
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isSidebarOpen && (
                    <div className="text-left">
                      <p className="text-sm font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Προφίλ</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ρυθμίσεις</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Αποσύνδεση</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-xl font-semibold capitalize">
            Φροντιστήριο Διά'ζώσης
          </h2>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <div className="text-right">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {currentUser.role}
              </p>
            </div>
            <Avatar>
              <AvatarImage src={currentUser.avatarUrl} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <DashboardContent
            activeTab={activeTab}
            userRole={currentUser.role}
            userId={currentUser.id}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
