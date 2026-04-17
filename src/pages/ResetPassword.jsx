import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Container, Box, Typography, TextField, Button, Avatar, Alert } from '@mui/material';
import KeyIcon from '@mui/icons-material/Key';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string().min(8).required('validation.required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'validation.passwords_mismatch').required('validation.required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await api.put(`/auth/reset-password/${token}`, { password: values.password });
        toast.success(t('reset_password.success'));
        navigate('/login');
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || t('reset_password.failed');
        setError(errorMessage);
        toast.error(errorMessage);
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
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>{t('reset_password.title')}</Typography>

        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
          <TextField fullWidth margin="normal" name="password" label={t('reset_password.new_password')} type="password" {...formik.getFieldProps('password')} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && t(formik.errors.password)} />
          <TextField fullWidth margin="normal" name="confirmPassword" label={t('reset_password.confirm')} type="password" {...formik.getFieldProps('confirmPassword')} error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)} helperText={formik.touched.confirmPassword && t(formik.errors.confirmPassword)} />

          <Button type="submit" fullWidth variant="contained" disableElevation sx={{ mt: 3, mb: 2, borderRadius: 0 }} disabled={formik.isSubmitting}>
            {t('reset_password.update')}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword;