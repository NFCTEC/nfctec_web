import { Button, Card, Form, Input, InputNumber, Select, Space, message } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Solution } from '../../lib/api';

const jsonField = (name: string, label: string) => (
  <Form.Item key={name} name={name} label={label} rules={[{ required: true }]}>
    <Input.TextArea rows={6} style={{ fontFamily: 'monospace' }} />
  </Form.Item>
);

export function SolutionFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isNew && id) {
      api.get<Solution>(`/admin/solutions/${id}`).then((r) => {
        const d = r.data;
        form.setFieldsValue({
          ...d,
          capabilities: JSON.stringify(d.capabilities, null, 2),
          deliverables: JSON.stringify(d.deliverables, null, 2),
          protocols: JSON.stringify(d.protocols, null, 2),
          certifications: JSON.stringify(d.certifications, null, 2),
          workflow: JSON.stringify(d.workflow, null, 2),
          resources: JSON.stringify(d.resources, null, 2),
        });
      });
    }
  }, [id, isNew, form]);

  const onFinish = async (values: Record<string, unknown>) => {
    const payload = {
      ...values,
      capabilities: JSON.parse(String(values.capabilities || '[]')),
      deliverables: JSON.parse(String(values.deliverables || '[]')),
      protocols: JSON.parse(String(values.protocols || '[]')),
      certifications: JSON.parse(String(values.certifications || '[]')),
      workflow: JSON.parse(String(values.workflow || '[]')),
      resources: JSON.parse(String(values.resources || '[]')),
    };
    try {
      if (isNew) await api.post('/admin/solutions', payload);
      else await api.patch(`/admin/solutions/${id}`, payload);
      message.success('Saved');
      navigate('/solutions');
    } catch {
      message.error('Save failed — check JSON fields');
    }
  };

  return (
    <Card title={isNew ? 'New solution' : 'Edit solution'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          locale: 'en',
          status: 'draft',
          icon: 'Boxes',
          sortOrder: 0,
          capabilities: '[]',
          deliverables: '[]',
          protocols: '[]',
          certifications: '[]',
          workflow: '[]',
          resources: '[]',
        }}
      >
        <Space wrap>
          <Form.Item name="locale" label="Locale" rules={[{ required: true }]}><Select style={{ width: 100 }} options={[{ value: 'en' }, { value: 'zh' }]} /></Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}><Select style={{ width: 120 }} options={[{ value: 'draft' }, { value: 'published' }]} /></Form.Item>
          <Form.Item name="sortOrder" label="Sort"><InputNumber min={0} /></Form.Item>
        </Space>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="tagline" label="Tagline" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="intro" label="Intro" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        <Form.Item name="icon" label="Icon (Lucide name)"><Input /></Form.Item>
        <Form.Item name="heroImage" label="Hero image path"><Input placeholder="/solutions/banking.jpg" /></Form.Item>
        {jsonField('capabilities', 'Capabilities JSON')}
        {jsonField('deliverables', 'Deliverables JSON')}
        {jsonField('protocols', 'Protocols JSON')}
        {jsonField('certifications', 'Certifications JSON')}
        {jsonField('workflow', 'Workflow JSON')}
        {jsonField('resources', 'Resources JSON')}
        <Form.Item name="seoTitle" label="SEO title"><Input /></Form.Item>
        <Form.Item name="seoDescription" label="SEO description"><Input.TextArea rows={2} /></Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">Save</Button>
          <Button onClick={() => navigate('/solutions')}>Cancel</Button>
        </Space>
      </Form>
    </Card>
  );
}
