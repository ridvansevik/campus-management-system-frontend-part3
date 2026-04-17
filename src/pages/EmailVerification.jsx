import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import api from '../services/api'; // Axios instance'ımız
import { toast } from 'react-toastify';

const EmailVerification = () => {
  const { token } = useParams(); // URL'den token'ı al
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Backend API'ye istek at
        // NOT: Backend'deki endpoint POST methodu bekliyor
        await api.post('/auth/verify-email', { token });

        setStatus('success');
        setStatus('success');
        setMessage(t('email_verification.success_message'));
        toast.success(t('email_verification.success_message'));

        // 3 saniye sonra Login'e at
        setTimeout(() => {
          navigate('/login');
        }, 3000);

      } catch (error) {
        setStatus('error');
        const errorMessage = error.response?.data?.error || error.response?.data?.message || t('email_verification.error_message');
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setMessage(t('email_verification.no_token'));
      toast.error(t('email_verification.no_token'));
    }
  }, [token, navigate]);

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 3,
          padding: 4,
          borderRadius: 2,
          backgroundColor: 'white',
          textAlign: 'center'
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">{t('email_verification.loading')}</Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>{t('email_verification.success')}</Typography>
            <Alert severity="success">{message}</Alert>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>{t('email_verification.error')}</Typography>
            <Alert severity="error">{message}</Alert>
          </>
        )}
      </Box>
    </Container>
  );
};

export default EmailVerification;