import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import BlogPage from "@/pages/blog";
import BlogDetail from "@/pages/blog-detail";
import PricingPage from "@/pages/pricing";
import ContactPage from "@/pages/contact";
import AuthPage from "@/pages/auth-page";
import TeacherDashboard from "@/pages/teacher-dashboard";
import TeacherStudents from "@/pages/teacher-students";
import TeacherLibrary from "@/pages/teacher-library";
import ParentDashboard from "@/pages/parent-dashboard";
import ParentChildren from "@/pages/parent-children";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminBooks from "@/pages/admin-books";
import AdminQuizzes from "@/pages/admin-quizzes";
import AdminUsers from "@/pages/admin-users";
import AdminBlog from "@/pages/admin-blog";
import AdminMessages from "@/pages/admin-messages";
import AdminPartners from "@/pages/admin-partners";
import AdminChallenges from "@/pages/admin-challenges";
import AdminApprovals from "@/pages/admin-approvals";
import AdminGenres from "@/pages/admin-genres";
import StudentDashboard from "@/pages/student-dashboard";
import ReaderDashboard from "@/pages/reader-dashboard";
import Library from "@/pages/library";
import BookDetail from "@/pages/book-detail";
import QuizPage from "@/pages/quiz-page";
import StudentResults from "@/pages/student-results";
import StudentProPage from "@/pages/student-pro";
import PublicLibrary from "@/pages/public-library";
import PublicBookDetail from "@/pages/public-book-detail";

import FAQPage from "@/pages/faq";
import GuidePage from "@/pages/guide";
import SchoolDashboard from "@/pages/school-dashboard";
import SchoolAdminDashboard from "@/pages/school-admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:id" component={BlogDetail} />
      <Route path="/cijene" component={PricingPage} />
      <Route path="/kontakt" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/vodic" component={GuidePage} />
      <Route path="/biblioteka" component={PublicLibrary} />
      <Route path="/knjiga/:id" component={PublicBookDetail} />
      <Route path="/prijava" component={AuthPage} />
      <Route path="/registracija" component={AuthPage} />
      <Route path="/ucenik" component={StudentDashboard} />
      <Route path="/ucenik/biblioteka" component={Library} />
      <Route path="/ucenik/knjiga/:id" component={BookDetail} />
      <Route path="/ucenik/kviz/:id" component={QuizPage} />
      <Route path="/ucenik/rezultati" component={StudentResults} />
      <Route path="/ucenik/pro" component={StudentProPage} />
      <Route path="/citanje" component={ReaderDashboard} />
      <Route path="/citanje/biblioteka" component={Library} />
      <Route path="/citanje/knjiga/:id" component={BookDetail} />
      <Route path="/citanje/kviz/:id" component={QuizPage} />
      <Route path="/citanje/rezultati" component={StudentResults} />
      <Route path="/citanje/pro" component={StudentProPage} />
      <Route path="/ucitelj" component={TeacherDashboard} />
      <Route path="/ucitelj/ucenici" component={TeacherStudents} />
      <Route path="/ucitelj/biblioteka" component={TeacherLibrary} />
      <Route path="/roditelj" component={ParentDashboard} />
      <Route path="/roditelj/djeca" component={ParentChildren} />
      <Route path="/skola" component={SchoolAdminDashboard} />
      <Route path="/skola/ucitelji" component={SchoolAdminDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/knjige" component={AdminBooks} />
      <Route path="/admin/zanrovi" component={AdminGenres} />
      <Route path="/admin/kvizovi" component={AdminQuizzes} />
      <Route path="/admin/korisnici" component={AdminUsers} />
      <Route path="/admin/blog" component={AdminBlog} />
      <Route path="/admin/poruke" component={AdminMessages} />
      <Route path="/admin/partneri" component={AdminPartners} />
      <Route path="/admin/izazovi" component={AdminChallenges} />
      <Route path="/admin/odobrenja" component={AdminApprovals} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
