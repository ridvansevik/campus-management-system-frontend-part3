import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sayfa importları aynen kalsın...
import Home from './pages/Home';
import Login from './pages/Login';
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5', // Modern Indigo
      light: '#818cf8',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ec4899', // Canlı Pembe (Accent)
    },
    background: {
      default: '#f3f4f6', // Çok açık gri (Soğuk ton)
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // Tam siyah değil, koyu gri
      secondary: '#6b7280',
    },
  },
  shape: {
    borderRadius: 16, // Daha yuvarlak, modern köşeler
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, // Büyük harf zorunluluğunu kaldır
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          padding: '10px 24px',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', // Hoverda soft gölge
            transform: 'translateY(-1px)', // Hafif yukarı kalkma efekti
          },
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // Tailwind tarzı soft gölge
          border: '1px solid rgba(229, 231, 235, 0.5)', // Çok hafif border
        },
        elevation1: {
           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        }
      }
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
       <Router>
        {/* Rotalar aynı kalıyor... */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          <Route path="*" element={<NotFound />} />

          <Route path="/admin/equipment" element={<EquipmentManagement />} />
          <Route path="/admin/reports" element={<ResourceUtilization />} />
        </Routes>
      </Router>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;