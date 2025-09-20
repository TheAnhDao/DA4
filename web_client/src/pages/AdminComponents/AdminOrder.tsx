import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, Modal, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: { product: { _id: string; name: string; price: number }; quantity: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AdminOrder: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>('');

  // Lấy danh sách đơn hàng
  useEffect(() => {
    const fetchOrders = async () => {
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
        const response = await api.get('/api/orders/all', config);
        setOrders(response.data.orders);
        console.log(response.data.orders);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi lấy danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  // Mở modal để cập nhật trạng thái
  const showModal = (order: Order) => {
    setEditingOrder(order);
    setStatus(order.status);
    setIsModalOpen(true);
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await api.put(`/api/orders/${editingOrder._id}/status`, { status }, config);
      setOrders(orders.map((o) => (o._id === editingOrder._id ? response.data.order : o)));
      Modal.success({ content: 'Cập nhật trạng thái thành công' });
      setIsModalOpen(false);
    } catch (err: any) {
      Modal.error({ content: err.response?.data?.message || 'Lỗi khi cập nhật trạng thái' });
    }
  };

  // Xóa đơn hàng
  const handleDeleteOrder = async (orderId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.delete(`/api/v1/orders/${orderId}`, config);
      setOrders(orders.filter((o) => o._id !== orderId));
      Modal.success({ content: 'Xóa đơn hàng thành công' });
    } catch (err: any) {
      Modal.error({ content: err.response?.data?.message || 'Lỗi khi xóa đơn hàng' });
    }
  };

  // Xác nhận xóa
  const confirmDelete = (orderId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa đơn hàng ${orderId}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => handleDeleteOrder(orderId),
    });
  };

  // Cột bảng
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Khách hàng',
      dataIndex: ['user', 'name'],
      key: 'user',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items: Order['items']) => {       
        return items?.map((p) => `${p.product.name} (x${p.quantity})`).join(', ') || '';
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (totalAmount: number | undefined) => { 
        return totalAmount !== undefined && totalAmount !== null ? `${totalAmount.toLocaleString()} VNĐ` : 'N/A';
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: { [key: string]: string } = {
          pending: 'Chờ xử lý',
          processing: 'Đang xử lý',
          shipped: 'Đã giao',
          delivered: 'Hoàn thành',
          cancelled: 'Đã hủy',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Order) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            Cập nhật
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record._id)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý đơn hàng</h2>
      <Spin spinning={loading} tip="Đang tải...">
        {error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 16 }}
          />
        )}
      </Spin>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        open={isModalOpen}
        onOk={handleUpdateStatus}
        onCancel={() => setIsModalOpen(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Select
          style={{ width: '100%' }}
          value={status}
          onChange={setStatus}
        >
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="processing">Đang xử lý</Select.Option>
          <Select.Option value="shipped">Đã giao</Select.Option>
          <Select.Option value="delivered">Hoàn thành</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
        </Select>
      </Modal>
    </div>
  );
};

export default AdminOrder;