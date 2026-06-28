import { Button, Card, Form, Input, Select, Space, message } from 'antd';
import { useState } from 'react';
import { api } from '../../lib/api';

export function SettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { key: string; locale?: string; value: string }) => {
    setLoading(true);
    try {
      await api.put('/admin/site-settings', {
        key: values.key,
        locale: values.locale || null,
        value: JSON.parse(values.value),
      });
      message.success('Saved');
    } catch {
      message.error('Invalid JSON value');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Site settings">
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ key: 'organization', value: '{\n  "name": "NFCTEC"\n}' }}>
        <Form.Item name="key" label="Key" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="locale" label="Locale (optional)">
          <Select allowClear options={[{ value: 'en' }, { value: 'zh' }]} />
        </Form.Item>
        <Form.Item name="value" label="Value (JSON)" rules={[{ required: true }]}>
          <Input.TextArea rows={10} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
        </Space>
      </Form>
    </Card>
  );
}
