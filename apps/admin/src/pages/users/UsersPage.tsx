import { Button, Form, Input, Modal, Select, Table, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { api, type AdminUser } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function UsersPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const load = () => api.get<AdminUser[]>('/admin/users').then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, []);

  if (user?.role !== 'super_admin') {
    return <p>Only super admins can manage users.</p>;
  }

  const create = async (values: Record<string, string>) => {
    await api.post('/admin/users', values);
    message.success('User created');
    setOpen(false);
    form.resetFields();
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Admin users</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>New user</Button>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Email', dataIndex: 'email' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Role', dataIndex: 'role', render: (r: string) => <Tag>{r}</Tag> },
        ]}
      />
      <Modal title="New admin user" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={create} initialValues={{ role: 'editor' }}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="name" label="Name"><Input /></Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>
          <Form.Item name="role" label="Role"><Select options={[{ value: 'editor' }, { value: 'super_admin' }]} /></Form.Item>
          <Button type="primary" htmlType="submit" block>Create</Button>
        </Form>
      </Modal>
    </div>
  );
}
