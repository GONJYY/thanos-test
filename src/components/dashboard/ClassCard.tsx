import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Bell,
  ChevronRight,
} from "lucide-react";

interface ClassCardProps {
  id?: string;
  className?: string;
  name?: string;
  teacher?: string;
  schedule?: string;
  time?: string;
  studentCount?: number;
  gradeAverage?: number;
  announcementCount?: number;
  userRole?: "student" | "teacher" | "admin";
  onClick?: () => void;
}

const ClassCard = ({
  id = "1",
  className,
  name = "Mathematics 101",
  teacher = "Prof. John Smith",
  schedule = "Mon, Wed, Fri",
  time = "10:00 - 11:30 AM",
  studentCount = 24,
  gradeAverage = 85,
  announcementCount = 3,
  userRole = "student",
  onClick = () => console.log("Class card clicked"),
}: ClassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      <Card className="h-full overflow-hidden border-2 hover:border-orange-300 transition-all duration-300 bg-white">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{name}</CardTitle>
            <Badge
              variant="outline"
              className="bg-orange-100 text-orange-700 hover:bg-orange-200"
            >
              {userRole === "teacher" ? "Διδασκαλία" : "Εγγεγραμμένος"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {userRole !== "teacher" ? `Εκπαιδευτικός: ${teacher}` : ""}
          </p>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="text-sm">{schedule}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm">{time}</span>
            </div>

            {userRole === "student" && (
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full"
                    style={{ width: `${gradeAverage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{gradeAverage}%</span>
              </div>
            )}

            {userRole === "teacher" && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm">{studentCount} Μαθητές</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4 text-orange-500" />
              <span className="text-xs">Αρχεία</span>
            </div>
            <div className="flex items-center gap-1">
              <Bell className="h-4 w-4 text-orange-500" />
              <span className="text-xs">{announcementCount} Ανακοινώσεις</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 hover:bg-transparent hover:text-orange-500"
            onClick={onClick}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ClassCard;
