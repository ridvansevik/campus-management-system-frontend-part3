import React from 'react';
import { useTranslation } from 'react-i18next';
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
  title, // Default props removed to allow translation inside component
  description,
  size = 300
}) => {
  const { t } = useTranslation();

  const finalTitle = title || t('qr_code.title');
  const finalDescription = description || t('qr_code.description');
  if (!qrCode) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{finalTitle}</DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Box>
          <QRCodeSVG value={qrCode} size={size} />
          {finalDescription && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {finalDescription}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;

