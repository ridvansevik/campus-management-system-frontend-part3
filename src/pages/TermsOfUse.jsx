import React from 'react';
import { Container, Typography, Box, Paper, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useTranslation } from 'react-i18next';

const TermsOfUse = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            window.close();
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 5 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mb: 3 }}
            >
                {window.history.length > 1 ? t('terms_of_use.back') : t('terms_of_use.close')}
            </Button>

            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
                    {t('terms_of_use.title')}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                    {t('terms_of_use.last_update')}: {new Date().toLocaleDateString('tr-TR')}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.intro')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('terms_of_use.sections.intro_text')}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.scope')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('terms_of_use.sections.scope_text')}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.responsibilities')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {/* Keeping list hardcoded for now or use trans array, simplifying for this task */}
                        <ul>
                            <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayınız.</li>
                            <li>Platform üzerinden yapılan tüm işlemlerden kullanıcı sorumludur.</li>
                            <li>Sistemi, yürürlükteki yasalara ve üniversite yönetmeliklerine aykırı amaçlarla kullanamazsınız.</li>
                            <li>Sisteme zarar verecek, işleyişini aksatacak yazılım veya işlemlerden kaçınmalısınız.</li>
                        </ul>
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.privacy')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {t('terms_of_use.sections.privacy_text')}
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.intellectual_property')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Platform üzerindeki tüm logolar, tasarımlar, yazılımlar ve içerikler üniversitenin veya lisans verenlerinin mülkiyetindedir
                        ve telif hakkı yasaları ile korunmaktadır. İzinsiz kopyalanması veya kullanılması yasaktır.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.changes')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Yönetim, bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutar.
                        Değişiklikler yayınlandığı tarihte yürürlüğe girer. Platformu kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                        {t('terms_of_use.sections.contact')}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Kullanım koşulları ile ilgili sorularınız için Öğrenci İşleri veya Bilgi İşlem Daire Başkanlığı ile iletişime geçebilirsiniz.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default TermsOfUse;
