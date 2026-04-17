import { useState, useEffect } from 'react';
import {
  Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, CircularProgress, Box, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const AdminCourses = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal ve Form State
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    code: '', name: '', description: '', credits: '', ects: '', departmentId: '',
    prerequisiteId: '' // <--- YENİ STATE
  });

  // Verileri Getir
  const fetchData = async () => {
    try {
      const [coursesRes, deptsRes] = await Promise.all([
        api.get('/courses?limit=100'), // Tümünü getir (sayfalama eklenebilir)
        api.get('/departments')
      ]);
      setCourses(coursesRes.data.data);
      setDepartments(deptsRes.data.data);
    } catch (error) {
      console.error(t('admin_courses.load_error') + ":", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') fetchData();
  }, [user]);

  // Modal İşlemleri
  const handleOpen = () => {
    setEditMode(false);
    setFormData({ code: '', name: '', description: '', credits: '', ects: '', departmentId: '' });
    setOpen(true);
  };

  const handleEdit = (course) => {
    setEditMode(true);
    setCurrentId(course.id);
    setFormData({
      code: course.code,
      name: course.name,
      description: course.description || '',
      credits: course.credits,
      ects: course.ects,
      departmentId: course.departmentId || '',
      prerequisiteId: course.prerequisiteId || '' // <--- YENİ
    });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  // Form Submit (Ekleme/Güncelleme)
  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/courses/${currentId}`, formData);
        toast.success(t('admin_courses.success_update'));
      } else {
        await api.post('/courses', formData);
        toast.success(t('admin_courses.success_add'));
      }
      handleClose();
      fetchData(); // Listeyi yenile
    } catch (error) {
      toast.error(error.response?.data?.error || t('admin_courses.error_operation'));
    }
  };

  // Silme İşlemi
  const handleDelete = async (id) => {
    if (!window.confirm(t('admin_courses.confirm_delete'))) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success(t('admin_courses.success_delete'));
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      toast.error(t('admin_courses.error_delete'));
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {t('admin_courses.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{ borderRadius: 0 }}
          disableElevation
        >
          {t('admin_courses.add_new')}
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('admin_courses.table.code')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('admin_courses.table.name')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('admin_courses.table.department')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('admin_courses.table.credits_ects')}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('admin_courses.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} hover>
                <TableCell>{course.code}</TableCell>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.department?.name || '-'}</TableCell>
                <TableCell>{course.credits} / {course.ects}</TableCell>
                <TableCell align="right">
                  <Tooltip title={t('common.edit') || "Edit"}>
                    <IconButton color="primary" onClick={() => handleEdit(course)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.delete')}>
                    <IconButton color="error" onClick={() => handleDelete(course.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ekleme/Düzenleme Modal */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? t('admin_courses.edit_title') : t('admin_courses.create_title')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                label={t('admin_courses.form.code')}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                label={t('admin_courses.form.department')}
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                fullWidth
                size="small"
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('admin_courses.form.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t('admin_courses.form.credits')}
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label={t('admin_courses.form.ects')}
                type="number"
                value={formData.ects}
                onChange={(e) => setFormData({ ...formData, ects: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('admin_courses.form.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label={t('admin_courses.form.prerequisite')}
                value={formData.prerequisiteId}
                onChange={(e) => setFormData({ ...formData, prerequisiteId: e.target.value })}
                fullWidth
                size="small"
                helperText={t('admin_courses.form.prerequisite_helper')}
              >
                <MenuItem value="">
                  <em>{t('admin_courses.form.none')}</em>
                </MenuItem>
                {courses
                  .filter(c => c.id !== currentId) // Kendisini ön koşul olarak seçemesin
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminCourses;