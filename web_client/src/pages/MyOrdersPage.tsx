import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong đơn hàng
interface ProductInOrder {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

// Định nghĩa kiểu dữ liệu cho một item trong đơn hàng
interface OrderItem {
  _id: string;
  product: ProductInOrder;
  quantity: number;
}

// Định nghĩa kiểu dữ liệu cho một đơn hàng
interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Lấy token từ AuthContext

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        if (!token) {
          setError('Bạn cần đăng nhập để xem đơn hàng của mình.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        // Gọi đến API backend: GET /api/orders/myorders
        const response = await api.get('api/orders/myorders', config);
        setOrders(response.data.orders);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        } else {
          setError('Lỗi khi lấy danh sách đơn hàng.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, [token]); // Chạy lại khi token thay đổi

  if (loading) {
    return <div>Đang tải đơn hàng của bạn...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}. Vui lòng <Link to="/login">đăng nhập</Link> để xem đơn hàng.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Đơn hàng của tôi</h1>
      {orders.length === 0 ? (
        <p>Bạn chưa có đơn hàng nào. <Link to="/">Về trang chủ để mua sắm.</Link></p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3>Mã đơn hàng: <Link to={`/order/${order._id}`} style={{ textDecoration: 'none', color: '#007bff' }}>{order._id}</Link></h3>
              <p>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Trạng thái: <strong>{order.status}</strong></p>
              <p>Tổng tiền: <strong>{order.totalAmount.toLocaleString('vi-VN')} VNĐ</strong></p>
              <h4 style={{ marginTop: '10px' }}>Sản phẩm:</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {order.items.map(item => (
                  <li key={item._id}>{item.product.name} (x{item.quantity}) - {(item.product.price * item.quantity).toLocaleString('vi-VN')} VNĐ</li>
                ))}
              </ul>
              <Link to={`/order/${order._id}`} style={{ display: 'inline-block', marginTop: '15px', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                Xem chi tiết
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;