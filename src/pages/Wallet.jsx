import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      toast.error(t('wallet.load_error'));
    }
  };

  const handleTopUp = async () => {
    const amountValue = parseFloat(amount);
    if (!amount || amountValue <= 0) {
      return toast.error(t('wallet.invalid_amount'));
    }
    if (amountValue < 50) {
      return toast.error(t('wallet.min_limit_error'));
    }

    try {
      setLoading(true);
      const res = await topUpWallet({ amount: amountValue });

      if (res.data.data.paymentUrl) {
        // Payment gateway'e yönlendir
        setPaymentModal({ open: true, paymentUrl: res.data.data.paymentUrl, paymentId: res.data.data.paymentId });
      } else {
        // Direkt başarılı (test modu)
        toast.success(t('wallet.success_topup'));
        setAmount('');
        fetchWalletData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('common.operation_failed'));
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
      toast.success(t('wallet.success_payment'));
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
    switch (type) {
      case 'deposit': return t('wallet.types.deposit');
      case 'payment': return t('wallet.types.payment');
      case 'withdrawal': return t('wallet.types.withdrawal');
      case 'pending': return t('wallet.types.pending');
      case 'refund': return t('wallet.types.refund');
      case 'transfer': return t('wallet.types.transfer');
      default: return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'deposit': return 'success';
      case 'payment': return 'error';
      case 'withdrawal': return 'error';
      case 'pending': return 'warning';
      case 'refund': return 'info';
      case 'transfer': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          {t('wallet.title')}
        </Typography>

        <Grid container spacing={3}>
          {/* Bakiye Kartı */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>{t('wallet.current_balance')}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                {parseFloat(balance).toFixed(2)} ₺
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, mt: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AddCircleIcon color="primary" />
                <Typography variant="h6">{t('wallet.top_up')}</Typography>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                {t('wallet.min_amount_alert')}
              </Alert>

              <TextField
                fullWidth
                label={t('wallet.amount_label')}
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputProps={{ min: 50, step: 0.01 }}
                sx={{ mb: 2 }}
                helperText={t('wallet.min_helper')}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleTopUp}
                disabled={loading || !amount || parseFloat(amount) < 50}
                startIcon={<CreditCardIcon />}
                size="large"
              >
                {loading ? t('wallet.processing') : t('wallet.process_payment')}
              </Button>
            </Paper>
          </Grid>

          {/* İşlem Geçmişi */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <HistoryIcon color="primary" />
                <Typography variant="h6">{t('wallet.history')}</Typography>
              </Box>

              {transactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('wallet.no_history')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <Table sx={{ minWidth: 600 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('wallet.date')}</TableCell>
                          <TableCell>{t('wallet.description')}</TableCell>
                          <TableCell align="right">{t('wallet.amount')}</TableCell>
                          <TableCell>{t('wallet.balance_after')}</TableCell>
                          <TableCell>{t('wallet.status')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((t) => (
                          <TableRow key={t.id} hover>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              {new Date(t.createdAt).toLocaleString('tr-TR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {t.description || '-'}
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                color={t.type === 'deposit' || t.type === 'refund' ? 'success.main' : 'error.main'}
                                fontWeight="bold"
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                {t.type === 'deposit' || t.type === 'refund' ? '+' : '-'}{parseFloat(t.amount).toFixed(2)} ₺
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
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
                  </Box>

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                        size="small"
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
          <DialogTitle>{t('wallet.payment_modal_title')}</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t('wallet.payment_redirect_alert')}
            </Alert>
            <Typography variant="body2">
              {t('wallet.payment_redirect_desc')}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentModal({ open: false, paymentUrl: null })}>
              {t('common.cancel')}
            </Button>
            <Button variant="contained" onClick={handlePaymentRedirect}>
              {t('wallet.go_to_payment')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default Wallet;