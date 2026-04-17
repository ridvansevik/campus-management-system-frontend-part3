import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button, Box, Typography, Paper, Chip } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getMySchedule, downloadIcal } from '../services/scheduleService';
import fileDownload from 'js-file-download';
import Layout from '../components/Layout';
import DownloadIcon from '@mui/icons-material/Download';
import { toast } from 'react-toastify';

const MySchedule = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await getMySchedule();

      // Backend'den gelen veriyi FullCalendar formatına çeviriyoruz
      const daysMap = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5 };

      const calendarEvents = (res.data.data || []).map((item, index) => {
        const courseCode = item.section?.course?.code || item.course?.code || t('schedule.course');
        const sectionCode = item.section?.section_code || '';
        const classroom = item.classroom?.code || item.classroom_code || t('schedule.no_classroom');
        const instructor = item.section?.instructor?.name || item.instructor?.name || '';

        // Renk paleti (farklı dersler için)
        const colors = ['#3788d8', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#0891b2'];
        const color = colors[index % colors.length];

        return {
          id: item.id,
          title: `${courseCode}${sectionCode ? ` (${sectionCode})` : ''}`,
          startTime: item.start_time,
          endTime: item.end_time,
          daysOfWeek: [daysMap[item.day_of_week]],
          color: color,
          extendedProps: {
            classroom: classroom,
            instructor: instructor,
            courseName: item.section?.course?.name || item.course?.name || '',
            day: item.day_of_week
          }
        };
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error(error);
      toast.error(t('schedule.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIcal = async () => {
    try {
      const res = await downloadIcal();
      fileDownload(res.data, 'ders-programi.ics');
      toast.success(t('schedule.download_success'));
    } catch (error) {
      console.error('İndirme hatası', error);
      toast.error(t('schedule.download_error'));
    }
  };

  const handleEventClick = (info) => {
    const event = info.event;
    const extendedProps = event.extendedProps;
    // Event detayını göster (modal veya alert)
    // Event detayını göster (modal veya alert)
    alert(`
${t('schedule.course')}: ${event.title}
${t('schedule.classroom')}: ${extendedProps.classroom}
${t('schedule.instructor')}: ${extendedProps.instructor}
${t('schedule.day')}: ${extendedProps.day}
${t('schedule.hour')}: ${event.start.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
    `);
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('schedule.title')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadIcal}
            size="large"
          >
            {t('schedule.download')}
          </Button>
        </Box>

        {loading ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography>{t('schedule.loading')}</Typography>
          </Paper>
        ) : events.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('schedule.no_data')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('schedule.no_data_desc')}
            </Typography>
          </Paper>
        ) : (
          <Paper sx={{ p: 2 }}>
            <FullCalendar
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'timeGridWeek,timeGridDay'
              }}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              weekends={false}
              events={events}
              height="auto"
              eventClick={handleEventClick}
              locale={i18n.language}
              firstDay={1} // Pazartesi başlangıç
              slotDuration="00:40:00"
              slotLabelInterval="01:00:00"
            />
          </Paper>
        )}

        {/* Ders Renkleri Açıklaması */}
        {events.length > 0 && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{t('schedule.note').split(':')[0]}:</strong>{t('schedule.note').split(':')[1]}
            </Typography>
          </Box>
        )}
      </Container>
    </Layout>
  );
};

export default MySchedule;