import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Yükleniyor...</div>;

  // 1. Giriş kontrolü
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Rol kontrolü (Eğer roles prop'u gönderildiyse kontrol et)
  if (roles && !roles.includes(user.role)) {
    // Yetkisiz erişim denemesi
    // toast.error("Bu sayfaya erişim yetkiniz yok."); // İsteğe bağlı uyarı
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;