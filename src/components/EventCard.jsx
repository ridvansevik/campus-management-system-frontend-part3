import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

/**
 * Reusable Event Card Component
 * Etkinlik kartı gösterir
 * 
 * @param {Object} event - Etkinlik objesi
 * @param {Function} onRegister - Kayıt ol butonu tıklandığında çağrılacak fonksiyon (opsiyonel)
 * @param {Boolean} showRegisterButton - Kayıt ol butonu gösterilsin mi? (default: true)
 * @param {Boolean} clickable - Kart tıklanabilir mi? (default: true)
 */
const EventCard = ({ 
  event, 
  onRegister, 
  showRegisterButton = true,
  clickable = true
}) => {
  const navigate = useNavigate();
  const isFull = event.registered_count >= event.capacity;

  const handleCardClick = () => {
    if (clickable) {
      navigate(`/events/${event.id}`);
    }
  };

  const handleRegister = (e) => {
    e.stopPropagation();
    if (onRegister) {
      onRegister(event.id);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': clickable ? { boxShadow: 6 } : {}
      }}
      onClick={handleCardClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" sx={{ flex: 1, mr: 1 }}>
            {event.title}
          </Typography>
          <Chip 
            label={event.category} 
            color="primary" 
            size="small" 
            variant="outlined" 
          />
        </Box>
        
        <Typography 
          color="text.secondary" 
          sx={{ 
            mt: 1, 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {event.description}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2, mb: 1 }}>
          <EventIcon fontSize="small" color="action" />
          <Typography variant="body2">
            {new Date(event.date).toLocaleDateString('tr-TR')} | {event.start_time}
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2">{event.location}</Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography 
            variant="caption" 
            sx={{ 
              color: isFull ? 'error.main' : 'success.main',
              fontWeight: 'bold'
            }}
          >
            {event.registered_count} / {event.capacity} kişi
          </Typography>
        </Box>

        {event.is_paid && event.price > 0 && (
          <Chip 
            label={`${event.price} ₺`} 
            color="warning" 
            size="small" 
            sx={{ mb: 1 }} 
          />
        )}

        {event.registration_deadline && (
          <Typography variant="caption" color="text.secondary" display="block">
            Son kayıt: {new Date(event.registration_deadline).toLocaleDateString('tr-TR')}
          </Typography>
        )}
      </CardContent>
      {showRegisterButton && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="outlined" 
            fullWidth 
            sx={{ mr: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event.id}`);
            }}
          >
            Detay
          </Button>
          <Button 
            variant="contained" 
            fullWidth
            onClick={handleRegister}
            disabled={isFull}
          >
            {isFull ? 'Dolu' : 'Kayıt Ol'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default EventCard;

