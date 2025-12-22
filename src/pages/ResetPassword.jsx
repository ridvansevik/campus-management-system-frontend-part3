import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Container, Box, Typography, TextField, Button, Avatar, Alert } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string().min(8).required('Zorunlu'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Eşleşmiyor').required('Zorunlu'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.put(`/auth/reset-password/${token}`, { password: values.password });
        toast.success('Şifre güncellendi.'); navigate('/login');
      } catch (err) {
        setError('Token geçersiz.'); toast.error('Hata.');
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
        <Avatar sx={{ m: 1, bgcolor: '#9c27b0', borderRadius: 1 }}> <KeyIcon /> </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>Yeni Şifre</Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField fullWidth margin="normal" name="password" label="Yeni Şifre" type="password" {...formik.getFieldProps('password')} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && formik.errors.password} />
          <TextField fullWidth margin="normal" name="confirmPassword" label="Tekrar" type="password" {...formik.getFieldProps('confirmPassword')} error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)} helperText={formik.touched.confirmPassword && formik.errors.confirmPassword} />
          
          <Button type="submit" fullWidth variant="contained" disableElevation sx={{ mt: 3, mb: 2, borderRadius: 0 }} disabled={formik.isSubmitting}>
            Şifreyi Güncelle
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;