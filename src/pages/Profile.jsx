import { useState, useEffect } from 'react';
import { Paper, Typography, Grid, TextField, Button, Avatar, Box, Divider, IconButton, CircularProgress } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  
  const [formData, setFormData] = useState({ phone_number: '', address: '', bio: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfileData(res.data.data);
        setFormData({
          phone_number: res.data.data.phone_number || '',
          address: res.data.data.address || '',
          bio: res.data.data.bio || ''
        });
      } catch (error) {
        toast.error('Profil yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/me', formData);
      toast.success('Profil güncellendi.');
    } catch (error) {
      toast.error('Güncelleme başarısız.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('Yeni şifreler eşleşmiyor.');
      return;
    }
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Şifre değiştirildi.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Hata oluştu.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('profile_image', file);
    try {
      const res = await api.post('/users/me/profile-picture', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newUrl = res.data.data.profilePictureUrl;
      setProfileData((prev) => ({ ...prev, profile_picture_url: newUrl }));
      setUser((prevUser) => ({ ...prevUser, profile_picture_url: newUrl }));
      toast.success('Fotoğraf yüklendi.');
    } catch (error) {
      toast.error('Hata oluştu.');
    }
  };

  if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box></Layout>;
  if (!profileData) return <Layout><Typography>Profil bulunamadı.</Typography></Layout>;

  return (
    <Layout>
      <Paper sx={{ 
        p: 4, maxWidth: 900, mx: 'auto', 
        borderRadius: 0, boxShadow: 'none', border: '1px solid #e0e0e0' // FLAT
      }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center', borderRight: { md: '1px solid #e0e0e0' } }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                variant="rounded" // Köşeliye yakın
                src={profileData.profile_picture_url || null}
                sx={{ width: 140, height: 140, mb: 2, mx: 'auto', borderRadius: 2 }} 
              />
              <IconButton color="primary" component="label" sx={{ position: 'absolute', bottom: -10, right: -10, bgcolor: 'white', border: '1px solid #ddd', borderRadius: 1 }}>
                <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                <PhotoCamera fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>{profileData.email}</Typography>
            <Typography color="textSecondary" sx={{ mb: 2, fontSize: '0.9rem' }}>
              {profileData.role === 'student' ? 'Öğrenci' : profileData.role === 'faculty' ? 'Öğretim Üyesi' : 'Yönetici'}
            </Typography>
            {profileData.studentProfile && <Typography variant="body2" sx={{ bgcolor: '#f5f5f5', p: 1, display: 'inline-block' }}>{profileData.studentProfile.student_number}</Typography>}
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>Bilgiler</Typography>
            <Box component="form" onSubmit={handleUpdate} sx={{ mb: 5 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Telefon" value={formData.phone_number} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} size="small" /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Adres" multiline rows={2} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} size="small" /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Biyografi" multiline rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} size="small" /></Grid>
                <Grid item xs={12}><Button variant="contained" disableElevation type="submit" sx={{ borderRadius: 0, textTransform: 'none' }}>Değişiklikleri Kaydet</Button></Grid>
              </Grid>
            </Box>

            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>Güvenlik</Typography>
            <Box component="form" onSubmit={handleChangePassword}>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth type="password" label="Mevcut Şifre" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} size="small" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="password" label="Yeni Şifre" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} size="small" /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth type="password" label="Tekrar" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} size="small" /></Grid>
                <Grid item xs={12}><Button variant="outlined" color="error" type="submit" sx={{ borderRadius: 0, textTransform: 'none' }}>Şifreyi Değiştir</Button></Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Layout>
  );
};

export default Profile;