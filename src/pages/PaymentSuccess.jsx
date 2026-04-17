import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Paper, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getBalance } from '../services/walletService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Mock payment için webhook'u tetikle
        if (sessionId && sessionId.startsWith('mock_')) {
          try {
            const api = (await import('../services/api')).default;
            // SessionId'den userId'yi parse et: mock_TIMESTAMP_USERID
            const sessionParts = sessionId.split('_');
            const userId = sessionParts.length > 2 ? sessionParts[2] : null;

            await api.post('/wallet/topup/webhook', {
              session_id: sessionId,
              status: 'success',
              amount: amount || 0,
              gateway: 'mock',
              userId: userId
            });
            console.log('Mock payment webhook tetiklendi');
          } catch (webhookError) {
            console.error('Webhook tetiklenemedi:', webhookError);
            // Webhook başarısız olsa bile devam et
          }
        }

        // Kısa bir süre bekle (webhook işlensin)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Bakiyeyi güncelle
        const balanceRes = await getBalance();
        setBalance(balanceRes.data.data.balance);

        toast.success(t('payment_success.toast_success'));
      } catch (error) {
        console.error('Bakiye güncellenemedi:', error);
        toast.error(t('payment_success.toast_error'));
      } finally {
        setLoading(false);
      }
    };

    if (sessionId || paymentId) {
      processPayment();
    } else {
      setLoading(false);
    }
  }, [sessionId, paymentId, amount]);

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {loading ? (
            <Box>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">{t('payment_success.processing')}</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {t('payment_success.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {t('payment_success.desc')}
                </Typography>
              </Box>

              {sessionId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{t('payment_success.session_id')}:</strong> {sessionId}
                  </Typography>
                </Alert>
              )}

              {paymentId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{t('payment_success.payment_id')}:</strong> {paymentId}
                  </Typography>
                </Alert>
              )}

              {amount && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    {t('payment_success.amount_loaded')}: {parseFloat(amount).toFixed(2)} ₺
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {t('payment_success.current_balance')}
                </Typography>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  {parseFloat(balance).toFixed(2)} ₺
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/wallet')}
                >
                  {t('payment_success.back_wallet')}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                >
                  {t('payment_success.back_home')}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </Layout>
  );
};

export default PaymentSuccess;

