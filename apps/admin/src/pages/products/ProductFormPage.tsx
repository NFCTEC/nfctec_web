import { Button, Card, Form, Input, InputNumber, Select, Space, message } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Product } from '../../lib/api';

export function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isNew && id) api.get<Product>(`/admin/products/${id}`).then((r) => form.setFieldsValue(r.data));
  }, [id, isNew, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    if (isNew) await api.post('/admin/products', values);
    else await api.patch(`/admin/products/${id}`, values);
    message.success('Saved');
    navigate('/products');
  };

  return (
    <Card title={isNew ? 'New product' : 'Edit product'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ locale: 'en', status: 'draft', category: 'software', sortOrder: 0 }}>
        <Form.Item name="locale" label="Locale" rules={[{ required: true }]}><Select options={[{ value: 'en' }, { value: 'zh' }]} /></Form.Item>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}><Select options={[{ value: 'software' }, { value: 'hardware' }]} /></Form.Item>
        <Form.Item name="linkPath" label="Link path"><Input placeholder="/products/nfc-field-detector" /></Form.Item>
        <Form.Item name="sortOrder" label="Sort order"><InputNumber min={0} /></Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}><Select options={[{ value: 'draft' }, { value: 'published' }]} /></Form.Item>
        <Space><Button type="primary" htmlType="submit">Save</Button><Button onClick={() => navigate('/products')}>Cancel</Button></Space>
      </Form>
    </Card>
  );
}
