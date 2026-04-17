import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Container, Box, Typography, Button, Avatar, Link as MuiLink, Alert } from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({ email: Yup.string().email('validation.email_invalid').required('validation.required') }),
    onSubmit: async (values, { setSubmitting }) => {
      setMessage(''); setError('');
      try {
        await api.post('/auth/forgot-password', { email: values.email });
        setMessage(t('forgot_password.email_sent'));
        toast.success(t('forgot_password.email_sent'));
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.response?.data?.message || t('forgot_password.failed');
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
        <Avatar sx={{ m: 1, bgcolor: '#ed6c02', borderRadius: 1 }}> <LockResetIcon /> </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>{t('forgot_password.title')}</Typography>

        {message && <Alert severity="success" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%', borderRadius: 0 }}>{error}</Alert>}

        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 2, width: '100%' }}>
          <FormInput formik={formik} name="email" label={t('common.email')} />
          <Button type="submit" fullWidth variant="contained" disableElevation sx={{ mt: 3, mb: 2, borderRadius: 0 }} disabled={formik.isSubmitting}>
            {t('forgot_password.send_link')}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={Link} to="/login" variant="body2" sx={{ textDecoration: 'none' }}>{t('forgot_password.back_login')}</MuiLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;