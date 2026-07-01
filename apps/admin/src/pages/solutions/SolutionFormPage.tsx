import { Button, Card, Form, Input, InputNumber, Select, Space, message } from 'antd';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PairListField,
  ResourceListField,
  StringListField,
  normalizePairs,
  normalizeResources,
  normalizeStringList,
} from '../../components/form/ListFields';
import { api, type Solution } from '../../lib/api';
import { getApiErrorMessage } from '../../lib/errors';

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
          capabilities: normalizePairs(d.capabilities),
          deliverables: normalizeStringList(d.deliverables),
          protocols: normalizeStringList(d.protocols),
          certifications: normalizeStringList(d.certifications),
          workflow: normalizePairs(d.workflow),
          resources: normalizeResources(d.resources),
        });
      });
    }
  }, [id, isNew, form]);

  const filterStrings = (v: unknown) =>
    Array.isArray(v) ? (v as string[]).map((s) => s.trim()).filter(Boolean) : [];

  const onFinish = async (values: Record<string, unknown>) => {
    const payload = {
      locale: values.locale,
      status: values.status,
      sortOrder: values.sortOrder,
      slug: values.slug,
      name: values.name,
      tagline: values.tagline,
      intro: values.intro,
      icon: values.icon,
      heroImage: values.heroImage,
      capabilities: values.capabilities,
      deliverables: filterStrings(values.deliverables),
      protocols: filterStrings(values.protocols),
      certifications: filterStrings(values.certifications),
      workflow: values.workflow,
      resources: values.resources,
      seoTitle: values.seoTitle,
      seoDescription: values.seoDescription,
    };

    try {
      if (isNew) await api.post('/admin/solutions', payload);
      else await api.patch(`/admin/solutions/${id}`, payload);
      message.success('Saved');
      navigate('/solutions');
    } catch (err: unknown) {
      message.error(getApiErrorMessage(err, 'Save failed — check required fields'));
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
          capabilities: [{ title: '', description: '' }],
          deliverables: [''],
          protocols: [''],
          certifications: [''],
          workflow: [{ title: '', description: '' }],
          resources: [{ title: '', kind: '' }],
        }}
      >
        <Space wrap>
          <Form.Item name="locale" label="Locale" rules={[{ required: true }]}>
            <Select style={{ width: 100 }} options={[{ value: 'en' }, { value: 'zh' }]} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select style={{ width: 120 }} options={[{ value: 'draft' }, { value: 'published' }]} />
          </Form.Item>
          <Form.Item name="sortOrder" label="Sort">
            <InputNumber min={0} />
          </Form.Item>
        </Space>
        <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="tagline" label="Tagline" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="intro" label="Intro" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="icon" label="Icon (Lucide name)">
          <Input placeholder="Wallet, Train, Boxes…" />
        </Form.Item>
        <Form.Item name="heroImage" label="Hero image path">
          <Input placeholder="/solutions/banking.jpg" />
        </Form.Item>

        <PairListField name="capabilities" label="Capabilities" />
        <StringListField name="deliverables" label="Deliverables" placeholder="Deliverable item" />
        <StringListField name="protocols" label="Protocols" placeholder="e.g. ISO 14443 A/B" />
        <StringListField name="certifications" label="Certifications" placeholder="e.g. EMV L1" />
        <PairListField name="workflow" label="Workflow steps" titleLabel="Step title" descLabel="Step description" />
        <ResourceListField name="resources" label="Resources" />

        <Form.Item name="seoTitle" label="SEO title">
          <Input />
        </Form.Item>
        <Form.Item name="seoDescription" label="SEO description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
          <Button onClick={() => navigate('/solutions')}>Cancel</Button>
        </Space>
      </Form>
    </Card>
  );
}
