import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center'
      }}
    >
      <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold' }}>404</Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>Aradığınız sayfa bulunamadı.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Ana Sayfaya Dön
      </Button>
    </Box>
  );
};

export default NotFound;