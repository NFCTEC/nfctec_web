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
import { RichTextEditor } from '../../components/RichTextEditor';
import { bodyToHtml } from '../../lib/postBody';
import { api, type Post } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/errors';

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
          bodyHtml: bodyToHtml(r.data.body),
          publishedAt: r.data.publishedAt ? dayjs(r.data.publishedAt) : null,
        });
      });
    }
  }, [id, isNew, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    const html = String(values.bodyHtml ?? '').trim();
    if (!html || html === '<p></p>') {
      message.error('Please write the article body');
      return;
    }

    const payload = {
      locale: values.locale,
      status: values.status,
      category: values.category,
      readMinutes: values.readMinutes,
      slug: values.slug,
      title: values.title,
      excerpt: values.excerpt,
      body: html,
      publishedAt: values.publishedAt
        ? (values.publishedAt as dayjs.Dayjs).toISOString()
        : null,
      seoTitle: values.seoTitle || undefined,
      seoDescription: values.seoDescription || undefined,
      ogImage: values.ogImage || undefined,
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
    } catch (err: unknown) {
      message.error(
        getApiErrorMessage(err, 'Save failed — check required fields and slug uniqueness'),
      );
    }
  };

  return (
    <Card title={isNew ? 'New post' : 'Edit post'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ locale: 'en', status: 'draft', readMinutes: 5, bodyHtml: '<p></p>' }}
      >
        <Space style={{ width: '100%' }} size="large" wrap>
          <Form.Item name="locale" label="Locale" rules={[{ required: true }]} style={{ minWidth: 120 }}>
            <Select options={[{ value: 'en' }, { value: 'zh' }]} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]} style={{ minWidth: 140 }}>
            <Select options={[{ value: 'draft' }, { value: 'published' }]} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]} style={{ minWidth: 160 }}>
            <Input placeholder="e.g. Security, EMV, Hardware" />
          </Form.Item>
          <Form.Item name="readMinutes" label="Read minutes" rules={[{ required: true }]}>
            <InputNumber min={1} />
          </Form.Item>
        </Space>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]} extra="URL path, e.g. ntag424-dna-issuance-checklist">
          <Input />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="excerpt" label="Excerpt" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item
          name="bodyHtml"
          label="Body"
          rules={[{ required: true }]}
          extra="Rich text — headings, lists and bold appear on the website as you see them here."
        >
          <RichTextEditor placeholder="Write your article…" />
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
          <Input placeholder="https://www.nfctec.com/og-default.jpg" />
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
