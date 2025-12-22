import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Container, Box, Typography, Button, Grid, Link as MuiLink, 
  InputAdornment, IconButton, Alert, Paper, CircularProgress 
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';

const validationSchema = Yup.object({
  email: Yup.string().email('Geçerli bir e-posta adresi giriniz').required('E-posta alanı zorunludur'),
  password: Yup.string().required('Şifre alanı zorunludur'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        await login(values.email, values.password);
        toast.success('Giriş başarılı! Yönlendiriliyorsunuz...');
        navigate('/dashboard');
      } catch (err) {
        // --- BEYAZ EKRAN SORUNU İÇİN GÜVENLİK KONTROLÜ ---
        let message = 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
        
        // Backend'den gelen hatayı kontrol et
        if (err.response?.data) {
          const apiError = err.response.data.error || err.response.data.message;
          // Eğer gelen hata bir string ise kullan, değilse varsayılan mesajı tut
          if (typeof apiError === 'string') {
            message = apiError;
          } else if (typeof apiError === 'object') {
             // Eğer obje gelirse (örn: validasyon hatası), stringe çevir veya ilkini al
             message = Object.values(apiError)[0] || JSON.stringify(apiError);
          }
        }
        
        setError(message);
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)', // Modern Gradient
      p: 2
    }}>
      <Container maxWidth="xs">
        <Paper elevation={24} sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 4,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            borderRadius: '50%', 
            color: 'white',
            mb: 2,
            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)' 
          }}>
            <LoginIcon fontSize="large" />
          </Box>
          
          <Typography component="h1" variant="h5" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Giriş Yap
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hesabınıza erişmek için bilgilerinizi girin.
          </Typography>

          {error && <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ width: '100%' }}>
            <FormInput formik={formik} name="email" label="E-posta Adresi" autoFocus />
            
            <FormInput 
              formik={formik} 
              name="password" 
              label="Şifre" 
              type={showPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
               <MuiLink component={Link} to="/forgot-password" variant="body2" sx={{ fontWeight: 600, textDecoration: 'none' }}>
                  Şifremi Unuttum?
               </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 3, py: 1.5, fontSize: '1rem', fontWeight: 700 }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
            </Button>
            
            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  Hesabınız yok mu?{' '}
                  <MuiLink component={Link} to="/register" variant="body2" sx={{ fontWeight: 600, textDecoration: 'none', color: 'primary.main' }}>
                    Kayıt Ol
                  </MuiLink>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;