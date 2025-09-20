import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/axios'; // Đảm bảo api của bạn được cấu hình đúng base URL
import { useAuth } from '../context/AuthContext'; // Giả định bạn đã có AuthContext

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: { url: string }[];
}

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const { user , token } = useAuth(); // Lấy thông tin người dùng và token từ AuthContext

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Giả định api đã được cấu hình với baseURL: 'http://localhost:5000/api/v1/'
        const response = await api.get(`/${id}`); // Gọi đến /api/v1/products/:id
        setProduct(response.data.product);
        setLoading(false);
      } catch (err) {
        setError('Không tìm thấy sản phẩm!');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user || !token) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    try {
      if (product) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`, // Đính kèm token vào header
          },
        };
        await api.post('/api/v1/', { productId: product._id, quantity }, config);
        alert('Sản phẩm đã được thêm vào giỏ hàng!');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  if (loading) return <div>Đang tải chi tiết sản phẩm...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  if (!product) return <div>Không có dữ liệu sản phẩm.</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{product.name}</h1>
      {product.images && product.images.length > 0 && (
        <img src={product.images[0].url} alt={product.name} style={{ width: '100%', maxWidth: '400px', height: 'auto', borderRadius: '8px' }} />
      )}
      <p style={{ fontSize: '1.2em', color: '#333' }}>Giá: {product.price.toLocaleString('vi-VN')} VNĐ</p>
      <p>Danh mục: {product.category}</p>
      <p>Mô tả: {product.description}</p>
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center' }}>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          style={{ width: '60px', padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        <button
          onClick={handleAddToCart}
          style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default ProductDetailsPage;