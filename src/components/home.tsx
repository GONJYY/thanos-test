import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoginModal from "./auth/LoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
} from "lucide-react";

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-white">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <motion.div
              className="flex flex-col justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Αριστεία στην</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  Εκπαίδευση
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                Καλώς ήρθατε στην ολοκληρωμένη εκπαιδευτική πλατφόρμα μας που
                σχεδιάστηκε για να ενδυναμώσει μαθητές και εκπαιδευτικούς με τα
                εργαλεία που χρειάζονται για να επιτύχουν στο σημερινό δυναμικό
                εκπαιδευτικό περιβάλλον.
              </p>
              <div className="mt-10">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={openLoginModal}
                    className="px-8 py-6 text-lg bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                  >
                    Σύνδεση στην Πλατφόρμα
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                className="relative overflow-hidden rounded-lg"
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <img
                  src="src/img/logo-nobg.png"
                  alt="logo"
                  className="rounded-lg shadow-xl transition-all duration-300 hover:bg-white hover:shadow-2xl"
                  style={{
                    filter: "drop-shadow(0 0 0 transparent)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.filter =
                      "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))";
                    e.currentTarget.style.boxShadow =
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.filter =
                      "drop-shadow(0 0 0 transparent)";
                    e.currentTarget.style.boxShadow =
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Τι προσφέρουμε
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Το Δια ζώσης μας προσφέρει εξατομικευμένες εμπειρίες για μαθητές
              και γονείς.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Student Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-100 text-orange-600 mb-4">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    E-Learning
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Παρακολούθηση μαθημάτων εξ'αποστάσεως</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Online Quizes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Διαδραστική εκπαίδευση</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Λήψη και προεπισκόπηση αρχείων</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Teacher Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-100 text-orange-600 mb-4">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Οι Γονείς:
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Μπορούν να παρακολουθούν online την επίδοση του παιδιού
                        τους
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Μπορούν να ενημερώνονται συνεχώς από τους εκπαιδευτικούς
                        για την πρόοδο του παιδιού τους
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        Μπορούν να παρακολουθούν τις απουσίες του παιδιού τους
                        και να ενημερώνονται άμεσα
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Admin Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-100 text-orange-600 mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Τα τμήματα:
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Είναι ολιγομελή μέχρι 4 μαθητών</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Είναι διαβαθμισμένης δυναμικότητας</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Τι Λένε οι μαθητές μας
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Ακούστε την γνώμη αριστούχων μαθητών του φροντιστηρίου μας
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img
                        src="https://www.oidaniko.edu.gr/sites/default/files/styles/200x200/public/2022-07/%CE%9A%CE%B1%CF%81%CE%B1%CF%84%CE%AC%CF%80%CE%B9%CE%B1%CF%82%20%CE%91%CF%80%CF%8C%CF%83%CF%84%CE%BF%CE%BB%CE%BF%CF%82-%20%CE%9F%CF%81%CE%AD%CF%83%CF%84%CE%B7%CF%82_0.jpg?itok=Ae75U73m"
                        alt="Student avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Τάπι Μπουρδελιάρης
                      </h4>
                      <p className="text-sm text-gray-600">69.000 μόρια</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"κάτι"</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img
                        src="https://www.oidaniko.edu.gr/sites/default/files/styles/200x200/public/2022-07/%CE%9A%CE%B1%CF%81%CE%B1%CF%84%CE%AC%CF%80%CE%B9%CE%B1%CF%82%20%CE%91%CF%80%CF%8C%CF%83%CF%84%CE%BF%CE%BB%CE%BF%CF%82-%20%CE%9F%CF%81%CE%AD%CF%83%CF%84%CE%B7%CF%82_0.jpg?itok=Ae75U73m"
                        alt="Teacher avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Τάπι Μπουρδελιάρης
                      </h4>
                      <p className="text-sm text-gray-600">69.000 μόρια</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"κάτι άλλο"</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                      <img
                        src="https://www.oidaniko.edu.gr/sites/default/files/styles/200x200/public/2022-07/%CE%9A%CE%B1%CF%81%CE%B1%CF%84%CE%AC%CF%80%CE%B9%CE%B1%CF%82%20%CE%91%CF%80%CF%8C%CF%83%CF%84%CE%BF%CE%BB%CE%BF%CF%82-%20%CE%9F%CF%81%CE%AD%CF%83%CF%84%CE%B7%CF%82_0.jpg?itok=Ae75U73m"
                        alt="Parent avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Τάπι Μπουρδελιάρης
                      </h4>
                      <p className="text-sm text-gray-600">69.000 μόρια</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"καλή φάση"</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Books Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Τα Βιβλία μας
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Ανακαλύψτε τη συλλογή των εκπαιδευτικών βιβλίων μας, που έχουν
              σχεδιαστεί για να εμπνεύσουν και να εκπαιδεύσουν.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Book 1 */}
            <motion.div
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <img
                  src="src/img/book-1.jpg"
                  alt="Εκπαιδευτικό Βιβλίο 1"
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,165,0,0.8)] group-hover:shadow-[inset_0_0_30px_rgba(255,165,0,1)] transition-all duration-300"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-bold mb-2">
                    Μαθηματικά Γ' Λυκείου ΓΕΛ (1° Τέυχος)
                  </h3>
                  <p className="text-sm">
                    Ορέστης Απόστολος Καρατάπιας | Βασίλης Χαριζόπουλος
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Book 2 */}
            <motion.div
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <img
                  src="src/img/book-2.jpg"
                  alt="Εκπαιδευτικό Βιβλίο 2"
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,165,0,0.8)] group-hover:shadow-[inset_0_0_30px_rgba(255,165,0,1)] transition-all duration-300"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-bold mb-2">
                    Μαθηματικά Γ' Λυκείου ΓΕΛ (2° Τέυχος)
                  </h3>
                  <p className="text-sm">
                    Ορέστης Απόστολος Καρατάπιας | Βασίλης Χαριζόπουλος
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Book 3 */}
            <motion.div
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10 }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <img
                  src="src/img/book-3.jpg"
                  alt="Εκπαιδευτικό Βιβλίο 3"
                  className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,165,0,0.8)] group-hover:shadow-[inset_0_0_30px_rgba(255,165,0,1)] transition-all duration-300"></div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-bold mb-2">
                    Μαθηματικά Γ' Λυκείου ΕΠΑΛ
                  </h3>
                  <p className="text-sm">
                    Ορέστης Απόστολος Καρατάπιας | Βασίλης Χαριζόπουλος
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="px-6 py-12 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Έτοιμοι να πετύχετε τους στόχους σας;
                </h2>
                <p className="mt-4 max-w-3xl text-lg text-orange-50">
                  Επικοινωνείστε μαζί μας για να ενταχθείτε στην ομάδα μας!
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:ml-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={openLoginModal}
                    className="px-8 py-6 text-lg bg-white text-orange-600 hover:bg-orange-50"
                  >
                    Σύνδεση
                    <Calendar className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Σχετικά με εμάς
              </h3>
              <p className="mt-4 text-gray-600">
                Το φροντιστήριο μας είναι αφιερωμένο στην παροχή αριστείας στην
                εκπαίδευση μέσω καινοτόμων μεθόδων διδασκαλίας και ενός
                υποστηρικτικού μαθησιακού περιβάλλοντος.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Επικοινωνία
              </h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>Μεγ. Αλεξάνδρου 39</li>
                <li>Εύοσμος, ΤΚ 562 24</li>
                <li>info@diazosis.edu.gr</li>
                <li>231 700 7444</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Μέσα Κοινωνικής Δικτύωσης
              </h3>
              <ul className="mt-4 space-y-2 text-gray-600">
                <li>
                  <a
                    href="https://www.instagram.com/diaz.osis/"
                    className="hover:text-orange-600 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="www.tiktok.com/@dia.zosis/"
                    className="hover:text-orange-600 transition-colors"
                  >
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-600">
              &copy; {new Date().getFullYear()} Αγγελούλης Παναγιώτης. Όλα τα
              δικαιώματα διατηρούνται.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </div>
  );
};

export default Home;
