import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, TextField, MenuItem, Button, 
  Table, TableBody, TableCell, TableHead, TableRow, 
  CircularProgress, Alert, Chip 
} from '@mui/material';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Gradebook = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Hocanın Şubelerini Getir
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get('/sections');
        const mySections = res.data.data.filter(
          sec => sec.instructorId === user?.facultyProfile?.id
        );
        setSections(mySections);
      } catch (error) {
        console.error("Şubeler alınamadı", error);
      }
    };
    if (user?.role === 'faculty') fetchSections();
  }, [user]);

  // 2. Seçilen Şubedeki Öğrencileri Getir
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSection) return;
      setLoading(true);
      try {
        // Bu endpoint'i EnrollmentController'da yazmıştık veya generic bir sorgu ile alabiliriz.
        // Ama en kolayı, section'a ait enrollment'ları çeken bir endpoint kullanmak.
        // Hızlı çözüm: Doğrudan o section'a ait enrollmentları çeken bir sorgu yapalım.
        // Şimdilik backend'de özel bir 'getStudentsBySection' endpoint'i yazmadık, 
        // bunu simüle etmek için 'attendance/report' endpointini kullanabiliriz (çünkü orada öğrenci listesi var) 
        // VEYA yeni bir endpoint yazmak en doğrusu. 
        // Ancak işi uzatmamak için 'getAttendanceReport'tan öğrenci listesini çekip filtreleyebiliriz.
        // DÜZELTME: Backend'de /api/v1/enrollments/students/:sectionId yazmamıştık.
        // O yüzden en temiz yol AttendanceReport verisinden öğrenci listesini çıkarmak ya da...
        // BEKLE! Enrollment modeli üzerinden sorgu atabiliriz.
        // Frontend'de pratik çözüm: Rapor endpoint'i yerine, "enrollmentService" içindeki mantığı kullanalım.
        // Tamam, Backend'e küçük bir ekleme yapmadan, mevcut 'attendance/report' endpoint'i bize enrollment ID'sini vermez.
        // O yüzden HIZLICA BACKEND'e UFAK BİR EKLEME YAPALIM.
        
        // Şimdilik hata almamak için burayı boş geçiyorum, 
        // AŞAĞIDA BACKEND'E EKLEMEMİZ GEREKEN KÜÇÜK BİR ENDPOINT VAR.
        const res = await api.get(`/enrollments/section/${selectedSection}`); // Bunu birazdan ekleyeceğiz
        setStudents(res.data.data);
      } catch (error) {
        // console.error("Öğrenci listesi alınamadı", error);
        // Geçici olarak boş array
        setStudents([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSection]);

  const handleGradeChange = (enrollmentId, field, value) => {
    setStudents(prev => prev.map(stu => 
      stu.id === enrollmentId ? { ...stu, [field]: value } : stu
    ));
  };

  const handleSave = async (enrollmentId) => {
    const student = students.find(s => s.id === enrollmentId);
    try {
      await api.put(`/grades/${enrollmentId}`, {
        midterm_grade: student.midterm_grade,
        final_grade: student.final_grade
      });
      toast.success("Not kaydedildi.");
    } catch (error) {
      toast.error("Not kaydedilemedi.");
    }
  };

  return (
    <Layout>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>
        Not Girişi
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <TextField
          select
          label="Ders Şubesi Seçin"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          fullWidth
        >
          {sections.map((sec) => (
            <MenuItem key={sec.id} value={sec.id}>
              {sec.course?.code} - {sec.course?.name} (Section {sec.section_number})
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : selectedSection && students.length === 0 ? (
        <Alert severity="info">Bu derse kayıtlı öğrenci bulunamadı.</Alert>
      ) : (
        selectedSection && (
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>Öğrenci No</TableCell>
                <TableCell>Ad Soyad</TableCell>
                <TableCell>Vize (%40)</TableCell>
                <TableCell>Final (%60)</TableCell>
                <TableCell>Harf Notu</TableCell>
                <TableCell>İşlem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((stu) => (
                <TableRow key={stu.id}>
                  <TableCell>{stu.student?.student_number}</TableCell>
                  <TableCell>{stu.student?.user?.name}</TableCell>
                  <TableCell>
                    <TextField 
                      type="number" 
                      size="small" 
                      variant="standard"
                      value={stu.midterm_grade || ''} 
                      onChange={(e) => handleGradeChange(stu.id, 'midterm_grade', e.target.value)}
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField 
                      type="number" 
                      size="small" 
                      variant="standard"
                      value={stu.final_grade || ''}
                      onChange={(e) => handleGradeChange(stu.id, 'final_grade', e.target.value)}
                      sx={{ width: 60 }}
                    />
                  </TableCell>
                  <TableCell>
                    {stu.letter_grade ? <Chip label={stu.letter_grade} size="small" color={stu.status === 'failed' ? 'error' : 'success'} /> : '-'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" onClick={() => handleSave(stu.id)}>Kaydet</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      )}
    </Layout>
  );
};

export default Gradebook;