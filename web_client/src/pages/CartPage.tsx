import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../config/axios';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
}

interface CartItem {
  _id: string; // ID của item trong mảng items của giỏ hàng
  product: Product; // Sử dụng kiểu Product đã định nghĩa
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const { token } = useAuth(); // Lấy token từ AuthContext
  const navigate = useNavigate();

  // Hàm để fetch giỏ hàng từ backend
  const fetchCartItems = async () => {
    try {
      if (!token) {
        setError('Bạn cần đăng nhập để xem giỏ hàng.');
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Gọi đến API giỏ hàng: GET /api/v1/
      const response = await api.get('/api/v1/', config);
      if (response.data.cart) {
        setCartItems(response.data.cart.items);
      } else {
        setCartItems([]); // Giỏ hàng trống
      }
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn hoặc bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        // Có thể gọi logout ở đây nếu cần
      } else {
        setError('Lỗi khi lấy dữ liệu giỏ hàng.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [token]); // Chạy lại khi token thay đổi

  // Tính tổng tiền mỗi khi cartItems thay đổi
  useEffect(() => {
    const calculateTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    setTotalAmount(calculateTotal);
  }, [cartItems]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return; // Không cho phép số lượng nhỏ hơn 1

    try {
      if (!token) throw new Error('Không có token xác thực.');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Gọi đến API cập nhật giỏ hàng: PUT /api/v1/cart/:id
      const response = await api.put(`/api/v1/${itemId}`, { quantity: newQuantity }, config);
      if (response.data.success) {
        setCartItems(response.data.cart.items); // Cập nhật lại giỏ hàng từ phản hồi
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật số lượng:', err);
      alert('Có lỗi xảy ra khi cập nhật số lượng.');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      if (!token) throw new Error('Không có token xác thực.');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Gọi đến API xóa sản phẩm khỏi giỏ hàng: DELETE /api/v1
      const response = await api.delete(`/api/v1/${itemId}`, config);
      if (response.data.success) {
        setCartItems(response.data.cart.items); // Cập nhật lại giỏ hàng từ phản hồi
      }
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm:', err);
      alert('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.');
    }
  };

  const handleCheckout = async () => {
    try {
      if (!token) {
        alert('Vui lòng đăng nhập để thanh toán.');
        navigate('/login'); // Chuyển hướng đến trang đăng nhập
        return;
      }
      if (cartItems.length === 0) {
        alert('Giỏ hàng của bạn đang trống.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Gọi đến API tạo đơn hàng: POST
      const response = await api.post('api/orders/', {}, config); // Body trống vì backend sẽ lấy từ giỏ hàng

      if (response.data.success) {
        alert('Đơn hàng của bạn đã được tạo thành công!');
        setCartItems([]); // Xóa giỏ hàng trên frontend
        setTotalAmount(0); // Đặt tổng tiền về 0
        navigate('/my-orders'); // Chuyển hướng đến trang đơn hàng của tôi
      }
    } catch (err) {
      console.error('Lỗi khi tạo đơn hàng:', err);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return <div>Đang tải giỏ hàng...</div>;
  }

  if (error) {
    return <div>Lỗi: {error}. Vui lòng <Link to="/login">đăng nhập</Link> để xem giỏ hàng.</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Giỏ hàng của bạn</h1>
      {cartItems.length === 0 ? (
        <p>Giỏ hàng trống. <Link to="/">Về trang chủ để thêm sản phẩm.</Link></p>
      ) : (
        <div>
          <ul>
            {cartItems.map((item) => (
              <li key={item._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <Link to={`/product/${item.product._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  {item.product.images && item.product.images.length > 0 && (
                    <img src={item.product.images[0].url} alt={item.product.name} style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '20px', borderRadius: '4px' }} />
                  )}
                  <div>
                    <h3>{item.product.name}</h3>
                    <p>Giá đơn vị: {item.product.price.toLocaleString('vi-VN')} VNĐ</p>
                    <p>Tổng tiền: {(item.product.price * item.quantity).toLocaleString('vi-VN')} VNĐ</p>
                  </div>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} style={{ padding: '5px 10px', marginRight: '5px' }}>-</button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item._id, parseInt(e.target.value))}
                    min="1"
                    style={{ width: '50px', textAlign: 'center' }}
                  />
                  <button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)} style={{ padding: '5px 10px', marginLeft: '5px' }}>+</button>
                  <button onClick={() => handleRemoveItem(item._id)} style={{ marginLeft: '20px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h2>Tổng cộng: {totalAmount.toLocaleString('vi-VN')} VNĐ</h2>
            <button
              onClick={handleCheckout}
              style={{ padding: '15px 30px', fontSize: '1.2em', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '20px' }}
            >
              Thanh toán
            </button>
            {/* Các phương thức thanh toán có thể được thêm vào đây */}
            <p style={{ marginTop: '10px', color: '#666' }}>
              Khi nhấn "Thanh toán", đơn hàng sẽ được tạo và giỏ hàng sẽ trống. Bạn có thể xem đơn hàng tại trang <Link to="/my-orders">Đơn hàng của tôi</Link>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;