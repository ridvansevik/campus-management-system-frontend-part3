import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Button, TextField, Table, TableBody, 
  TableCell, TableHead, TableRow, Chip, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Pagination, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { getBalance, topUpWallet, getTransactions } from '../services/walletService';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [paymentModal, setPaymentModal] = useState({ open: false, paymentUrl: null });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, [page]);

  const fetchWalletData = async () => {
    try {
      const balanceRes = await getBalance();
      setBalance(balanceRes.data.data.balance);
      const transRes = await getTransactions(page, limit);
      setTransactions(transRes.data.data || []);
      // Pagination bilgisi backend'den gelirse
      if (transRes.data.pagination) {
        setTotalPages(Math.ceil(transRes.data.pagination.total / limit));
      }
    } catch (error) {
      console.error(error);
      toast.error('Veriler yüklenemedi');
    }
  };

  const handleTopUp = async () => {
    const amountValue = parseFloat(amount);
    if (!amount || amountValue <= 0) {
      return toast.error('Geçerli bir miktar girin');
    }
    if (amountValue < 50) {
      return toast.error('Minimum 50 TRY yükleyebilirsiniz');
    }
    
    try {
      setLoading(true);
      const res = await topUpWallet({ amount: amountValue });
      
      if (res.data.data.paymentUrl) {
        // Payment gateway'e yönlendir
        setPaymentModal({ open: true, paymentUrl: res.data.data.paymentUrl, paymentId: res.data.data.paymentId });
      } else {
        // Direkt başarılı (test modu)
        toast.success('Bakiye yüklendi!');
        setAmount('');
        fetchWalletData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRedirect = () => {
    if (paymentModal.paymentUrl) {
      window.location.href = paymentModal.paymentUrl;
    }
  };

  const handlePaymentSuccess = () => {
    // Payment gateway'den dönüş sonrası (URL'de ?paymentId=... parametresi varsa)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    if (paymentId) {
      toast.success('Ödeme başarılı! Bakiye güncelleniyor...');
      setTimeout(() => {
        fetchWalletData();
      }, 2000);
    }
  };

  useEffect(() => {
    // Sayfa yüklendiğinde payment success kontrolü
    handlePaymentSuccess();
  }, []);

  const getTransactionTypeLabel = (type) => {
    switch(type) {
      case 'deposit': return 'Yükleme';
      case 'withdrawal': return 'Harcama';
      case 'pending': return 'Beklemede';
      case 'refund': return 'İade';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch(type) {
      case 'deposit': return 'success';
      case 'withdrawal': return 'error';
      case 'pending': return 'warning';
      case 'refund': return 'info';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          Cüzdan
        </Typography>

        <Grid container spacing={3}>
          {/* Bakiye Kartı */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Mevcut Bakiye</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                {parseFloat(balance).toFixed(2)} ₺
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mt: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AddCircleIcon color="primary" />
                <Typography variant="h6">Para Yükle</Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Minimum yükleme tutarı: 50 ₺
              </Alert>

              <TextField 
                fullWidth 
                label="Miktar (TL)" 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: 50, step: 0.01 }}
                sx={{ mb: 2 }}
                helperText="Minimum 50 TRY"
              />
              
              <Button 
                variant="contained" 
                fullWidth 
                onClick={handleTopUp}
                disabled={loading || !amount || parseFloat(amount) < 50}
                startIcon={<CreditCardIcon />}
                size="large"
              >
                {loading ? 'İşleniyor...' : 'Ödeme Yap'}
              </Button>
            </Paper>
          </Grid>

          {/* İşlem Geçmişi */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">İşlem Geçmişi</Typography>
              </Box>

              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz işlem geçmişiniz yok.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Açıklama</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell>Bakiye Sonrası</TableCell>
                        <TableCell>Durum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell>
                            {new Date(t.createdAt).toLocaleString('tr-TR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>{t.description || '-'}</TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              color={t.type === 'deposit' || t.type === 'refund' ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)} ₺
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {t.balance_after ? `${parseFloat(t.balance_after).toFixed(2)} ₺` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getTransactionTypeLabel(t.type)} 
                              color={getTransactionTypeColor(t.type)} 
                              size="small" 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Payment Gateway Redirect Modal */}
        <Dialog open={paymentModal.open} onClose={() => setPaymentModal({ open: false, paymentUrl: null })}>
          <DialogTitle>Ödeme İşlemi</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Ödeme sayfasına yönlendirileceksiniz.
            </Alert>
            <Typography variant="body2">
              Ödeme işleminizi tamamladıktan sonra otomatik olarak buraya döneceksiniz.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentModal({ open: false, paymentUrl: null })}>
              İptal
            </Button>
            <Button variant="contained" onClick={handlePaymentRedirect}>
              Ödeme Sayfasına Git
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Wallet;