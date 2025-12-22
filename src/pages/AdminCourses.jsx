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

const AdminCourses = () => {
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
      console.error("Veri çekme hatası:", error);
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
        toast.success("Ders güncellendi.");
      } else {
        await api.post('/courses', formData);
        toast.success("Yeni ders eklendi.");
      }
      handleClose();
      fetchData(); // Listeyi yenile
    } catch (error) {
      toast.error(error.response?.data?.error || "İşlem başarısız.");
    }
  };

  // Silme İşlemi
  const handleDelete = async (id) => {
    if (!window.confirm("Bu dersi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Ders silindi.");
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          Ders Yönetimi
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpen}
          sx={{ borderRadius: 0 }}
          disableElevation
        >
          Yeni Ders Ekle
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Kod</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ders Adı</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bölüm</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Kredi / AKTS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
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
                  <Tooltip title="Düzenle">
                    <IconButton color="primary" onClick={() => handleEdit(course)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Sil">
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
        <DialogTitle>{editMode ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}>
              <TextField
                label="Ders Kodu"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
               <TextField
                select
                label="Bölüm"
                value={formData.departmentId}
                onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
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
                label="Ders Adı"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Kredi"
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: e.target.value})}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="AKTS"
                type="number"
                value={formData.ects}
                onChange={(e) => setFormData({...formData, ects: e.target.value})}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
               <TextField
                select
                label="Ön Koşul Dersi (Varsa)"
                value={formData.prerequisiteId}
                onChange={(e) => setFormData({...formData, prerequisiteId: e.target.value})}
                fullWidth
                size="small"
                helperText="Bu dersi alabilmek için öğrencinin geçmesi gereken ders."
              >
                <MenuItem value="">
                  <em>Yok</em>
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
          <Button onClick={handleClose} color="inherit">İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation>Kaydet</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminCourses;