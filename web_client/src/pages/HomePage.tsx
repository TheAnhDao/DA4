import React, { useState, useEffect } from 'react';
import api from '../config/axios';
import { Link } from 'react-router-dom';


interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  images: { url: string }[];
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/');
        setProducts(response.data.products);
        setLoading(false);
      } catch (err) {
        setError('Có lỗi xảy ra khi tải dữ liệu sản phẩm!');
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div>Đang tải sản phẩm...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  const hideProductName = (name: string, lengthToShow = 20) => {
    if (!name || name.length <= lengthToShow) {
      return name;
    }
    return `${name.substring(0, lengthToShow)}...`;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Danh sách Sản phẩm</h1>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        padding: '20px 0',
      }}>
        {products.map(product => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              backgroundColor: '#fff'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <img
                src={product.images[0]?.url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                }}
              />
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.2em', marginBottom: '10px', color: '#333' }}>{hideProductName(product.name)}</h2>
                <p style={{ color: '#ff5722', fontWeight: 'bold' }}>{product.price.toLocaleString()} VNĐ</p>
                <button style={{
                  background: '#ff5722',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  marginTop: '15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1em'
                }}>Xem chi tiết</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;