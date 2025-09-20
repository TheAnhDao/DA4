// import React, { useState, useEffect } from 'react';
// import { Card, Row, Col, Spin, Alert } from 'antd';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import api from '../../config/axios';
// import { useAuth } from '../../context/AuthContext';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const AdminDashboard: React.FC = () => {
//   const [stats, setStats] = useState({ totalUsers: 0, totalProductsSold: 0, totalRevenue: 0 });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { token } = useAuth();

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoading(true);
//       try {
//         if (!token) {
//           setError('Bạn cần đăng nhập để xem thống kê.');
//           setLoading(false);
//           return;
//         }

//         const config = { headers: { Authorization: `Bearer ${token}` } };
//         const response = await api.get('/api/v1/admin/dashboard', config);
//         console.log('Dashboard stats response:', response.data); // Debug response
//         setStats({
//           totalUsers: response.data.stats.totalUsers || 0,
//           totalProductsSold: response.data.stats.totalProductsSold || 0,
//           totalRevenue: response.data.stats.totalRevenue || 0,
//         });
//       } catch (err: any) {
//         setError(err.response?.data?.error || 'Lỗi khi lấy thống kê');
//         console.error('Dashboard fetch error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchStats();
//   }, [token]);

//   const barData = {
//     labels: ['Tổng người dùng', 'Sản phẩm đã bán', 'Doanh thu'],
//     datasets: [
//       {
//         label: 'Số lượng/Doanh thu (VNĐ)',
//         data: [stats.totalUsers, stats.totalProductsSold, stats.totalRevenue],
//         backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)'],
//         borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)'],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'top' as const },
//       title: { display: true, text: 'Thống kê tổng quan' },
//       tooltip: {
//         callbacks: {
//           label: (context: any) => {
//             if (context.dataset.label === 'Số lượng/Doanh thu (VNĐ)' && context.dataIndex === 2) {
//               return `${context.label}: ${context.raw.toLocaleString()} VNĐ`;
//             }
//             return `${context.label}: ${context.raw}`;
//           },
//         },
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           callback: function (tickValue: string | number) {
//             if (typeof tickValue === 'number') {
//               return tickValue.toLocaleString();
//             }
//             return tickValue;
//           },
//         },
//       },
//     },
//   };

//   return (
//     <div>
//       <h2>Thống kê</h2>
//       <Spin spinning={loading} tip="Đang tải...">
//         {error ? (
//           <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
//         ) : (
//           <Row gutter={16}>
//             <Col span={8}>
//               <Card title="Tổng người dùng" bordered={false}>
//                 <h3>{stats.totalUsers}</h3>
//               </Card>
//             </Col>
//             <Col span={8}>
//               <Card title="Tổng sản phẩm đã bán" bordered={false}>
//                 <h3>{stats.totalProductsSold}</h3>
//               </Card>
//             </Col>
//             <Col span={8}>
//               <Card title="Tổng doanh thu (VNĐ)" bordered={false}>
//                 <h3>{stats.totalRevenue.toLocaleString()}</h3>
//               </Card>
//             </Col>
//             <Col span={24} style={{ marginTop: 16 }}>
//               <Card title="Biểu đồ thống kê" bordered={false}>
//                 <Bar data={barData} options={options} />
//               </Card>
//             </Col>
//           </Row>
//         )}
//       </Spin>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../config/axios';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface DailyRevenue {
  date: string;
  revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalProductsSold: 0, totalRevenue: 0 });
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        if (!token) {
          setError('Bạn cần đăng nhập để xem thống kê.');
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [dashboardRes, dailyRes] = await Promise.all([
          api.get('/api/v1/admin/dashboard', config),
          api.get('/api/v1/admin/dashboard/daily-revenue', config),
        ]);

        setStats({
          totalUsers: dashboardRes.data.stats.totalUsers || 0,
          totalProductsSold: dashboardRes.data.stats.totalProductsSold || 0,
          totalRevenue: dashboardRes.data.stats.totalRevenue || 0,
        });
        setDailyRevenue(dailyRes.data.stats || []);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Lỗi khi lấy thống kê');
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const lineData = {
    labels: dailyRevenue.map((item) => item.date),
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        data: dailyRevenue.map((item) => item.revenue),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Doanh thu theo ngày' },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw.toLocaleString()} VNĐ`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (tickValue: string | number) {
            if (typeof tickValue === 'number') {
              return tickValue.toLocaleString() + ' VNĐ';
            }
            return tickValue;
          },
        },
      },
    },
  };

  return (
    <div>
      <h2>Thống kê</h2>
      <Spin spinning={loading} tip="Đang tải...">
        {error ? (
          <Alert message="Lỗi" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
        ) : (
          <Row gutter={16}>
            <Col span={8}>
              <Card title="Tổng người dùng" bordered={false}>
                <h3>{stats.totalUsers}</h3>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Tổng sản phẩm đã bán" bordered={false}>
                <h3>{stats.totalProductsSold}</h3>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Tổng doanh thu (VNĐ)" bordered={false}>
                <h3>{stats.totalRevenue.toLocaleString()}</h3>
              </Card>
            </Col>
            <Col span={24} style={{ marginTop: 16 }}>
              <Card title="Biểu đồ doanh thu theo ngày" bordered={false}>
                {dailyRevenue.length === 0 ? (
                  <Alert message="Thông báo" description="Không có dữ liệu doanh thu theo ngày" type="info" showIcon />
                ) : (
                  <Line data={lineData} options={options} />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default AdminDashboard;