import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Container, Box, Typography, Button, Avatar, Link as MuiLink, Alert } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';

const ForgotPassword = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({ email: Yup.string().email().required('Zorunlu') }),
    onSubmit: async (values, { setSubmitting }) => {
      setMessage(''); setError('');
      try {
        await api.post('/auth/forgot-password', { email: values.email });
        setMessage('Bağlantı gönderildi.'); toast.success('Gönderildi.');
      } catch (err) {
        setError(err.response?.data?.error || 'Hata.'); toast.error('Hata.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{
        mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4,
        borderRadius: 0, boxShadow: 'none', border: '1px solid #e0e0e0', bgcolor: 'background.paper' // FLAT
      }}>
        <Avatar sx={{ m: 1, bgcolor: '#ed6c02', borderRadius: 1 }}> <LockResetIcon /> </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>Şifre Sıfırla</Typography>
        
        {message && <Alert severity="success" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 2, width: '100%' }}>
          <FormInput formik={formik} name="email" label="E-posta" />
          <Button type="submit" fullWidth variant="contained" disableElevation sx={{ mt: 3, mb: 2, borderRadius: 0 }} disabled={formik.isSubmitting}>
            Bağlantı Gönder
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/login" variant="body2" sx={{ textDecoration: 'none' }}>Geri Dön</MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;