import { Link } from 'react-router-dom';
export default function Home() { 
  return (
    <div style={{ padding: 20 }}>
      <h1>Akıllı Kampüs Sistemi</h1>
      <Link to="/login">Giriş Yap</Link> | <Link to="/register">Kayıt Ol</Link>
    </div>
  ); 
}