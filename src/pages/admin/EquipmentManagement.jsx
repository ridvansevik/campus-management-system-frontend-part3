import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, MenuItem,
  IconButton, Tooltip, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  VideoCameraFront as CameraIcon,
  Laptop as LaptopIcon,
  DevicesOther as OtherIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Build as MaintenanceIcon,
  HighlightOff as LostIcon
} from '@mui/icons-material';
import { getAllEquipment, createEquipment, deleteEquipment, updateEquipment } from '../../services/equipmentService';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const EquipmentManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  // Create Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', type: '', serial_number: '', condition: 'New', status: 'available' });

  // Update Modal State
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchEquipment = async () => {
    try {
      const response = await getAllEquipment();
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      toast.error(t('equipment_management.load_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleCreateSubmit = async () => {
    if (!newItem.name || !newItem.type) {
      toast.warning(t('equipment_management.required_fields'));
      return;
    }
    try {
      await createEquipment(newItem);
      toast.success(t('equipment_management.success_add'));
      setCreateOpen(false);
      setNewItem({ name: '', type: '', serial_number: '', condition: 'New', status: 'available' });
      fetchEquipment();
    } catch (err) {
      toast.error(t('equipment_management.error_add'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem.name || !selectedItem.type) {
      toast.warning(t('equipment_management.required_fields'));
      return;
    }
    try {
      await updateEquipment(selectedItem.id, selectedItem);
      toast.success(t('equipment_management.success_update'));
      setUpdateOpen(false);
      setSelectedItem(null);
      fetchEquipment();
    } catch (err) {
      toast.error(t('equipment_management.error_update'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('equipment_management.confirm_delete'))) return;
    try {
      await deleteEquipment(id);
      toast.success(t('equipment_management.success_delete'));
      fetchEquipment();
    } catch (err) {
      toast.error(t('equipment_management.error_delete'));
    }
  };

  const openUpdateModal = (item) => {
    setSelectedItem({ ...item });
    setUpdateOpen(true);
  };

  // Satır içi hızlı durum güncelleme (Admin Only)
  const handleQuickStatusChange = async (item, newStatus) => {
    try {
      await updateEquipment(item.id, { ...item, status: newStatus });
      toast.success(t('equipment_management.success_status'));
      // Tüm listeyi çekmek yerine sadece o item'ı güncellemek daha performanslı olur ama şimdilik fetch
      fetchEquipment();
    } catch (err) {
      toast.error(t('equipment_management.error_status'));
    }
  };

  const getIcon = (type) => {
    if (type?.toLowerCase().includes('kamera')) return <CameraIcon />;
    if (type?.toLowerCase().includes('laptop') || type?.toLowerCase().includes('bilgisayar')) return <LaptopIcon />;
    return <OtherIcon />;
  };

  const getStatusChip = (status) => {
    let color = 'default';
    let icon = null;
    let label = status;

    switch (status) {
      case 'available':
        color = 'success';
        icon = <CheckIcon />;
        label = t('equipment_management.status_labels.available');
        break;
      case 'borrowed':
        color = 'warning';
        icon = <WarningIcon />;
        label = t('equipment_management.status_labels.borrowed');
        break;
      case 'maintenance':
        color = 'error';
        icon = <MaintenanceIcon />;
        label = t('equipment_management.status_labels.maintenance');
        break;
      case 'lost':
        color = 'default';
        icon = <LostIcon />;
        label = t('equipment_management.status_labels.lost');
        break;
      default:
        color = 'default';
    }

    return <Chip label={label} color={color} size="small" icon={icon} sx={{ fontWeight: 600 }} />;
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            {t('equipment_management.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('equipment_management.subtitle')}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            {t('equipment_management.new_equipment')}
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('equipment_management.equipment_name')}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('equipment_management.type')}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('equipment_management.status')}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>{t('equipment_management.serial_number')}</TableCell>
                {isAdmin && <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>{t('equipment_management.actions')}</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">{t('equipment_management.no_equipment')}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: '#e0f2fe', color: '#0284c7', borderRadius: 2 }}>
                          {getIcon(item.type)}
                        </Box>
                        <Typography fontWeight={500}>{item.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>
                      {isAdmin ? (
                        <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                          <Select
                            value={item.status}
                            onChange={(e) => handleQuickStatusChange(item, e.target.value)}
                            disableUnderline
                            sx={{ fontSize: '0.875rem', fontWeight: 600 }}
                          >
                            <MenuItem value="available" sx={{ color: 'success.main' }}>{t('equipment_management.status_labels.available')}</MenuItem>
                            <MenuItem value="borrowed" sx={{ color: 'warning.main' }}>{t('equipment_management.status_labels.borrowed')}</MenuItem>
                            <MenuItem value="maintenance" sx={{ color: 'error.main' }}>{t('equipment_management.status_labels.maintenance')}</MenuItem>
                            <MenuItem value="lost" sx={{ color: 'text.disabled' }}>{t('equipment_management.status_labels.lost')}</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        getStatusChip(item.status)
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" sx={{ bgcolor: '#f1f5f9', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                        {item.serial_number || '-'}
                      </Typography>
                    </TableCell>

                    {isAdmin && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title={t('equipment_management.edit')}>
                            <IconButton size="small" color="primary" onClick={() => openUpdateModal(item)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('equipment_management.delete')}>
                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Yeni Ekipman Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('equipment_management.add_equipment')}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('equipment_management.equipment_name')}
              fullWidth
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              select
              label={t('equipment_management.type')}
              fullWidth
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            >
              <MenuItem value="Laptop">Laptop</MenuItem>
              <MenuItem value="Kamera">Kamera</MenuItem>
              <MenuItem value="Projektör">Projektör</MenuItem>
              <MenuItem value="Tablet">Tablet</MenuItem>
              <MenuItem value="Diğer">Diğer</MenuItem>
            </TextField>
            <TextField
              label={t('equipment_management.serial_number')}
              fullWidth
              value={newItem.serial_number}
              onChange={(e) => setNewItem({ ...newItem, serial_number: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>{t('equipment_management.status')}</InputLabel>
              <Select
                value={newItem.status}
                label={t('equipment_management.status')}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
              >
                <MenuItem value="available">{t('equipment_management.status_labels.available')}</MenuItem>
                <MenuItem value="borrowed">{t('equipment_management.status_labels.borrowed')}</MenuItem>
                <MenuItem value="maintenance">{t('equipment_management.status_labels.maintenance')}</MenuItem>
                <MenuItem value="lost">{t('equipment_management.status_labels.lost')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('equipment_management.cancel')}</Button>
          <Button onClick={handleCreateSubmit} variant="contained">{t('equipment_management.add')}</Button>
        </DialogActions>
      </Dialog>

      {/* Güncelleme Modalı */}
      <Dialog open={updateOpen} onClose={() => setUpdateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('equipment_management.edit_equipment')}</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label={t('equipment_management.equipment_name')}
                fullWidth
                value={selectedItem.name}
                onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
              />
              <TextField
                select
                label={t('equipment_management.type')}
                fullWidth
                value={selectedItem.type}
                onChange={(e) => setSelectedItem({ ...selectedItem, type: e.target.value })}
              >
                <MenuItem value="Laptop">Laptop</MenuItem>
                <MenuItem value="Kamera">Kamera</MenuItem>
                <MenuItem value="Projektör">Projektör</MenuItem>
                <MenuItem value="Tablet">Tablet</MenuItem>
                <MenuItem value="Diğer">Diğer</MenuItem>
              </TextField>
              <TextField
                label={t('equipment_management.serial_number')}
                fullWidth
                value={selectedItem.serial_number}
                onChange={(e) => setSelectedItem({ ...selectedItem, serial_number: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>{t('equipment_management.status')}</InputLabel>
                <Select
                  value={selectedItem.status}
                  label={t('equipment_management.status')}
                  onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                >
                  <MenuItem value="available">{t('equipment_management.status_labels.available')}</MenuItem>
                  <MenuItem value="borrowed">{t('equipment_management.status_labels.borrowed')}</MenuItem>
                  <MenuItem value="maintenance">{t('equipment_management.status_labels.maintenance')}</MenuItem>
                  <MenuItem value="lost">{t('equipment_management.status_labels.lost')}</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateOpen(false)}>{t('equipment_management.cancel')}</Button>
          <Button onClick={handleUpdate} variant="contained">{t('equipment_management.update')}</Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default EquipmentManagement;