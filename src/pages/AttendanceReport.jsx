import { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, TextField, MenuItem, 
  CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableHead, TableRow, Chip, 
  Tooltip, IconButton, Button // Button eklendi
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload'; // <--- EXCEL İKONU

import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

// EXCEL KÜTÜPHANELERİ
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AttendanceReport = () => {
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Şubeleri Getir
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await api.get('/sections');
        // Backend'den tüm sectionlar geliyorsa filtrele, yoksa direkt kullan
        // API yapına göre burası değişebilir, senin kodunu korudum:
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

  // 2. Raporu Getir
  const fetchReport = async () => {
    if (!selectedSection) return;
    
    setLoading(true);
    try {
      const res = await api.get(`/attendance/report/${selectedSection}`);
      const sortedSessions = res.data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSessions(sortedSessions);
    } catch (error) {
      console.error("Rapor alınamadı", error);
      toast.error("Rapor verisi çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line
  }, [selectedSection]);

  // --- EXCEL DIŞA AKTARMA FONKSİYONU (YENİ) ---
  const handleExportToExcel = () => {
    if (sessions.length === 0) {
      toast.warning("Dışa aktarılacak veri yok.");
      return;
    }

    const excelData = [];

    sessions.forEach(session => {
      const dateStr = new Date(session.date).toLocaleDateString('tr-TR');
      
      if (session.records.length === 0) {
        // Katılımcı olmayan oturumları da raporda göster (İsteğe bağlı)
        excelData.push({
          'Tarih': dateStr,
          'Saat': `${session.start_time?.slice(0,5)} - ${session.end_time?.slice(0,5)}`,
          'Öğrenci No': '-',
          'Ad Soyad': '-',
          'Giriş Saati': '-',
          'Mesafe': '-',
          'Durum': 'Katılımcı Yok'
        });
      } else {
        session.records.forEach(record => {
          excelData.push({
            'Tarih': dateStr,
            'Saat': `${session.start_time?.slice(0,5)} - ${session.end_time?.slice(0,5)}`,
            'Öğrenci No': record.student?.student_number || 'Belirsiz',
            'Ad Soyad': record.student?.user?.name || 'İsimsiz',
            'Giriş Saati': new Date(record.check_in_time).toLocaleTimeString('tr-TR'),
            'Mesafe': `${Math.round(record.distance_from_center)}m`,
            'Durum': record.is_flagged ? `ŞÜPHELİ: ${record.flag_reason}` : 'VAR'
          });
        });
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Sütun genişlikleri
    worksheet['!cols'] = [
      { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 40 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Yoklama Listesi");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    saveAs(dataBlob, `Yoklama_Raporu_Section${selectedSection}_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("Excel dosyası indirildi.");
  };
  // ---------------------------------------------

  // Onaylama Fonksiyonu
  const handleApprove = async (recordId) => {
    try {
      await api.put(`/attendance/records/${recordId}`, { action: 'approve' });
      toast.success("Yoklama onaylandı.");
      fetchReport(); 
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  // Reddetme Fonksiyonu
  const handleReject = async (recordId) => {
    if (!window.confirm("Bu yoklama kaydını silmek (reddetmek) istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/attendance/records/${recordId}`);
      toast.success("Yoklama reddedildi (silindi).");
      fetchReport(); 
    } catch (error) {
      toast.error("İşlem başarısız.");
    }
  };

  return (
    <Layout>
      {/* BAŞLIK VE EXCEL BUTONU */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          Yoklama Raporları
        </Typography>

        <Button 
          variant="contained" 
          color="success" 
          startIcon={<FileDownloadIcon />}
          onClick={handleExportToExcel}
          disabled={loading || !selectedSection || sessions.length === 0}
        >
          Excel'e Aktar
        </Button>
      </Box>

      {/* FİLTRELEME ALANI */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 0, borderTop: '4px solid #1976d2' }}>
        <TextField
          select
          label="Ders Şubesi Seçin"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          fullWidth
          helperText="Raporunu görüntülemek istediğiniz dersi seçin."
        >
          {sections.map((sec) => (
            <MenuItem key={sec.id} value={sec.id}>
              {sec.course?.code} - {sec.course?.name} (Section {sec.section_number})
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* LİSTELEME ALANI */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
      ) : selectedSection && sessions.length === 0 ? (
        <Alert severity="info">Bu ders için henüz hiç yoklama alınmamış.</Alert>
      ) : (
        sessions.map((session) => (
          <Accordion key={session.id} disableGutters sx={{ mb: 1, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {new Date(session.date).toLocaleDateString('tr-TR')}
                </Typography>
                <Box>
                  <Typography variant="caption" sx={{ mr: 2 }}>
                    Saat: {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                  </Typography>
                  <Chip 
                    label={`${session.records.length} Öğrenci`} 
                    color="primary" 
                    size="small" 
                    variant="outlined" 
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>Öğrenci No</TableCell>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>Giriş Saati</TableCell>
                    <TableCell>Mesafe</TableCell>
                    <TableCell>Durum & İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {session.records.length === 0 ? (
                    <TableRow><TableCell colSpan={5} align="center">Katılım yok.</TableCell></TableRow>
                  ) : (
                    session.records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.student?.student_number}</TableCell>
                        <TableCell>{record.student?.user?.name}</TableCell>
                        <TableCell>
                          {new Date(record.check_in_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>{Math.round(record.distance_from_center)}m</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {record.is_flagged ? (
                              <>
                                <Tooltip title={record.flag_reason || "Şüpheli İşlem"} arrow placement="top">
                                  <Chip 
                                    icon={<InfoIcon />} 
                                    label="Şüpheli" 
                                    color="warning" 
                                    size="small" 
                                    sx={{ cursor: 'help' }}
                                  />
                                </Tooltip>
                                
                                <Tooltip title="Onayla">
                                  <IconButton size="small" color="success" onClick={() => handleApprove(record.id)}>
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Reddet">
                                  <IconButton size="small" color="error" onClick={() => handleReject(record.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            ) : (
                              <Chip label="Var" color="success" size="small" />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Layout>
  );
};

export default AttendanceReport;