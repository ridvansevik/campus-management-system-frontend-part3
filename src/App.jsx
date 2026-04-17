import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sayfa importları aynen kalsın...
import Home from './pages/Home';
import Login from './pages/Login';
import TermsOfUse from './pages/TermsOfUse';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import EmailVerification from './pages/EmailVerification';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import FacultyAttendance from './pages/FacultyAttendance';
import StudentAttendance from './pages/StudentAttendance';
import MyAttendance from './pages/MyAttendance';
import AttendanceReport from './pages/AttendanceReport';
import Gradebook from './pages/Gradebook';
import MyGrades from './pages/MyGrades';
import ExcuseRequest from './pages/ExcuseRequest';
import ExcuseApproval from './pages/ExcuseApproval';
import AdminCourses from './pages/AdminCourses';
import AdminSections from './pages/AdminSections';
import Announcements from './pages/Announcements';
import Wallet from './pages/Wallet';
import MealMenu from './pages/MealMenu';
import MyReservations from './pages/MyReservations';
import MySchedule from './pages/MySchedule';
import Events from './pages/Event';
import EventDetail from './pages/EventDetail';
import MyEvents from './pages/MyEvents';
import QRScanner from './pages/staff/QRScanner';
import MenuManagement from './pages/admin/MenuManagement';
import EventManagement from './pages/admin/EventManagement';
import GenerateSchedule from './pages/admin/GenerateSchedule';
import ClassroomReservations from './pages/ClassroomReservations';
import EventCheckIn from './pages/EventCheckIn';
import PaymentSuccess from './pages/PaymentSuccess';
import EquipmentManagement from './pages/admin/EquipmentManagement';
import ResourceUtilization from './pages/admin/ResourceUtilization';
import DepartmentSchedules from './pages/admin/DepartmentSchedules';
import DraftSchedules from './pages/admin/DraftSchedules';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Rotalar aynı kalıyor... */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
            <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
            <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
            <Route path="/attendance/faculty" element={<ProtectedRoute><FacultyAttendance /></ProtectedRoute>} />
            <Route path="/attendance/student" element={<ProtectedRoute><StudentAttendance /></ProtectedRoute>} />
            <Route path="/attendance/my-history" element={<ProtectedRoute><MyAttendance /></ProtectedRoute>} />
            <Route path="/attendance/reports" element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />
            <Route path="/grades/gradebook" element={<ProtectedRoute><Gradebook /></ProtectedRoute>} />
            <Route path="/grades/my-grades" element={<ProtectedRoute><MyGrades /></ProtectedRoute>} />
            <Route path="/attendance/excuse-request" element={<ProtectedRoute><ExcuseRequest /></ProtectedRoute>} />
            <Route path="/attendance/excuse-approval" element={<ProtectedRoute><ExcuseApproval /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/sections" element={<ProtectedRoute><AdminSections /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/meals/menu" element={<ProtectedRoute><MealMenu /></ProtectedRoute>} />
            <Route path="/meals/reservations" element={<ProtectedRoute><MyReservations /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><MySchedule /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            {/* Öğrenci ve Genel Route'lar */}
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute><ClassroomReservations /></ProtectedRoute>} />

            {/* Personel Route'ları (Yetki kontrolü eklenmeli: role="staff") */}
            <Route path="/staff/scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
            <Route path="/events/checkin" element={<ProtectedRoute><EventCheckIn /></ProtectedRoute>} />

            {/* Admin Route'ları (Yetki kontrolü eklenmeli: role="admin") */}
            <Route path="/admin/menus" element={<ProtectedRoute><MenuManagement /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute><EventManagement /></ProtectedRoute>} />
            <Route path="/admin/scheduling/generate" element={<ProtectedRoute><GenerateSchedule /></ProtectedRoute>} />
            <Route path="/admin/scheduling/drafts" element={<ProtectedRoute><DraftSchedules /></ProtectedRoute>} />
            <Route path="/admin/schedules/departments" element={<ProtectedRoute><DepartmentSchedules /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />

            <Route path="/admin/equipment" element={<EquipmentManagement />} />
            <Route path="/admin/reports" element={<ResourceUtilization />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;