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
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [clearExisting, setClearExisting] = useState(false);
  const [previewModal, setPreviewModal] = useState({ open: false, schedule: null });

  const handleGenerate = async () => {
    if (!semester || !year) {
      toast.error('Dönem ve yıl bilgilerini giriniz');
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      const res = await generateSchedule({ semester, year, clearExisting });
      setResult(res.data);
      toast.success('Program başarıyla oluşturuldu!');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Program oluşturulamadı');
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
          Bu sayfa Constraint Satisfaction Problem (CSP) algoritması kullanarak otomatik ders programı oluşturur.
          Hard constraints (çakışma kontrolü, kapasite) ve soft constraints (tercihler) dikkate alınır.
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
                  <MenuItem value="fall">Güz</MenuItem>
                  <MenuItem value="spring">Bahar</MenuItem>
                  <MenuItem value="summer">Yaz</MenuItem>
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

          <Button
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleGenerate}
            disabled={loading || !semester || !year}
            startIcon={loading ? <CircularProgress size={20} /> : <CalendarMonthIcon />}
          >
            {loading ? 'Program Oluşturuluyor...' : 'Program Oluştur'}
          </Button>
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
              severity={result.unassignedSections?.length > 0 ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            >
              {result.message || `${result.data?.length || 0} ders başarıyla programlandı.`}
            </Alert>

            {result.data && result.data.length > 0 && (
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Programlanan Dersler ({result.data.length})
                </Typography>
                <Grid container spacing={2}>
                  {result.data.slice(0, 6).map((schedule) => (
                    <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                      <Card 
                        elevation={1}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setPreviewModal({ open: true, schedule })}
                      >
                        <CardContent>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.section?.course?.code || 'Ders'}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {schedule.day_of_week} | {schedule.start_time} - {schedule.end_time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {schedule.classroom?.code || 'Derslik Yok'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {result.data.length > 6 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    ... ve {result.data.length - 6} ders daha
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

