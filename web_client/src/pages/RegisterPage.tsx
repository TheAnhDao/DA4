import React, { useState } from 'react';
import api from '../config/axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/auth/register', { name, email, password });
      alert('Đăng ký thành công!');
      navigate('/login');
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert('Đăng ký thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', textAlign: 'center' }}>
      <h1>Đăng ký tài khoản</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#ff5722', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Đăng ký
        </button>
      </form>
      <p style={{ marginTop: '15px' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </p>
    </div>
  );
};

export default RegisterPage;