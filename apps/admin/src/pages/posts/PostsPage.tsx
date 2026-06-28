import { Button, Select, Space, Table, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Post } from '../../lib/api';

export function PostsPage() {
  const [data, setData] = useState<Post[]>([]);
  const [locale, setLocale] = useState<string | undefined>();

  const load = () => {
    api
      .get<Post[]>('/admin/posts', { params: { locale } })
      .then((r) => setData(r.data));
  };

  useEffect(() => {
    load();
  }, [locale]);

  const remove = async (id: string) => {
    await api.delete(`/admin/posts/${id}`);
    message.success('Deleted');
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Blog Posts</h2>
        <Space>
          <Select
            allowClear
            placeholder="Locale"
            style={{ width: 120 }}
            options={[
              { value: 'en', label: 'EN' },
              { value: 'zh', label: 'ZH' },
            ]}
            onChange={setLocale}
          />
          <Link to="/posts/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New post
            </Button>
          </Link>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Title', dataIndex: 'title' },
          { title: 'Slug', dataIndex: 'slug' },
          { title: 'Locale', dataIndex: 'locale', width: 80 },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={s === 'published' ? 'green' : 'default'}>{s}</Tag>
            ),
          },
          {
            title: 'Actions',
            render: (_, row) => (
              <Space>
                <Link to={`/posts/${row.id}`}>Edit</Link>
                <Popconfirm title="Delete this post?" onConfirm={() => remove(row.id)}>
                  <Button type="link" danger>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
