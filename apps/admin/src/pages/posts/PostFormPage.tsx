import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Post } from '../../lib/api';

export function PostFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isNew && id) {
      api.get<Post>(`/admin/posts/${id}`).then((r) => {
        form.setFieldsValue({
          ...r.data,
          body: JSON.stringify(r.data.body, null, 2),
          publishedAt: r.data.publishedAt ? dayjs(r.data.publishedAt) : null,
        });
      });
    }
  }, [id, isNew, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    const payload = {
      ...values,
      body: JSON.parse(String(values.body || '[]')),
      publishedAt: values.publishedAt
        ? (values.publishedAt as dayjs.Dayjs).toISOString()
        : null,
    };
    try {
      if (isNew) {
        await api.post('/admin/posts', payload);
        message.success('Created');
      } else {
        await api.patch(`/admin/posts/${id}`, payload);
        message.success('Saved');
      }
      navigate('/posts');
    } catch {
      message.error('Save failed — check JSON body format');
    }
  };

  return (
    <Card title={isNew ? 'New post' : 'Edit post'}>
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ locale: 'en', status: 'draft', readMinutes: 5, body: '[]' }}>
        <Space style={{ width: '100%' }} size="large" wrap>
          <Form.Item name="locale" label="Locale" rules={[{ required: true }]} style={{ minWidth: 120 }}>
            <Select options={[{ value: 'en' }, { value: 'zh' }]} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]} style={{ minWidth: 140 }}>
            <Select options={[{ value: 'draft' }, { value: 'published' }]} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]} style={{ minWidth: 160 }}>
            <Input />
          </Form.Item>
          <Form.Item name="readMinutes" label="Read minutes" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
        </Space>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="excerpt" label="Excerpt" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="body" label="Body (JSON array)" rules={[{ required: true }]}>
          <Input.TextArea rows={12} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item name="publishedAt" label="Published at">
          <DatePicker showTime />
        </Form.Item>
        <Form.Item name="seoTitle" label="SEO title">
          <Input />
        </Form.Item>
        <Form.Item name="seoDescription" label="SEO description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="ogImage" label="OG image URL">
          <Input />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={() => navigate('/posts')}>Cancel</Button>
        </Space>
      </Form>
    </Card>
  );
}
