import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext'; // Để lấy token

// Định nghĩa kiểu dữ liệu cho sản phẩm trong đơn hàng
interface ProductInOrder {
  _id: string;
  name: string;
  price: number;
  // images: { url: string }[]; // Có thể thêm nếu bạn muốn hiển thị hình ảnh sản phẩm
}

// Định nghĩa kiểu dữ liệu cho một item trong đơn hàng
interface OrderItem {
  _id: string;
  product: ProductInOrder;
  quantity: number;
}

// Định nghĩa kiểu dữ liệu cho người dùng trong đơn hàng (populate user)
interface UserInOrder {
  _id: string;
  name: string;
  email: string;
}

// Định nghĩa kiểu dữ liệu cho một đơn hàng chi tiết
interface OrderDetails {
  _id: string;
  user: UserInOrder;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  // Thêm các trường khác nếu có, ví dụ: shippingAddress, paymentMethod
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID đơn hàng từ URL
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); // Lấy token từ AuthContext

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!token) {
          setError('Bạn cần đăng nhập để xem chi tiết đơn hàng.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        // Gọi đến API backend: GET /api/orders/:id
        const response = await api.get(`/api/orders/${id}`, config);
        setOrder(response.data.order);
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          setError('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền xem đơn hàng này. Vui lòng đăng nhập lại.');
        } else if (err.response && err.response.status === 403) {
          setError('Bạn không có quyền xem đơn hàng này.');
        } else if (err.response && err.response.status === 404) {
          setError('Không tìm thấy đơn hàng.');
        } else {
          setError('Lỗi khi lấy chi tiết đơn hàng.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id, token]); // Chạy lại khi ID hoặc token thay đổi

  if (loading) {
    return <div>Đang tải chi tiết đơn hàng...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}. Vui lòng <Link to="/login">đăng nhập</Link> hoặc kiểm tra lại đường dẫn.</div>;
  }

  if (!order) {
    return <div>Không tìm thấy dữ liệu đơn hàng.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
      <h1>Chi tiết đơn hàng #{order._id}</h1>
      <p><strong>Người đặt:</strong> {order.user.name} ({order.user.email})</p>
      <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</p>
      <p><strong>Trạng thái:</strong> <span style={{ fontWeight: 'bold', color: order.status === 'delivered' ? 'green' : (order.status === 'cancelled' ? 'red' : 'orange') }}>{order.status.toUpperCase()}</span></p>
      <p><strong>Tổng tiền:</strong> <span style={{ fontWeight: 'bold' }}>{order.totalAmount.toLocaleString('vi-VN')} VNĐ</span></p>

      <h2 style={{ marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Sản phẩm trong đơn hàng:</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {order.items.map(item => (
          <li key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #f0f0f0' }}>
            <Link to={`/product/${item.product._id}`} style={{ textDecoration: 'none', color: '#333', flexGrow: 1 }}>
              {item.product.name} (x{item.quantity})
            </Link>
            <span style={{ fontWeight: 'bold' }}>{(item.product.price * item.quantity).toLocaleString('vi-VN')} VNĐ</span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link to="/my-orders" style={{ display: 'inline-block', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailsPage;