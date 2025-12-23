import api from './api';

export const getAllEquipment = () => {
  return api.get('/equipment');
};

export const borrowEquipment = (data) => {
  // data: { equipmentId, dueDate }
  return api.post('/equipment/borrow', data);
};

export const returnEquipment = (data) => {
  // data: { loanId }
  return api.post('/equipment/return', data);
};

// Admin ekipman ekleme (İsteğe bağlı, backend'de create varsa)
export const createEquipment = (data) => {
  return api.post('/equipment', data);
};