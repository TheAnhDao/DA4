import React, { useState, useEffect } from 'react';
import { Table, Spin, Alert, Button, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: { public_id: string; url: string }[];
  createdAt: string;
}

const AdminProduct: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
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
        const response = await api.get('/', config);
        setProducts(response.data.products);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [token]);

  // Mở modal để thêm hoặc sửa sản phẩm
  const showModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({
        ...product,
        images: product.images.map((img) => img.url).join(', '), // Chuyển mảng images thành chuỗi
      });
    } else {
      setEditingProduct(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Xử lý submit form (thêm hoặc sửa)
  const handleFormSubmit = async (values: any) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Chuyển đổi chuỗi images thành mảng
      const images = values.images
        ? values.images.split(',').map((url: string) => ({
            public_id: `img_${Date.now()}_${Math.random()}`, // Giả lập public_id
            url: url.trim(),
          }))
        : [];

      const productData = { ...values, images };

      if (editingProduct) {
        // Sửa sản phẩm
        const response = await api.put(`/${editingProduct._id}`, productData, config);
        setProducts(products.map((p) => (p._id === editingProduct._id ? response.data.product : p)));
        Modal.success({ content: 'Sửa sản phẩm thành công' });
      } else {
        // Thêm sản phẩm
        const response = await api.post('/', productData, config);
        setProducts([...products, response.data.product]);
        Modal.success({ content: 'Thêm sản phẩm thành công' });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      Modal.error({ content: err.response?.data?.message || 'Lỗi khi lưu sản phẩm' });
    }
  };

  // Xóa sản phẩm
  const handleDeleteProduct = async (productId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await api.delete(`/${productId}`, config);
      setProducts(products.filter((p) => p._id !== productId));
      Modal.success({ content: 'Xóa sản phẩm thành công' });
    } catch (err: any) {
      Modal.error({ content: err.response?.data?.message || 'Lỗi khi xóa sản phẩm' });
    }
  };

  // Xác nhận xóa
  const confirmDelete = (productId: string, productName: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa sản phẩm ${productName}?`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => handleDeleteProduct(productId),
    });
  };

  // Cột bảng
  const columns = [
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images: { public_id: string; url: string }[]) =>
        images.length > 0 ? <a href={images[0].url} target="_blank" rel="noopener noreferrer">Xem hình</a> : 'Không có',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Product) => (
        <>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record._id, record.name)}
          >
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý sản phẩm</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Thêm sản phẩm
      </Button>
      <Spin spinning={loading} tip="Đang tải...">
        {error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={products}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            style={{ marginTop: 16 }}
          />
        )}
      </Spin>

      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        okText={editingProduct ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} onFinish={handleFormSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="Giá"
            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="category"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select>
              <Select.Option value="McLaren">McLaren</Select.Option>
              <Select.Option value="Aston Martin">Aston Martin</Select.Option>
              <Select.Option value="Audi">Audi</Select.Option>
              <Select.Option value="Bentley">Bently</Select.Option>
              <Select.Option value="BMW">BMW</Select.Option>
              <Select.Option value="Bugatti">Bugatti</Select.Option>
              <Select.Option value="Ducati">Ducati</Select.Option>
              <Select.Option value="Ferrari">Ferrari</Select.Option>
              <Select.Option value="Mercedes-Benz">Mercedes-Benz</Select.Option>
              <Select.Option value="Ford">Ford</Select.Option>
              <Select.Option value="Porsche">Porsche</Select.Option>
              {/* Thêm các danh mục khác nếu cần */}
            </Select>
          </Form.Item>
          <Form.Item
            name="images"
            label="Hình ảnh (URL, cách nhau bằng dấu phẩy)"
            rules={[{ message: 'Vui lòng nhập URL hình ảnh hợp lệ' }]}
          >
            <Input placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProduct;