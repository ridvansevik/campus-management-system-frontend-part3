import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Grid, CircularProgress, Box, Tooltip,
  Chip, Divider, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const AdminSections = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    section_number: '',
    semester: 'Spring', // Varsayılan
    year: new Date().getFullYear(),
    instructorId: '',
    capacity: 50,
    classroomId: '',
    schedule_json: [] // [{ day: 'Monday', start_time: '09:00', end_time: '12:00' }]
  });

  // Ders Programı (Schedule) Ekleme State'i
  const [scheduleInput, setScheduleInput] = useState({ day: 'Monday', start_time: '09:00', end_time: '12:00' });

  // 1. Sayfa Yüklendiğinde Gerekli Verileri (Dersler, Hocalar, Sınıflar) Çek
  useEffect(() => {
    const fetchBaseData = async () => {
      if (user?.role !== 'admin') return;
      try {
        const [coursesRes, facultiesRes, classroomsRes] = await Promise.all([
          api.get('/courses?limit=100'),
          api.get('/users?role=faculty&limit=100'), // Tüm hocalar
          api.get('/classrooms')
        ]);
        setCourses(coursesRes.data.data);
        setFaculties(facultiesRes.data.data);
        setClassrooms(classroomsRes.data.data);
      } catch (error) {
        console.error("Veri hatası:", error);
        toast.error("Gerekli veriler yüklenemedi.");
      }
    };
    fetchBaseData();
  }, [user]);

  // 2. Ders Seçilince Şubeleri Getir
  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSections = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/sections?course_id=${selectedCourse}`);
        // Eğer data null veya undefined gelirse boş dizi [] ata
setSections(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (error) {
        console.error("Şubeler yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();
  }, [selectedCourse]);

  // --- HANDLERS ---

  const handleOpen = () => {
    if (!selectedCourse) {
      toast.warning("Lütfen önce bir ders seçin.");
      return;
    }
    // Otomatik section numarası öner (mevcut + 1)
    const nextSectionNum = sections.length > 0 ? Math.max(...sections.map(s => s.section_number)) + 1 : 1;
    
    setFormData({
      section_number: nextSectionNum,
      semester: 'Spring',
      year: new Date().getFullYear(),
      instructorId: '',
      capacity: 50,
      classroomId: '',
      schedule_json: []
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleAddSchedule = () => {
    // Basit validasyon
    if (scheduleInput.start_time >= scheduleInput.end_time) {
      toast.warning("Bitiş saati başlangıçtan sonra olmalıdır.");
      return;
    }
    setFormData({
      ...formData,
      schedule_json: [...formData.schedule_json, scheduleInput]
    });
  };

  const handleRemoveSchedule = (index) => {
    const newSchedule = [...formData.schedule_json];
    newSchedule.splice(index, 1);
    setFormData({ ...formData, schedule_json: newSchedule });
  };

  const handleSubmit = async () => {
    if (!formData.instructorId || !formData.classroomId) {
      toast.warning("Öğretim üyesi ve Derslik seçimi zorunludur.");
      return;
    }
    
    try {
      const payload = {
        courseId: selectedCourse,
        ...formData
      };
      await api.post('/sections', payload);
      toast.success("Şube ve ders programı oluşturuldu.");
      setOpen(false);
      
      // Listeyi yenile
      const res = await api.get(`/sections?course_id=${selectedCourse}`);
      // Eğer data null veya undefined gelirse boş dizi [] ata
setSections(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Kayıt başarısız.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu şubeyi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/sections/${id}`);
      toast.success("Şube silindi.");
      setSections(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error("Silme işlemi başarısız.");
    }
  };

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Şube ve Program Yönetimi
      </Typography>

      {/* Ders Seçimi */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 0, borderTop: '4px solid #1976d2' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              select
              label="İşlem Yapılacak Dersi Seçin"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              fullWidth
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              fullWidth 
              size="large"
              onClick={handleOpen}
              disabled={!selectedCourse}
              sx={{ height: '56px', borderRadius: 0 }}
              disableElevation
            >
              Yeni Şube Ekle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Liste */}
      {selectedCourse && (
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : sections.length === 0 ? (
            <Alert severity="info">Bu derse ait açılmış bir şube bulunmuyor.</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Şube No</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Öğretim Üyesi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Derslik</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Kontenjan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Ders Programı</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {/* sections dizisinin varlığını ve dizi olduğunu kontrol et */}
  {Array.isArray(sections) && sections.map((sec) => (
    <TableRow key={sec.id}>
      <TableCell>Section {sec.section_number}</TableCell>
      <TableCell>{sec.instructor?.user?.name || '-'}</TableCell>
      <TableCell>{sec.classroom ? `${sec.classroom.building} ${sec.classroom.room_number}` : '-'}</TableCell>
      <TableCell>{sec.enrolled_count} / {sec.capacity}</TableCell>
      <TableCell>
        {/* schedule_json'ın dizi olup olmadığını kontrol et */}
        {Array.isArray(sec.schedule_json) ? (
          sec.schedule_json.map((s, i) => (
            <Chip 
              key={i} 
              label={`${s.day ? s.day.slice(0,3) : ''} ${s.start_time}-${s.end_time}`} 
              size="small" 
              sx={{ mr: 0.5, mb: 0.5 }} 
              variant="outlined"
            />
          ))
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#999' }}>Program Yok</span>
        )}
      </TableCell>
      <TableCell align="right">
        <IconButton color="error" onClick={() => handleDelete(sec.id)}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Şube Ekleme Modalı */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>Yeni Şube ve Program Oluştur</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Temel Bilgiler */}
            <Grid item xs={12}><Typography variant="subtitle2" color="primary">Temel Bilgiler</Typography></Grid>
            
            <Grid item xs={4}>
              <TextField
                label="Şube No"
                type="number"
                value={formData.section_number}
                onChange={(e) => setFormData({...formData, section_number: e.target.value})}
                fullWidth size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                select label="Dönem"
                value={formData.semester}
                onChange={(e) => setFormData({...formData, semester: e.target.value})}
                fullWidth size="small"
              >
                <MenuItem value="Fall">Güz</MenuItem>
                <MenuItem value="Spring">Bahar</MenuItem>
                <MenuItem value="Summer">Yaz</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Yıl" type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                fullWidth size="small"
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select label="Öğretim Üyesi"
                value={formData.instructorId}
                onChange={(e) => setFormData({...formData, instructorId: e.target.value})}
                fullWidth size="small"
              >
                {faculties.map((fac) => (
                  <MenuItem key={fac.id} value={fac.facultyProfile?.id}>
                    {fac.name} ({fac.facultyProfile?.title})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={4}>
              <TextField
                select label="Derslik"
                value={formData.classroomId}
                onChange={(e) => setFormData({...formData, classroomId: e.target.value})}
                fullWidth size="small"
              >
                {classrooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.building} - {room.room_number} (Kap: {room.capacity})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={2}>
              <TextField
                label="Kontenjan" type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                fullWidth size="small"
              />
            </Grid>

            <Grid item xs={12}><Divider /></Grid>

            {/* Ders Programı Oluşturucu */}
            <Grid item xs={12}><Typography variant="subtitle2" color="primary">Ders Programı (Gün/Saat Ekle)</Typography></Grid>
            
            <Grid item xs={4}>
              <TextField
                select label="Gün"
                value={scheduleInput.day}
                onChange={(e) => setScheduleInput({...scheduleInput, day: e.target.value})}
                fullWidth size="small"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <MenuItem key={day} value={day}>{day}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Başlangıç" type="time"
                value={scheduleInput.start_time}
                onChange={(e) => setScheduleInput({...scheduleInput, start_time: e.target.value})}
                fullWidth size="small" InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Bitiş" type="time"
                value={scheduleInput.end_time}
                onChange={(e) => setScheduleInput({...scheduleInput, end_time: e.target.value})}
                fullWidth size="small" InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={2}>
              <Button variant="outlined" onClick={handleAddSchedule} fullWidth sx={{ height: '100%' }}>Ekle</Button>
            </Grid>

            {/* Eklenen Saatler */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, minHeight: 50 }}>
                {formData.schedule_json.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Henüz program eklenmedi.</Typography>
                ) : (
                  formData.schedule_json.map((s, i) => (
                    <Chip 
                      key={i}
                      icon={<AccessTimeIcon />}
                      label={`${s.day}: ${s.start_time} - ${s.end_time}`}
                      onDelete={() => handleRemoveSchedule(i)}
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                )}
              </Box>
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">İptal</Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation>Şubeyi Oluştur</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminSections;