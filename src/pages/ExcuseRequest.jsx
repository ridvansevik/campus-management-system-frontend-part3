import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Grid, TextField, MenuItem, Button, 
  Box, Alert, CircularProgress 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';

const ExcuseRequest = () => {
  // API'den gelen ham liste (Tüm kaçırılan dersler)
  const [allMissedSessions, setAllMissedSessions] = useState([]);
  
  // Dropdown 1 için: Benzersiz Ders Listesi
  const [uniqueCourses, setUniqueCourses] = useState([]);
  
  // Seçimler
  const [selectedSectionId, setSelectedSectionId] = useState(''); // Seçilen Ders ID
  const [selectedSessionId, setSelectedSessionId] = useState(''); // Seçilen Oturum ID
  
  const [reason, setReason] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. TEK API İSTEĞİ: Sadece mazeret bildirilebilecek (kaçırılan) dersleri çek
  useEffect(() => {
    const fetchMissedSessions = async () => {
      try {
        const res = await api.get('/attendance/missed-sessions');
        const data = res.data.data;
        
        setAllMissedSessions(data);

        // API'den gelen düz listeden "Benzersiz Dersleri" ayıkla (İlk Dropdown için)
        const courses = [];
        const seen = new Set();

        data.forEach(session => {
          if (!seen.has(session.sectionId)) {
            seen.add(session.sectionId);
            courses.push({
              sectionId: session.sectionId,
              code: session.section.course.code,
              name: session.section.course.name
            });
          }
        });
        setUniqueCourses(courses);

      } catch (error) {
        console.error("Dersler yüklenemedi", error);
        toast.error("Mazeret bildirilebilecek dersler yüklenemedi.");
      }
    };
    fetchMissedSessions();
  }, []);

  // 2. Birinci Dropdown değişince çalışır
  const handleCourseChange = (e) => {
    setSelectedSectionId(e.target.value);
    setSelectedSessionId(''); // Ders değişince seçili oturumu sıfırla
  };

  // İkinci Dropdown'un içini doldurmak için filtreleme
  // (Seçilen derse ait kaçırılan oturumları bul)
  const availableSessions = allMissedSessions.filter(
    session => session.sectionId === selectedSectionId
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSessionId || !reason || !file) {
      toast.warning("Lütfen tüm alanları doldurun ve belge yükleyin.");
      return;
    }

    const formData = new FormData();
    formData.append('sessionId', selectedSessionId);
    formData.append('reason', reason);
    formData.append('document', file);

    setLoading(true);
    try {
      await api.post('/attendance/excuse-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Mazeret talebiniz gönderildi.");
      
      // Formu ve Listeyi Güncelle (Gönderilen dersi listeden sil)
      setReason('');
      setFile(null);
      setSelectedSessionId('');
      
      // Gönderilen mazereti listeden anlık olarak çıkaralım ki tekrar seçemesin
      const updatedList = allMissedSessions.filter(s => s.id !== selectedSessionId);
      setAllMissedSessions(updatedList);
      
      // Eğer o derse ait başka kaçırılan oturum kalmadıysa, ders listesinden de düşmeli mi?
      // Bu karmaşa olmasın diye basitçe sayfayı yenilemek yerine state'i güncelliyoruz.

    } catch (error) {
      toast.error(error.response?.data?.error || "Talep gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Mazeret Bildir
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Alert severity="info">
                Aşağıdaki listede sadece <strong>yok yazıldığınız</strong> ve henüz mazeret bildirmediğiniz dersler listelenir.
              </Alert>

              {/* 1. DROPDOWN: Ders Seçimi */}
              <TextField
                select
                label="Ders Seçin"
                value={selectedSectionId}
                onChange={handleCourseChange}
                fullWidth
              >
                {uniqueCourses.length === 0 ? (
                  <MenuItem disabled value="">Hiç kaçırılan ders yok</MenuItem>
                ) : (
                  uniqueCourses.map((course) => (
                    <MenuItem key={course.sectionId} value={course.sectionId}>
                      {course.code} - {course.name}
                    </MenuItem>
                  ))
                )}
              </TextField>

              {/* 2. DROPDOWN: Oturum Seçimi (Filtrelenmiş) */}
              <TextField
                select
                label="Kaçırılan Oturum (Tarih)"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                fullWidth
                disabled={!selectedSectionId} // Ders seçilmediyse pasif
              >
                {availableSessions.map((ses) => (
                  <MenuItem key={ses.id} value={ses.id}>
                    {new Date(ses.date).toLocaleDateString('tr-TR')} 
                    {' '}({ses.start_time?.slice(0,5)} - {ses.end_time?.slice(0,5)})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Mazeret Açıklaması"
                multiline
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                required
              />

              <Box sx={{ border: '1px dashed #ccc', p: 2, textAlign: 'center', borderRadius: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="raised-button-file"
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="raised-button-file">
                  <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
                    Belge Yükle
                  </Button>
                </label>
                {file && <Typography variant="body2" sx={{ mt: 1, color: 'green' }}>{file.name}</Typography>}
              </Box>

              <Button 
                type="submit" 
                variant="contained" 
                size="large" 
                disabled={loading}
                disableElevation
              >
                {loading ? <CircularProgress size={24} /> : 'Talebi Gönder'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ExcuseRequest;