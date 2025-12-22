import api from './api';

export const getBalance = () => api.get('/wallet/balance');
export const topUpWallet = (data) => api.post('/wallet/topup', data); // Returns paymentUrl
export const getTransactions = (page = 1, limit = 10) => api.get(`/wallet/transactions?page=${page}&limit=${limit}`);