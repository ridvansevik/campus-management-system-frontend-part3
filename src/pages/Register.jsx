import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import {
  Container, Box, Typography, Button, Grid, Link as MuiLink,
  MenuItem, TextField, Checkbox, FormControlLabel, Paper, Alert,
  CircularProgress, InputAdornment, IconButton, useTheme
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const validationSchema = Yup.object({
  name: Yup.string().required('validation.name_required'),
  email: Yup.string().email('validation.email_invalid').required('validation.email_required'),
  password: Yup.string().min(8, 'validation.password_min').required('validation.password_required'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'validation.passwords_mismatch').required('validation.required'),
  role: Yup.string().required('validation.required'),
  department_id: Yup.string().nullable(),
  terms: Yup.boolean().oneOf([true], 'validation.accept_terms'),
  student_number: Yup.string().when('role', {
    is: 'student', then: (schema) => schema.required('validation.required'), otherwise: (schema) => schema.optional(),
  }),
});

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // Bölümleri backend'den çek
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        setDepartments(res.data.data || []);
      } catch (err) {
        console.error('Bölümler yüklenemedi:', err);
        // Hata durumunda sayfa crash etmesin
        // Backend public yapıldıysa bu hata olmamalı, ama yine de güvenli tutuyoruz
        setDepartments([]); // Boş array ile devam et
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '', role: 'student', department_id: '', student_number: '', terms: false },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError('');
      try {
        // department_id boşsa null gönder (UUID bekliyor)
        const requestData = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          department_id: values.department_id || null, // Boşsa null gönder
          ...(values.role === 'student' && { student_number: values.student_number }),
        };
        await register(requestData);
        toast.success(t('register.success'));
        setTimeout(() => navigate('/login'), 2000);
      } catch (err) {
        // Güvenli Hata Mesajı
        let message = t('register.failed');
        if (err.response?.data) {
          const apiError = err.response.data.error || err.response.data.message;
          if (typeof apiError === 'string') message = apiError;
          else if (typeof apiError === 'object') message = Object.values(apiError)[0] || JSON.stringify(apiError);
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
      background: isDarkMode
        ? 'linear-gradient(135deg, #1e1b4b 0%, #831843 100%)'
        : 'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)',
      py: 5, px: 2
    }}>
      <Container maxWidth="sm">
        <Paper elevation={24} sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Box sx={{
              p: 2, bgcolor: 'secondary.main', borderRadius: '50%',
              color: 'white', mb: 2, boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)'
            }}>
              <PersonAddIcon fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {t('register.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('register.desc')}
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label={t('common.name')} name="name" value={formik.values.name} onChange={formik.handleChange} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && t(formik.errors.name)} />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label={t('common.email')} name="email" value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && t(formik.errors.email)} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth select label={t('common.role')} name="role"
                  value={formik.values.role} onChange={formik.handleChange}
                  error={formik.touched.role && Boolean(formik.errors.role)}
                  helperText={formik.touched.role && t(formik.errors.role)}
                >
                  <MenuItem value="student">{t('common.student')}</MenuItem>
                  <MenuItem value="faculty">{t('common.faculty')}</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label={t('common.department')}
                  name="department_id"
                  value={formik.values.department_id || ''}
                  onChange={formik.handleChange}
                  error={formik.touched.department_id && Boolean(formik.errors.department_id)}
                  disabled={loadingDepartments}
                  helperText={loadingDepartments ? t('common.loading') : (formik.touched.department_id && t(formik.errors.department_id))}
                >
                  <MenuItem value="">{t('common.choose_department')}</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {formik.values.role === 'student' && (
                <Grid item xs={12}>
                  <TextField fullWidth label={t('common.student_number')} name="student_number" value={formik.values.student_number} onChange={formik.handleChange} error={formik.touched.student_number && Boolean(formik.errors.student_number)} helperText={formik.touched.student_number && t(formik.errors.student_number)} />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label={t('common.password')} name="password" type={showPassword ? 'text' : 'password'}
                  value={formik.values.password} onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && t(formik.errors.password)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label={t('common.confirm_password')} name="confirmPassword" type="password"
                  value={formik.values.confirmPassword} onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && t(formik.errors.confirmPassword)}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox name="terms" checked={formik.values.terms} onChange={formik.handleChange} color="primary" />}
                  label={
                    <Typography variant="body2">
                      <MuiLink
                        component={Link}
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'primary.main' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('common.read_terms')}
                      </MuiLink> {t('common.and_accept')}
                    </Typography>
                  }
                />
                {formik.touched.terms && formik.errors.terms && <Typography variant="caption" color="error" display="block">{t(formik.errors.terms)}</Typography>}
              </Grid>
            </Grid>

            <Button
              type="submit" fullWidth variant="contained" size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : t('register.create_account')}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  {t('register.already_member')} <MuiLink component={Link} to="/login" sx={{ fontWeight: 600, textDecoration: 'none' }}>{t('login.title')}</MuiLink>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;