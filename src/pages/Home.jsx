import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: 20 }}>
      <h1>{t('home.title')}</h1>
      <Link to="/login">{t('home.login')}</Link> | <Link to="/register">{t('home.register')}</Link>
    </div>
  );
}