import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  DollarOutlined,
  ShopOutlined 
} from '@ant-design/icons';

const Home: React.FC = () => {
  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日订单数"
              value={11}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={93}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#234FEA' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={56}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#87D068' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总营业额"
              value={9280}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#CF1322' }}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '20px' }}>
        <Col span={12}>
          <Card title="最近订单">
            {/* 这里可以添加订单列表组件 */}
            <p>最近暂无订单</p>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="热门商品">
            {/* 这里可以添加热门商品组件 */}
            <p>暂无热门商品数据</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
