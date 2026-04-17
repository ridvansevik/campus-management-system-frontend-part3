import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
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
      <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold' }}>{t('not_found.title')}</Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>{t('not_found.desc')}</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('not_found.back_home')}
      </Button>
    </Box>
  );
};

export default NotFound;