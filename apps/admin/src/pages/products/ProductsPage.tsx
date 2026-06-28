import { Button, Popconfirm, Space, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Product } from '../../lib/api';

export function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const load = () => api.get<Product[]>('/admin/products').then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Products</h2>
        <Link to="/products/new"><Button type="primary" icon={<PlusOutlined />}>New</Button></Link>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Category', dataIndex: 'category' },
          { title: 'Locale', dataIndex: 'locale', width: 80 },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag> },
          {
            title: 'Actions',
            render: (_, row) => (
              <Space>
                <Link to={`/products/${row.id}`}>Edit</Link>
                <Popconfirm title="Delete?" onConfirm={async () => { await api.delete(`/admin/products/${row.id}`); message.success('Deleted'); load(); }}>
                  <Button type="link" danger>Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
