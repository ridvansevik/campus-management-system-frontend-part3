import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent,
  FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Button, Alert
} from '@mui/material';
import { getAllDepartmentSchedules, getSchedulesByDepartment } from '../../services/scheduleService';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';

const DepartmentSchedules = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState('Spring');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState('all'); // 'all' veya 'department'

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (viewMode === 'all') {
      fetchAllSchedules();
    } else if (selectedDepartment) {
      fetchDepartmentSchedules();
    }
  }, [viewMode, selectedDepartment, semester, year]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (error) {
      toast.error('Bölümler yüklenemedi');
    }
  };

  const fetchAllSchedules = async () => {
    setLoading(true);
    try {
      const res = await getAllDepartmentSchedules({ semester, year });
      setSchedules(res.data.data || []);
    } catch (error) {
      toast.error('Programlar yüklenemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentSchedules = async () => {
    if (!selectedDepartment) return;
    setLoading(true);
    try {
      const res = await getSchedulesByDepartment(selectedDepartment, { semester, year });
      setSchedules(res.data.data || []);
    } catch (error) {
      toast.error('Programlar yüklenemedi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (day) => {
    const days = {
      'Monday': 'Pazartesi',
      'Tuesday': 'Salı',
      'Wednesday': 'Çarşamba',
      'Thursday': 'Perşembe',
      'Friday': 'Cuma',
      'Saturday': 'Cumartesi',
      'Sunday': 'Pazar'
    };
    return days[day] || day;
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM formatı
  };

  // Haftalık görünüm için schedule'ları günlere göre grupla
  const groupSchedulesByDay = (schedules) => {
    const grouped = {
      'Monday': [],
      'Tuesday': [],
      'Wednesday': [],
      'Thursday': [],
      'Friday': [],
      'Saturday': [],
      'Sunday': []
    };

    schedules.forEach(schedule => {
      const day = schedule.day_of_week;
      if (grouped[day]) {
        grouped[day].push(schedule);
      }
    });

    // Her günü saatine göre sırala
    Object.keys(grouped).forEach(day => {
      grouped[day].sort((a, b) => {
        return a.start_time.localeCompare(b.start_time);
      });
    });

    return grouped;
  };

  const renderScheduleCard = (schedule) => {
    const course = schedule.section?.course;
    const instructor = schedule.section?.instructor;
    const classroom = schedule.classroom;
    const department = course?.department;

    return (
      <Card key={schedule.id} sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {course?.code || 'Ders Kodu'} - {course?.name || 'Ders Adı'}
              </Typography>
              {department && (
                <Chip 
                  label={department.name} 
                  size="small" 
                  sx={{ mt: 0.5 }}
                  color="secondary"
                />
              )}
            </Box>
            <Chip 
              label={`Şube ${schedule.section?.section_number || ''}`}
              color="primary"
              variant="outlined"
            />
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Gün:</strong> {getDayName(schedule.day_of_week)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Saat:</strong> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Derslik:</strong> {classroom?.code || 'Belirtilmemiş'}
                </Typography>
              </Box>
              {classroom?.building && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                  {classroom.building}
                </Typography>
              )}
            </Grid>
            {instructor && (
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Öğretim Üyesi:</strong> {instructor.user?.name || instructor.name || 'Belirtilmemiş'}
                  </Typography>
                  {instructor.title && (
                    <Chip label={instructor.title} size="small" variant="outlined" />
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderWeeklyView = () => {
    if (viewMode === 'all') {
      // Tüm bölümlerin programları - bölüm bazlı gruplandırılmış
      return schedules.map((deptData, idx) => {
        if (!deptData.department || !deptData.schedules || deptData.schedules.length === 0) {
          return null;
        }

        const grouped = groupSchedulesByDay(deptData.schedules);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        return (
          <Paper key={idx} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <SchoolIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                {deptData.department.name}
              </Typography>
              <Chip 
                label={`${deptData.schedules.length} ders`}
                size="small"
                color="primary"
              />
            </Box>

            <Grid container spacing={2}>
              {days.map(day => (
                <Grid item xs={12} md={2.4} key={day}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      minHeight: 200,
                      bgcolor: grouped[day].length > 0 ? 'background.paper' : 'grey.50'
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                      {getDayName(day)}
                    </Typography>
                    {grouped[day].length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Ders yok
                      </Typography>
                    ) : (
                      grouped[day].map(schedule => (
                        <Box 
                          key={schedule.id} 
                          sx={{ 
                            mb: 1, 
                            p: 1, 
                            bgcolor: 'primary.light', 
                            borderRadius: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'primary.main', color: 'white' }
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold" display="block">
                            {schedule.section?.course?.code}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {schedule.classroom?.code}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        );
      });
    } else {
      // Tek bölümün programları
      const grouped = groupSchedulesByDay(schedules);
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      return (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {days.map(day => (
              <Grid item xs={12} md={2.4} key={day}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    minHeight: 200,
                    bgcolor: grouped[day].length > 0 ? 'background.paper' : 'grey.50'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    {getDayName(day)}
                  </Typography>
                  {grouped[day].length === 0 ? (
                    <Typography variant="caption" color="text.secondary">
                      Ders yok
                    </Typography>
                  ) : (
                    grouped[day].map(schedule => (
                      <Box 
                        key={schedule.id} 
                        sx={{ 
                          mb: 1, 
                          p: 1, 
                          bgcolor: 'primary.light', 
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold" display="block">
                          {schedule.section?.course?.code}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {schedule.classroom?.code}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      );
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Bölüm Ders Programları
          </Typography>
        </Box>

        {/* Filtreler */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Görünüm Modu</InputLabel>
                <Select
                  value={viewMode}
                  label="Görünüm Modu"
                  onChange={(e) => {
                    setViewMode(e.target.value);
                    if (e.target.value === 'department') {
                      setSelectedDepartment('');
                    }
                  }}
                >
                  <MenuItem value="all">Tüm Bölümler</MenuItem>
                  <MenuItem value="department">Tek Bölüm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {viewMode === 'department' && (
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Bölüm Seç</InputLabel>
                  <Select
                    value={selectedDepartment}
                    label="Bölüm Seç"
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} md={2}>
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
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Yıl"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputProps={{ min: 2020, max: 2030 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  if (viewMode === 'all') {
                    fetchAllSchedules();
                  } else {
                    fetchDepartmentSchedules();
                  }
                }}
                disabled={loading || (viewMode === 'department' && !selectedDepartment)}
              >
                Yenile
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Sonuçlar */}
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'all' ? (
          schedules.length === 0 ? (
            <Alert severity="info">Seçilen dönem ve yıl için program bulunamadı.</Alert>
          ) : (
            <>
              {renderWeeklyView()}
              {/* Detaylı Liste Görünümü */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Detaylı Liste Görünümü
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Bölüm</strong></TableCell>
                        <TableCell><strong>Ders Kodu</strong></TableCell>
                        <TableCell><strong>Ders Adı</strong></TableCell>
                        <TableCell><strong>Şube</strong></TableCell>
                        <TableCell><strong>Gün</strong></TableCell>
                        <TableCell><strong>Saat</strong></TableCell>
                        <TableCell><strong>Derslik</strong></TableCell>
                        <TableCell><strong>Öğretim Üyesi</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedules.flatMap((deptData) =>
                        (deptData.schedules || []).map((schedule) => (
                          <TableRow key={schedule.id}>
                            <TableCell>{deptData.department?.name}</TableCell>
                            <TableCell>{schedule.section?.course?.code}</TableCell>
                            <TableCell>{schedule.section?.course?.name}</TableCell>
                            <TableCell>{schedule.section?.section_number}</TableCell>
                            <TableCell>{getDayName(schedule.day_of_week)}</TableCell>
                            <TableCell>
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </TableCell>
                            <TableCell>{schedule.classroom?.code}</TableCell>
                            <TableCell>
                              {schedule.section?.instructor?.user?.name || schedule.section?.instructor?.name || '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )
        ) : selectedDepartment ? (
          schedules.length === 0 ? (
            <Alert severity="info">Seçilen bölüm için program bulunamadı.</Alert>
          ) : (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h5" fontWeight="bold">
                    {departments.find(d => d.id === selectedDepartment)?.name}
                  </Typography>
                  <Chip 
                    label={`${schedules.length} ders`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Paper>
              {renderWeeklyView()}
              {/* Detaylı Liste */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Detaylı Liste
                </Typography>
                {schedules.map(schedule => renderScheduleCard(schedule))}
              </Paper>
            </>
          )
        ) : (
          <Alert severity="info">Lütfen bir bölüm seçin.</Alert>
        )}
      </Container>
    </Layout>
  );
};

export default DepartmentSchedules;

