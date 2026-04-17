import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Grid, Card, CardContent
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

const dayTranslations = {
  'Monday': 'Pazartesi',
  'Tuesday': 'Salı',
  'Wednesday': 'Çarşamba',
  'Thursday': 'Perşembe',
  'Friday': 'Cuma',
  'Saturday': 'Cumartesi',
  'Sunday': 'Pazar'
};

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SchedulePreview = ({ schedules = [], stats, batchId }) => {
  const { t } = useTranslation();

  // Group schedules by day
  const groupedByDay = schedules.reduce((acc, schedule) => {
    const day = schedule.day_of_week || schedule.dayOfWeek || 'Unknown';
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {});

  // Sort schedules within each day by start time
  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[day].sort((a, b) => {
      const timeA = a.start_time || a.startTime || '';
      const timeB = b.start_time || b.startTime || '';
      return timeA.localeCompare(timeB);
    });
  });

  const formatTime = (time) => {
    if (!time) return '-';
    // Handle both "HH:mm" and "HH:mm:ss" formats
    return time.substring(0, 5);
  };

  const getCourseName = (schedule) => {
    return schedule.section?.course?.name ||
      schedule.courseName ||
      schedule.course_name ||
      t('common.no_name');
  };

  const getCourseCode = (schedule) => {
    return schedule.section?.course?.code ||
      schedule.courseCode ||
      schedule.course_code ||
      '';
  };

  const getClassroom = (schedule) => {
    return schedule.classroom?.name ||
      schedule.classroomName ||
      schedule.classroom_name ||
      t('common.unknown');
  };

  const getInstructor = (schedule) => {
    const faculty = schedule.section?.faculty;
    if (faculty) {
      return `${faculty.title || ''} ${faculty.user?.name || faculty.name || ''}`.trim();
    }
    return schedule.instructorName || schedule.instructor_name || '-';
  };

  const getSectionCode = (schedule) => {
    return schedule.section?.section_code ||
      schedule.sectionCode ||
      schedule.section_code ||
      '';
  };

  return (
    <Box>
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {stats.totalSections || stats.totalCourses || schedules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('department_schedules.stats.total_courses')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {stats.scheduledSections || stats.totalCourses || schedules.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('department_schedules.stats.scheduled')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="info.main">
                  {stats.totalClassrooms || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('department_schedules.stats.classrooms')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary.main">
                  {stats.departmentCount || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('department_schedules.stats.departments')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Batch ID Info */}
      {batchId && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Batch ID:</strong>{' '}
            <code style={{ backgroundColor: '#e0e0e0', padding: '2px 6px', borderRadius: 4 }}>
              {batchId}
            </code>
          </Typography>
        </Paper>
      )}

      {/* No schedules */}
      {schedules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            {t('department_schedules.preview.no_data')}
          </Typography>
        </Paper>
      ) : (
        /* Schedule Table by Day */
        dayOrder.map(day => {
          const daySchedules = groupedByDay[day];
          if (!daySchedules || daySchedules.length === 0) return null;

          return (
            <Paper key={day} sx={{ mb: 3 }}>
              <Box sx={{
                p: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
              }}>
                <Typography variant="h6">
                  {t(`department_schedules.days.${day}`) || day}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.100' }}>
                      <TableCell><AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{t('common.time')}</TableCell>
                      <TableCell><SchoolIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{t('common.course')}</TableCell>
                      <TableCell>{t('department_schedules.preview.section')}</TableCell>
                      <TableCell><RoomIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{t('common.classroom')}</TableCell>
                      <TableCell><PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{t('common.instructor')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {daySchedules.map((schedule, idx) => (
                      <TableRow key={schedule.id || idx} hover>
                        <TableCell>
                          <Chip
                            size="small"
                            label={`${formatTime(schedule.start_time || schedule.startTime)} - ${formatTime(schedule.end_time || schedule.endTime)}`}
                            variant="outlined"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {getCourseName(schedule)}
                            </Typography>
                            {getCourseCode(schedule) && (
                              <Typography variant="caption" color="text.secondary">
                                {getCourseCode(schedule)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getSectionCode(schedule) && (
                            <Chip size="small" label={getSectionCode(schedule)} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={<RoomIcon />}
                            label={getClassroom(schedule)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getInstructor(schedule)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          );
        })
      )}
    </Box>
  );
};

export default SchedulePreview;
