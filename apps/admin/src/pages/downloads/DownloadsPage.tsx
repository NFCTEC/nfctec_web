import { Button, Card, Collapse, Form, Input, InputNumber, Select, Space, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { api, type DownloadGroup } from '../../lib/api';

export function DownloadsPage() {
  const [groups, setGroups] = useState<DownloadGroup[]>([]);
  const [groupForm] = Form.useForm();
  const [itemForm] = Form.useForm();

  const load = () => api.get<DownloadGroup[]>('/admin/downloads/groups').then((r) => setGroups(r.data));
  useEffect(() => {
    load();
  }, []);

  const createGroup = async (values: { locale: string; name: string; sortOrder?: number }) => {
    await api.post('/admin/downloads/groups', values);
    groupForm.resetFields();
    message.success('Group created');
    load();
  };

  const createItem = async (values: Record<string, unknown>) => {
    await api.post('/admin/downloads/items', values);
    itemForm.resetFields();
    message.success('Item created');
    load();
  };

  return (
    <div>
      <h2>Downloads</h2>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="New group" size="small">
          <Form form={groupForm} layout="inline" onFinish={createGroup} initialValues={{ locale: 'en', sortOrder: 0 }}>
            <Form.Item name="locale" rules={[{ required: true }]}><Select style={{ width: 90 }} options={[{ value: 'en' }, { value: 'zh' }]} /></Form.Item>
            <Form.Item name="name" rules={[{ required: true }]}><Input placeholder="Group name" /></Form.Item>
            <Form.Item name="sortOrder"><InputNumber min={0} /></Form.Item>
            <Button type="primary" htmlType="submit">Add group</Button>
          </Form>
        </Card>
        <Card title="New item" size="small">
          <Form form={itemForm} layout="vertical" onFinish={createItem} initialValues={{ status: 'published', sortOrder: 0 }}>
            <Form.Item name="groupId" label="Group" rules={[{ required: true }]}>
              <Select options={groups.map((g) => ({ value: g.id, label: `${g.locale} — ${g.name}` }))} />
            </Form.Item>
            <Space wrap>
              <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
              <Form.Item name="version" label="Version"><Input /></Form.Item>
              <Form.Item name="fileSize" label="Size"><Input /></Form.Item>
              <Form.Item name="fileUrl" label="File URL"><Input style={{ width: 280 }} /></Form.Item>
              <Form.Item name="status" label="Status"><Select options={[{ value: 'draft' }, { value: 'published' }]} /></Form.Item>
            </Space>
            <Button type="primary" htmlType="submit">Add item</Button>
          </Form>
        </Card>
        <Collapse
          items={groups.map((g) => ({
            key: g.id,
            label: `${g.locale.toUpperCase()} — ${g.name}`,
            children: (
              <Table
                rowKey="id"
                pagination={false}
                dataSource={g.items}
                columns={[
                  { title: 'Name', dataIndex: 'name' },
                  { title: 'Version', dataIndex: 'version' },
                  { title: 'URL', dataIndex: 'fileUrl', ellipsis: true },
                  { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
                  {
                    title: '',
                    render: (_, row) => (
                      <Button type="link" danger onClick={async () => { await api.delete(`/admin/downloads/items/${row.id}`); load(); }}>Delete</Button>
                    ),
                  },
                ]}
              />
            ),
          }))}
        />
      </Space>
    </div>
  );
}
