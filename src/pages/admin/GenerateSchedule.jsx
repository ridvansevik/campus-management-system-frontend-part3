import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Button, Box, Alert, CircularProgress,
  Grid, Card, CardContent, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { generateSchedule } from '../../services/scheduleService';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const GenerateSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // Aktif dönem ve yıl otomatik seçiliyor (Spring 2025)
  const [semester, setSemester] = useState('Spring');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [clearExisting, setClearExisting] = useState(true); // Varsayılan: mevcut programı temizle
  const [previewModal, setPreviewModal] = useState({ open: false, schedule: null });

  const handleGenerate = async () => {
    if (!semester || !year) {
      toast.error('Dönem ve yıl bilgilerini giriniz');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      console.log('Program oluşturma isteği:', { semester, year, clearExisting });
      const res = await generateSchedule({ semester, year, clearExisting });
      console.log('Program oluşturma sonucu:', res.data);
      
      if (res.data.success) {
        setResult(res.data);
        const scheduleCount = res.data.data?.length || 0;
        if (scheduleCount > 0) {
          toast.success(`${scheduleCount} ders başarıyla programlandı!`);
        } else {
          toast.warning('Program oluşturuldu ancak hiç ders programlanamadı.');
        }
      } else {
        toast.error(res.data.message || 'Program oluşturulamadı');
        setResult(res.data);
      }
    } catch (error) {
      console.error('Program oluşturma hatası:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Program oluşturulamadı';
      toast.error(errorMessage);
      if (error.response?.data) {
        setResult(error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Otomatik Ders Programı Oluşturma
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Otomatik Ders Programı Oluşturma Sistemi</strong>
          </Typography>
          <Typography variant="body2" component="div">
            Bu sistem tüm dersleri otomatik olarak en uygun zaman dilimlerine ve dersliklere dağıtır.
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li><strong>Öğretim Üyesi Çakışması:</strong> Aynı öğretim üyesi aynı saatte iki ders veremez</li>
              <li><strong>Öğrenci Çakışması:</strong> Öğrenciler aynı saatte birden fazla derse kayıtlı olamaz</li>
              <li><strong>Derslik Çakışması:</strong> Aynı derslik aynı saatte iki ders için kullanılamaz</li>
              <li><strong>Kapasite Kontrolü:</strong> Derslik kapasitesi ders kapasitesinden küçük olamaz</li>
            </Box>
          </Typography>
        </Alert>

        {/* Parametreler */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Parametreler
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={semester}
                  label="Dönem"
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <MenuItem value="Fall">Güz</MenuItem>
                  <MenuItem value="Spring">Bahar</MenuItem>
                  <MenuItem value="Summer">Yaz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Yıl"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Mevcut Program</InputLabel>
                <Select
                  value={clearExisting ? 'clear' : 'keep'}
                  label="Mevcut Program"
                  onChange={(e) => setClearExisting(e.target.value === 'clear')}
                >
                  <MenuItem value="keep">Koru (Yeni ekle)</MenuItem>
                  <MenuItem value="clear">Temizle (Yeniden oluştur)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleGenerate}
              disabled={loading || !semester || !year}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalendarMonthIcon />}
              sx={{ 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Program Oluşturuluyor... (Çakışmalar kontrol ediliyor)' : '🚀 Otomatik Ders Dağıtımı Yap (Çakışma Kontrolü ile)'}
            </Button>
          </Box>
          
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>✓ Otomatik Çakışma Kontrolü Aktif</strong>
            </Typography>
            <Typography variant="body2">
              Sistem aşağıdaki kontrolleri otomatik yapar:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
              <li>Öğretim üyelerinin aynı saatte birden fazla ders vermesini engeller</li>
              <li>Öğrencilerin aynı saatte birden fazla derse kayıtlı olmasını engeller</li>
              <li>Dersliklerin aynı saatte birden fazla ders için kullanılmasını engeller</li>
              <li>Derslik kapasitelerini kontrol eder</li>
            </Box>
          </Alert>
        </Paper>

        {/* Sonuç */}
        {result && (
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              {result.unassignedSections?.length > 0 ? (
                <WarningIcon color="warning" />
              ) : (
                <CheckCircleIcon color="success" />
              )}
              <Typography variant="h6">
                Program Oluşturma Sonucu
              </Typography>
            </Box>

            <Alert 
              severity={result.success === false ? 'error' : (result.unassignedSections?.length > 0 ? 'warning' : 'success')}
              sx={{ mb: 2 }}
            >
              <Typography variant="body1" fontWeight="bold">
                {result.message || (result.success !== false ? `${result.data?.length || 0} ders başarıyla programlandı.` : 'Program oluşturulamadı.')}
              </Typography>
              {result.success && result.stats && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" display="block">
                    • Toplam Şube: {result.stats.totalSections} | Programlanan: {result.stats.scheduledSections}
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Kullanılan Derslik: {result.stats.totalClassrooms} | Öğrenci Kayıtları: {result.stats.totalEnrollments}
                  </Typography>
                </Box>
              )}
            </Alert>

            {result.success === false && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Olası nedenler:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
                  <li>Seçilen dönem ve yıl için ders/şube bulunmuyor olabilir</li>
                  <li>Derslikler oluşturulmamış olabilir</li>
                  <li>Tüm dersler için uygun zaman dilimi bulunamıyor olabilir (çakışmalar)</li>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Lütfen önce "Ders Yönetimi" ve "Şube & Program" sayfalarından dersler ve şubeler oluşturun.
                </Typography>
              </Alert>
            )}

            {result.data && result.data.length > 0 && (
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    ✓ Programlanan Dersler ({result.data.length})
                  </Typography>
                  <Chip 
                    label="Çakışma Yok" 
                    color="success" 
                    size="small"
                    icon={<CheckCircleIcon />}
                  />
                </Box>
                <Grid container spacing={2}>
                  {result.data.slice(0, 12).map((schedule) => (
                    <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                      <Card 
                        elevation={1}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 4 }
                        }}
                        onClick={() => setPreviewModal({ open: true, schedule })}
                      >
                        <CardContent>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {schedule.section?.course?.code || 'Ders'} - {schedule.section?.course?.name || ''}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            <strong>Gün:</strong> {schedule.day_of_week} | <strong>Saat:</strong> {schedule.start_time} - {schedule.end_time}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            <strong>Derslik:</strong> {schedule.classroom?.code || 'Derslik Yok'}
                          </Typography>
                          {schedule.section?.instructor && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              <strong>Öğretim Üyesi:</strong> {schedule.section.instructor.name}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {result.data.length > 12 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    ... ve {result.data.length - 12} ders daha
                  </Typography>
                )}
              </Box>
            )}

            {result.unassignedSections && result.unassignedSections.length > 0 && (
              <Alert severity="warning">
                <Typography variant="subtitle2" gutterBottom>
                  Programlanamayan Dersler ({result.unassignedSections.length})
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                  {result.unassignedSections.map((section, idx) => (
                    <li key={idx}>
                      <Typography variant="body2">
                        {section.course || section.id} - Çakışma veya yetersiz kaynak
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            )}
          </Paper>
        )}

        {/* Önizleme Modal */}
        <Dialog 
          open={previewModal.open} 
          onClose={() => setPreviewModal({ open: false, schedule: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ders Detayı</DialogTitle>
          <DialogContent>
            {previewModal.schedule && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {previewModal.schedule.section?.course?.code || 'Ders'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Gün:</strong> {previewModal.schedule.day_of_week}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Saat:</strong> {previewModal.schedule.start_time} - {previewModal.schedule.end_time}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Derslik:</strong> {previewModal.schedule.classroom?.code || 'Derslik Yok'}
                  </Typography>
                  {previewModal.schedule.section?.instructor && (
                    <Typography variant="body2">
                      <strong>Öğretim Üyesi:</strong> {previewModal.schedule.section.instructor.name}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewModal({ open: false, schedule: null })}>
              Kapat
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default GenerateSchedule;

