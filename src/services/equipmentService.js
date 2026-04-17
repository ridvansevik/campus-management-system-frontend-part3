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

// Admin ekipman ekleme
export const createEquipment = (data) => {
  return api.post('/equipment', data);
};

// Admin ekipman silme
export const deleteEquipment = (id) => {
  return api.delete(`/equipment/${id}`);
};

// Admin ekipman güncelleme
export const updateEquipment = (id, data) => {
  return api.put(`/equipment/${id}`, data);
};