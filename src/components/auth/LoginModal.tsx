import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginSuccess?: (userData: any) => void;
}

const loginSchema = z.object({
  email: z.string().email("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email"),
  password: z
    .string()
    .min(6, "Ο κωδικός πρόσβασης πρέπει να έχει τουλάχιστον 6 χαρακτήρες"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = false,
  onClose = () => {},
  onLoginSuccess = () => {},
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await signIn(
        values.email,
        values.password,
      );

      if (authError) {
        console.error("Auth error:", authError);
        setError(authError.message || "Σφάλμα κατά τη σύνδεση");
        return;
      }

      if (data?.user) {
        try {
          // Get user role from database with better error handling
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role, name")
            .eq("id", data.user.id)
            .single();

          if (userError) {
            console.error("User data fetch error:", userError);
            // If user doesn't exist in users table, use metadata or defaults
            const userRole = data.user.user_metadata?.role || "student";
            const userName =
              data.user.user_metadata?.name ||
              data.user.email?.split("@")[0] ||
              "User";

            console.warn("Using fallback user data:", { userRole, userName });

            onLoginSuccess({
              id: data.user.id,
              email: data.user.email,
              role: userRole,
              name: userName,
            });
          } else {
            // Successfully got user data from database
            const userRole = userData?.role || "student";
            const userName =
              userData?.name || data.user.email?.split("@")[0] || "User";

            onLoginSuccess({
              id: data.user.id,
              email: data.user.email,
              role: userRole,
              name: userName,
            });
          }

          onClose();
          navigate("/dashboard");
        } catch (dbError: any) {
          console.error("Database connection error:", dbError);
          // Fallback to user metadata if database is unreachable
          const userRole = data.user.user_metadata?.role || "student";
          const userName =
            data.user.user_metadata?.name ||
            data.user.email?.split("@")[0] ||
            "User";

          onLoginSuccess({
            id: data.user.id,
            email: data.user.email,
            role: userRole,
            name: userName,
          });

          onClose();
          navigate("/dashboard");
        }
      } else {
        setError("Δεν ήταν δυνατή η σύνδεση. Παρακαλώ δοκιμάστε ξανά.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message?.includes("fetch")) {
        setError(
          "Πρόβλημα σύνδεσης με τον διακομιστή. Παρακαλώ ελέγξτε τη σύνδεσή σας στο διαδίκτυο.",
        );
      } else {
        setError(error.message || "Παρουσιάστηκε σφάλμα κατά τη σύνδεση");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Καλώς Ήρθατε Πίσω
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Συνδεθείτε για να αποκτήσετε πρόσβαση στον λογαριασμό σας
          </DialogDescription>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your.email@example.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Σύνδεση...
                    </>
                  ) : (
                    "Σύνδεση"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
