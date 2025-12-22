import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getBalance } from '../services/walletService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
        
        toast.success('Ödeme başarılı! Bakiye güncellendi.');
      } catch (error) {
        console.error('Bakiye güncellenemedi:', error);
        toast.error('Bakiye güncellenemedi, lütfen sayfayı yenileyin.');
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
              <Typography variant="h6">Ödeme işleniyor...</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  Ödeme Başarılı!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Ödemeniz başarıyla tamamlandı.
                </Typography>
              </Box>

              {sessionId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Session ID:</strong> {sessionId}
                  </Typography>
                </Alert>
              )}

              {paymentId && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Payment ID:</strong> {paymentId}
                  </Typography>
                </Alert>
              )}

              {amount && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    Yüklenen Tutar: {parseFloat(amount).toFixed(2)} ₺
                  </Typography>
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Güncel Bakiyeniz
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
                  Cüzdana Dön
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/dashboard')}
                >
                  Ana Sayfaya Dön
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

