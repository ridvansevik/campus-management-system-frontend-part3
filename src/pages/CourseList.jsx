import { useState, useEffect } from 'react';
import { 
  Typography, Grid, Card, CardContent, CardActions, Button, 
  Box, TextField, InputAdornment, Chip, CircularProgress, Paper 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Layout from '../components/Layout';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CourseList = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (search = '') => {
    try {
      const res = await api.get(`/courses?search=${search}`);
      setCourses(res.data.data);
    } catch (error) {
      console.error("Dersler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) fetchCourses(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Layout>
      {/* --- Başlık ve Arama Alanı --- */}
      <Box sx={{ mb: 5, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Ders Kataloğu
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Üniversitedeki tüm dersleri inceleyin ve kayıt olun.
          </Typography>
        </Box>
        
        <Paper
          elevation={3}
          sx={{
            p: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: { xs: '100%', md: 400 },
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            fullWidth
            placeholder="Ders ara (Kod, İsim veya İçerik)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true, // Alt çizgiyi kaldır
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1 }}>
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              style: { padding: '10px' } // İç boşluk
            }}
            variant="standard"
          />
        </Paper>
      </Box>

      {/* --- İçerik Alanı --- */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8 }}>
          <CircularProgress size={50} thickness={4} />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>Dersler yükleniyor...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {courses.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4, bgcolor: '#f9fafb' }}>
                <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Aradığınız kriterlere uygun ders bulunamadı.</Typography>
              </Paper>
            </Grid>
          ) : (
            courses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.1)' 
                    },
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Chip 
                        label={course.code} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 700, borderRadius: 2 }} 
                      />
                      <Chip 
                        label={`${course.credits} Kredi`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ borderColor: 'divider', color: 'text.secondary', fontWeight: 500 }} 
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1 }}>
                      {course.name}
                    </Typography>
                    
                    {course.department && (
                      <Typography variant="caption" display="block" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                        {course.department.name.toUpperCase()}
                      </Typography>
                    )}

                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 3, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        lineHeight: 1.6
                      }}
                    >
                      {course.description}
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      sx={{ 
                        py: 1.2, 
                        bgcolor: 'rgba(79, 70, 229, 0.1)', 
                        color: 'primary.main',
                        fontWeight: 700,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                        }
                      }}
                    >
                      Detayları Gör
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Layout>
  );
};

export default CourseList;