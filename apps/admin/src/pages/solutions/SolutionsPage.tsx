import { Button, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Solution } from '../../lib/api';

export function SolutionsPage() {
  const [data, setData] = useState<Solution[]>([]);
  const [locale, setLocale] = useState<string | undefined>();

  const load = () => api.get<Solution[]>('/admin/solutions', { params: { locale } }).then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, [locale]);

  const remove = async (id: string) => {
    await api.delete(`/admin/solutions/${id}`);
    message.success('Deleted');
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Solutions</h2>
        <Space>
          <Select allowClear placeholder="Locale" style={{ width: 120 }} options={[{ value: 'en' }, { value: 'zh' }]} onChange={setLocale} />
          <Link to="/solutions/new"><Button type="primary" icon={<PlusOutlined />}>New</Button></Link>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: 'Locale', dataIndex: 'locale', width: 80 },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag> },
          {
            title: 'Actions',
            render: (_, row) => (
              <Space>
                <Link to={`/solutions/${row.id}`}>Edit</Link>
                <Popconfirm title="Delete?" onConfirm={() => remove(row.id)}><Button type="link" danger>Delete</Button></Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
