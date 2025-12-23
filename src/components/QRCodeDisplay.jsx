import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Reusable QR Code Display Component
 * QR kodunu full-screen modal'da gösterir
 * 
 * @param {Boolean} open - Modal açık mı?
 * @param {Function} onClose - Modal kapatma fonksiyonu
 * @param {String} qrCode - QR kod string'i (JSON veya token)
 * @param {String} title - Modal başlığı (opsiyonel)
 * @param {String} description - QR kod açıklaması (opsiyonel)
 * @param {Number} size - QR kod boyutu (default: 300)
 */
const QRCodeDisplay = ({ 
  open, 
  onClose, 
  qrCode, 
  title = 'QR Kod',
  description = 'QR kodunuzu görevliye gösteriniz.',
  size = 300
}) => {
  if (!qrCode) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Box>
          <QRCodeSVG value={qrCode} size={size} />
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {description}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;

