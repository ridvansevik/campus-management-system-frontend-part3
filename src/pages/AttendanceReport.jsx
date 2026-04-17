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
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AttendanceReport = () => {
  const { t, i18n } = useTranslation();
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
      toast.error(t('attendance_report.actions.error_operation'));
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
      toast.warning(t('attendance_report.actions.export_warning'));
      return;
    }

    const excelData = [];

    sessions.forEach(session => {
      const dateStr = new Date(session.date).toLocaleDateString(i18n.language);

      if (session.records.length === 0) {
        // Katılımcı olmayan oturumları da raporda göster (İsteğe bağlı)
        const row = {};
        row[t('attendance_report.date')] = dateStr;
        row[t('attendance_report.time')] = `${session.start_time?.slice(0, 5)} - ${session.end_time?.slice(0, 5)}`;
        row[t('attendance_report.table.student_no')] = '-';
        row[t('attendance_report.table.name')] = '-';
        row[t('attendance_report.table.check_in_time')] = '-';
        row[t('attendance_report.table.distance')] = '-';
        row[t('attendance_report.table.status_action')] = t('attendance_report.table.no_participation');
        excelData.push(row);
      } else {
        session.records.forEach(record => {
          const row = {};
          row[t('attendance_report.date')] = dateStr;
          row[t('attendance_report.time')] = `${session.start_time?.slice(0, 5)} - ${session.end_time?.slice(0, 5)}`;
          row[t('attendance_report.table.student_no')] = record.student?.student_number || 'Belirsiz';
          row[t('attendance_report.table.name')] = record.student?.user?.name || 'İsimsiz';
          row[t('attendance_report.table.check_in_time')] = new Date(record.check_in_time).toLocaleTimeString(i18n.language);
          row[t('attendance_report.table.distance')] = `${Math.round(record.distance_from_center)}m`;
          row[t('attendance_report.table.status_action')] = record.is_flagged ?
            `${t('attendance_report.status.suspicious')}: ${record.flag_reason}` :
            t('attendance_report.status.present');
          excelData.push(row);
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

    saveAs(dataBlob, `Attendance_Report_Section${selectedSection}_${new Date().toLocaleDateString(i18n.language).replace(/\//g, '-')}.xlsx`);
    toast.success(t('attendance_report.actions.export_success'));
  };
  // ---------------------------------------------

  // Onaylama Fonksiyonu
  const handleApprove = async (recordId) => {
    try {
      await api.put(`/attendance/records/${recordId}`, { action: 'approve' });
      toast.success(t('attendance_report.actions.success_approve'));
      fetchReport();
    } catch (error) {
      toast.error(t('attendance_report.actions.error_operation'));
    }
  };

  // Reddetme Fonksiyonu
  const handleReject = async (recordId) => {
    if (!window.confirm(t('attendance_report.actions.confirm_reject'))) return;
    try {
      await api.delete(`/attendance/records/${recordId}`);
      toast.success(t('attendance_report.actions.success_reject'));
      fetchReport();
    } catch (error) {
      toast.error(t('attendance_report.actions.error_operation'));
    }
  };

  return (
    <Layout>
      {/* BAŞLIK VE EXCEL BUTONU */}
      <Box sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 4
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {t('attendance_report.title')}
        </Typography>

        <Button
          variant="contained"
          color="success"
          startIcon={<FileDownloadIcon />}
          onClick={handleExportToExcel}
          disabled={loading || !selectedSection || sessions.length === 0}
          size="small"
        >
          {t('attendance_report.export_excel')}
        </Button>
      </Box>

      {/* FİLTRELEME ALANI */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 0, borderTop: '4px solid #1976d2' }}>
        <TextField
          select
          label={t('attendance_report.select_section')}
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          fullWidth
          helperText={t('attendance_report.helper_text')}
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
        <Alert severity="info">{t('attendance_report.no_records')}</Alert>
      ) : (
        sessions.map((session) => (
          <Accordion key={session.id} disableGutters sx={{ mb: 1, border: '1px solid #e0e0e0', boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 2 }}>
                <Typography sx={{ fontWeight: 'bold' }}>
                  {new Date(session.date).toLocaleDateString(i18n.language)}
                </Typography>
                <Box>
                  <Typography variant="caption" sx={{ mr: 2 }}>
                    {t('attendance_report.time')}: {session.start_time?.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                  </Typography>
                  <Chip
                    label={t('attendance_report.student_count', { count: session.records.length })}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <Table size="small" sx={{ minWidth: 500 }}>
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('attendance_report.table.student_no')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('attendance_report.table.name')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('attendance_report.table.check_in_time')}</TableCell>
                      <TableCell>{t('attendance_report.table.distance')}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{t('attendance_report.table.status_action')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session.records.length === 0 ? (
                      <TableRow><TableCell colSpan={5} align="center">{t('attendance_report.table.no_participation')}</TableCell></TableRow>
                    ) : (
                      session.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.student?.student_number}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>{record.student?.user?.name}</TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {new Date(record.check_in_time).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                          </TableCell>
                          <TableCell>{Math.round(record.distance_from_center)}m</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {record.is_flagged ? (
                                <>
                                  <Tooltip title={record.flag_reason || t('attendance_report.status.suspicious')} arrow placement="top">
                                    <Chip
                                      icon={<InfoIcon />}
                                      label={t('attendance_report.status.suspicious')}
                                      color="warning"
                                      size="small"
                                      sx={{ cursor: 'help' }}
                                    />
                                  </Tooltip>

                                  <Tooltip title={t('attendance_report.actions.approve')}>
                                    <IconButton size="small" color="success" onClick={() => handleApprove(record.id)}>
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title={t('attendance_report.actions.reject')}>
                                    <IconButton size="small" color="error" onClick={() => handleReject(record.id)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              ) : (
                                <Chip label={t('attendance_report.status.present')} color="success" size="small" />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Layout>
  );
};

export default AttendanceReport;