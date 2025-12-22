import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 1. Token süresini kontrol et
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token süresi dolmuş
          console.log("Token süresi doldu, çıkış yapılıyor.");
          logout();
        } else {
          // 2. Token geçerliyse Backend'den FULL kullanıcı verisini çek
          try {
            const res = await api.get('/users/me');
            setUser(res.data.data);
          } catch (apiError) {
             // API hata verirse (örn: 401), demek ki token backend tarafında geçersiz
             console.log("Token geçersiz, API 401 döndü.");
             logout();
          }
        }
      } catch (error) {
        // Token bozuksa (decode edilemiyorsa)
        console.log("Token decode hatası:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    // Önce temel login işlemini yap
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data.data;

    // Tokenları sakla
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    try {
      const meRes = await api.get('/users/me');
      setUser(meRes.data.data);
    } catch (e) {
      // Her ihtimale karşı, /users/me hata verirse login cevabındaki user'ı fallback olarak kullan
      setUser(user);
    }

    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);