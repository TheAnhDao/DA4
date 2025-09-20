import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

const AdminUser: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        if (!token) {
          setError('Bạn cần đăng nhập để xem chi tiết.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await api.get('/api/v1/auth/users', config);
        setUsers(response.data.users);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi lấy danh sách người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const handleDeleteUser = async (userId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.delete(`/api/v1/auth/users/${userId}`, config);
      setUsers(users.filter((user: any) => user._id !== userId));
      Modal.success({
        title: 'Thành công',
        content: 'Xóa người dùng thành công',
      });
    } catch (err: any) {
      Modal.error({
        title: 'Lỗi',
        content: err.response?.data?.message || 'Lỗi khi xóa người dùng',
      });
    }
  };

  const confirmDelete = (userId: string, userName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa người dùng ${userName}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => handleDeleteUser(userId),
    });
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => confirmDelete(record._id, record.name)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <Spin spinning={loading} tip="Đang tải...">
        {error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 16 }}
          />
        )}
      </Spin>
    </div>
  );
};

export default AdminUser;