import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid, Paper, Typography, Box, CircularProgress,
  Card, Avatar, List, ListItem, ListItemText, Divider, Chip, Button
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import GradeIcon from '@mui/icons-material/Grade';
import CampaignIcon from '@mui/icons-material/Campaign';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch (error) {
        console.error("Dashboard verisi alınamadı", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box></Layout>;

  // Modern StatCard Bileşeni
  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card sx={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      p: 3,
      borderRadius: 4,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-5px)' }
    }}>
      <Avatar sx={{
        bgcolor: bgColor,
        color: color,
        width: 64,
        height: 64,
        mr: 2.5,
        borderRadius: 3
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
          {value}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Layout>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
          {t('welcome')}, {user?.name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('dashboard_desc')}
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* --- ÖĞRENCİ KARTLARI --- */}
        {user?.role === 'student' && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('gpa')}
                value={stats?.gpa?.toFixed(2) || "0.00"}
                icon={<GradeIcon fontSize="large" />}
                color="#ca8a04"
                bgColor="#fef9c3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('semester_gpa')}
                value={stats?.semester_gpa?.toFixed(2) || "0.00"}
                icon={<GradeIcon fontSize="large" />}
                color="#7c3aed"
                bgColor="#ede9fe"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('active_courses')}
                value={stats?.activeCourses || 0}
                icon={<ClassIcon fontSize="large" />}
                color="#2563eb"
                bgColor="#dbeafe"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={t('credits_earned')}
                value={`${stats?.total_credits_earned || 0} / ${stats?.total_ects_earned || 0} ECTS`}
                icon={<SchoolIcon fontSize="large" />}
                color="#16a34a"
                bgColor="#dcfce7"
              />
            </Grid>
          </>
        )}


        {/* --- AKADEMİSYEN KARTLARI --- */}
        {user?.role === 'faculty' && (
          <>
            <Grid item xs={12} sm={6} md={6}>
              <StatCard
                title={t('active_sections')}
                value={stats?.activeSections || 0}
                icon={<ClassIcon fontSize="large" />}
                color="#2563eb"
                bgColor="#dbeafe"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <StatCard
                title={t('title')}
                value={user?.facultyProfile?.title || t('common.faculty')}
                icon={<PersonIcon fontSize="large" />}
                color="#0891b2"
                bgColor="#cffafe"
              />
            </Grid>
          </>
        )}

        {/* --- SON DUYURULAR --- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 4, border: 'none' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#e0f2fe', color: '#0284c7' }}>
                <CampaignIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('latest_announcements')}</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {stats?.announcements?.length > 0 ? (
                stats.announcements.map((ann, index) => (
                  <div key={ann.id}>
                    <ListItem alignItems="flex-start" sx={{ py: 2.5, px: 3, '&:hover': { bgcolor: '#f8fafc' } }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography variant="subtitle1" component="span" fontWeight="600" color="#334155">
                              {ann.title}
                            </Typography>
                            {ann.priority === 'high' &&
                              <Chip label={t('important')} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', height: 24, fontWeight: 600, fontSize: '0.7rem' }} />
                            }
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1 }}>
                              {ann.content}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" fontWeight="500">
                              {new Date(ann.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < stats.announcements.length - 1 && <Divider component="li" sx={{ borderColor: '#f1f5f9' }} />}
                  </div>
                ))
              ) : (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">{t('no_announcements')}</Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        {/* --- SAĞ TARAF (BASİT TAKVİM ALANI) --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{
            p: 3, height: '100%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            minHeight: 250,
            boxShadow: '0 10px 30px -10px rgba(99, 102, 241, 0.5)'
          }}>
            <Typography variant="h5" fontWeight="700" gutterBottom>{t('academic_calendar')}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              {t('calendar_desc')}
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: 'white',
                color: '#6366f1',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
              }}
            >
              {t('view_calendar')}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;