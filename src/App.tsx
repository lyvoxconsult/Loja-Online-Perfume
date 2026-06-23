import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingState } from "@/components/common/LoadingState";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Courses = lazy(() => import("./pages/Courses"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Teachers = lazy(() => import("./pages/Teachers"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentAgenda = lazy(() => import("./pages/student/Agenda"));
const Materials = lazy(() => import("./pages/student/Materials"));
const ProgressPage = lazy(() => import("./pages/student/Progress"));
const Communications = lazy(() => import("./pages/student/Communications"));
const StudentExercises = lazy(() => import("./pages/student/Exercises"));
const StudentBlog = lazy(() => import("./pages/student/Blog"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const ManagerDashboard = lazy(() => import("./pages/manager/Dashboard"));
const ManagerAgenda = lazy(() => import("./pages/manager/Agenda"));
const ManagerTurmas = lazy(() => import("./pages/manager/Turmas"));
const ManagerCommunications = lazy(() => import("./pages/manager/Communications"));
const ManagerStudents = lazy(() => import("./pages/manager/Students"));
const ManagerMaterials = lazy(() => import("./pages/manager/Materials"));
const ManagerHistory = lazy(() => import("./pages/manager/History"));
const ManagerContent = lazy(() => import("./pages/manager/Content"));
const ManagerBlog = lazy(() => import("./pages/manager/Blog"));
const ManagerCourses = lazy(() => import("./pages/manager/Courses"));
const ManagerFinance = lazy(() => import("./pages/manager/Finance"));
const ManagerTeachers = lazy(() => import("./pages/manager/Teachers"));
const ManagerReports = lazy(() => import("./pages/manager/Reports"));
const ManagerSettings = lazy(() => import("./pages/manager/Settings"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-[50vh] grid place-items-center"><LoadingState label="Carregando módulo..." /></div>}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/cursos" element={<Courses />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/professores" element={<Teachers />} />
              <Route path="/contato" element={<Contact />} />
            </Route>

            <Route path="/login" element={<Login />} />

            {/* Área do Aluno */}
            <Route
              element={
                <ProtectedRoute requireRole="aluno">
                  <DashboardLayout role="aluno" />
                </ProtectedRoute>
              }
            >
              <Route path="/aluno/dashboard" element={<StudentDashboard />} />
              <Route path="/aluno/agenda" element={<StudentAgenda />} />
              <Route path="/aluno/aulas" element={<StudentAgenda />} />
              <Route path="/aluno/calendario" element={<StudentAgenda />} />
              <Route path="/aluno/materiais" element={<Materials />} />
              <Route path="/aluno/exercicios" element={<StudentExercises />} />
              <Route path="/aluno/blog" element={<StudentBlog />} />
              <Route path="/aluno/progresso" element={<ProgressPage />} />
              <Route path="/aluno/comunicacoes" element={<Communications />} />
              <Route path="/aluno/perfil" element={<StudentProfile />} />
            </Route>

            {/* Área do Gestor */}
            <Route
              element={
                <ProtectedRoute requireRole="gestor">
                  <DashboardLayout role="gestor" />
                </ProtectedRoute>
              }
            >
              <Route path="/gestor/dashboard" element={<ManagerDashboard />} />
              <Route path="/gestor/agenda" element={<ManagerAgenda />} />
              <Route path="/gestor/turmas" element={<ManagerTurmas />} />
              <Route path="/gestor/alunos" element={<ManagerStudents />} />
              <Route path="/gestor/professores" element={<ManagerTeachers />} />
              <Route path="/gestor/comunicacoes" element={<ManagerCommunications />} />
              <Route path="/gestor/conteudo" element={<ManagerContent />} />
              <Route path="/gestor/materiais" element={<ManagerMaterials />} />
              <Route path="/gestor/blog" element={<ManagerBlog />} />
              <Route path="/gestor/cursos" element={<ManagerCourses />} />
              <Route path="/gestor/financeiro" element={<ManagerFinance />} />
              <Route path="/gestor/historico" element={<ManagerHistory />} />
              <Route path="/gestor/relatorios" element={<ManagerReports />} />
              <Route path="/gestor/configuracoes" element={<ManagerSettings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
