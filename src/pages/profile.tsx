import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, User, Mail, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { db, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "default"}`,
  );
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile data from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          return;
        }

        setUserProfile(data);
        if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user?.id]);

  // Get user data with defaults
  const userData = {
    id: user?.id || "",
    name: userProfile?.name || user?.user_metadata?.name || "User",
    email: userProfile?.email || user?.email || "user@example.com",
    role:
      userProfile?.role || (user?.user_metadata?.role as string) || "student",
    created_at:
      userProfile?.created_at || user?.created_at || new Date().toISOString(),
    avatar_url: userProfile?.avatar_url || avatarUrl,
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Σφάλμα",
        description: "Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Σφάλμα",
        description: "Παρακαλώ επιλέξτε μια εικόνα",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingAvatar(true);

    try {
      // Upload avatar using real storage
      const { data, error } = await db.updateUserAvatar(userData.id, file);

      if (error) {
        throw error;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        setUserProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }));

        toast({
          title: "Επιτυχία!",
          description: "Η φωτογραφία προφίλ ενημερώθηκε επιτυχώς!",
        });
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης φωτογραφίας προφίλ",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "student":
        return "Μαθητής";
      case "teacher":
        return "Καθηγητής";
      case "admin":
        return "Διαχειριστής";
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "teacher":
        return "bg-blue-500";
      case "student":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Προφίλ Χρήστη
              </h1>
              <p className="text-gray-600">
                Διαχείριση των στοιχείων του προφίλ σας
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" />
                Φωτογραφία Προφίλ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={userData.avatar_url}
                      alt={userData.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {userData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUpdatingAvatar}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{userData.name}</h3>
                  <p className="text-gray-600 mb-2">{userData.email}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getRoleBadgeColor(
                        userData.role,
                      )}`}
                    >
                      {getRoleDisplayName(userData.role)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={isUpdatingAvatar}
                    onClick={() => {
                      const input = document.querySelector(
                        'input[type="file"]',
                      ) as HTMLInputElement;
                      if (input) input.click();
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUpdatingAvatar ? "Ενημέρωση..." : "Αλλαγή Φωτογραφίας"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Προσωπικά Στοιχεία
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Πλήρες Όνομα
                  </Label>
                  <Input
                    id="name"
                    value={userData.name}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={userData.email}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Ρόλος
                  </Label>
                  <Input
                    id="role"
                    value={getRoleDisplayName(userData.role)}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="created" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ημερομηνία Εγγραφής
                  </Label>
                  <Input
                    id="created"
                    value={new Date(userData.created_at).toLocaleDateString(
                      "el-GR",
                    )}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">
                      Σημείωση
                    </h4>
                    <p className="text-sm text-blue-700">
                      Τα προσωπικά σας στοιχεία είναι μόνο για προβολή. Για
                      αλλαγές, επικοινωνήστε με τον διαχειριστή του συστήματος.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Στατιστικά Λογαριασμού</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {Math.floor(
                      (Date.now() - new Date(userData.created_at).getTime()) /
                        (1000 * 60 * 60 * 24),
                    )}
                  </div>
                  <div className="text-sm text-orange-700">Ημέρες Μέλος</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {userData.role === "student"
                      ? "Μαθητής"
                      : userData.role === "teacher"
                        ? "Καθηγητής"
                        : "Admin"}
                  </div>
                  <div className="text-sm text-blue-700">Τύπος Λογαριασμού</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    Ενεργός
                  </div>
                  <div className="text-sm text-green-700">Κατάσταση</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
