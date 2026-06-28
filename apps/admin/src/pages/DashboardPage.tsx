import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Stats = {
  posts: number;
  solutions: number;
  products: number;
  newInquiries: number;
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/admin/dashboard/stats').then((r) => setStats(r.data));
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Published posts" value={stats?.posts ?? '—'} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Published solutions" value={stats?.solutions ?? '—'} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="Published products" value={stats?.products ?? '—'} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="New inquiries" value={stats?.newInquiries ?? '—'} /></Card>
        </Col>
      </Row>
    </div>
  );
}
