import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho người dùng
interface UserProfile {
  name: string;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const { token, login } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) {
          setError('Bạn cần đăng nhập để xem hồ sơ.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await api.get('/api/v1/auth/me', config);
        setProfile(response.data.user);
        setName(response.data.user.name);
        setEmail(response.data.user.email);
      } catch (err: any) {
        if (err.response?.status === 401) {
          setError('Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        } else {
          setError('Lỗi khi tải hồ sơ.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        alert('Bạn cần đăng nhập để cập nhật hồ sơ.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.put('/api/v1/auth/me', { name, email }, config);
      setProfile(response.data.user);
      login(response.data.user, token);
      setIsEditing(false);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err: any) {
      console.error('Lỗi khi cập nhật hồ sơ:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.';
      alert(errorMessage);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    try {
      if (!token) {
        alert('Bạn cần đăng nhập để đổi mật khẩu.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.put('/api/v1/auth/change-password', { 
        currentPassword,
        newPassword 
      }, config);
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Đổi mật khẩu thành công!');
    } catch (err: any) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      const errorMessage = err.response?.data?.message || 'Lỗi khi đổi mật khẩu.';
      alert(errorMessage);
    }
  };

  if (loading) return <div>Đang tải hồ sơ...</div>;
  if (error) return <div>Lỗi: {error}. Vui lòng <Link to="/login">đăng nhập</Link>.</div>;
  if (!profile) return <div>Không tìm thấy dữ liệu hồ sơ.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h1>Hồ sơ của tôi</h1>
      {!isEditing && !isChangingPassword ? (
        <div>
          <p><strong>Tên:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Vai trò:</strong> {profile.role}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Chỉnh sửa hồ sơ
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Đổi mật khẩu
            </button>
          </div>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label>
            Tên:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '5px' }}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '5px' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Lưu thay đổi
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label>
            Mật khẩu hiện tại:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '5px' }}
            />
          </label>
          <label>
            Mật khẩu mới:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '5px' }}
            />
          </label>
          <label>
            Xác nhận mật khẩu mới:
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', marginTop: '5px' }}
            />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Lưu mật khẩu
            </button>
            <button
              type="button"
              onClick={() => setIsChangingPassword(false)}
              style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;