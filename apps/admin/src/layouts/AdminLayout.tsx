import { Layout, Menu, Typography, Button, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  PictureOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const items = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
  { key: '/posts', icon: <FileTextOutlined />, label: <Link to="/posts">Blog Posts</Link> },
  { key: '/solutions', icon: <AppstoreOutlined />, label: <Link to="/solutions">Solutions</Link> },
  { key: '/products', icon: <ShoppingOutlined />, label: <Link to="/products">Products</Link> },
  { key: '/downloads', icon: <DownloadOutlined />, label: <Link to="/downloads">Downloads</Link> },
  { key: '/media', icon: <PictureOutlined />, label: <Link to="/media">Media</Link> },
  { key: '/inquiries', icon: <MailOutlined />, label: <Link to="/inquiries">Inquiries</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Site Settings</Link> },
  { key: '/users', icon: <UserOutlined />, label: <Link to="/users">Admin Users</Link> },
];

export function AdminLayout() {
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const selected = items.find((i) =>
    i.key === '/' ? location.pathname === '/' : location.pathname.startsWith(i.key),
  )?.key ?? '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={64} theme="dark">
        <div style={{ padding: '16px 20px' }}>
          <Typography.Title level={5} style={{ color: '#fff', margin: 0 }}>
            NFCTEC Admin
          </Typography.Title>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={items} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text type="secondary">Content Management</Typography.Text>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Typography.Text>{user?.email}</Typography.Text>
            <Button
              icon={<LogoutOutlined />}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
