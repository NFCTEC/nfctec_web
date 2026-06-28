import { Select, Table, message } from 'antd';
import { useEffect, useState } from 'react';
import { api, type Inquiry } from '../../lib/api';

export function InquiriesPage() {
  const [data, setData] = useState<Inquiry[]>([]);
  const load = () => api.get<Inquiry[]>('/admin/inquiries').then((r) => setData(r.data));
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Inquiries</h2>
      <Table
        rowKey="id"
        dataSource={data}
        expandable={{ expandedRowRender: (r) => <pre style={{ whiteSpace: 'pre-wrap' }}>{r.message}</pre> }}
        columns={[
          { title: 'Date', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Subject', dataIndex: 'subject' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string, row) => (
              <Select
                value={status}
                style={{ width: 120 }}
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'read', label: 'Read' },
                  { value: 'archived', label: 'Archived' },
                ]}
                onChange={async (v) => {
                  await api.patch(`/admin/inquiries/${row.id}`, { status: v });
                  message.success('Updated');
                  load();
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
