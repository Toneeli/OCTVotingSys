import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import './Auth.css';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.register(values);
      message.success(response.message);
      navigate('/login');
    } catch (error) {
      message.error(error.error || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <h1 className="auth-title">🗳️ 华侨城-智慧社区投票站</h1>
        <h2 className="auth-subtitle">业主注册</h2>

        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="real_name"
              rules={[{ required: true, message: '请输入真实姓名' }]}
            >
              <Input placeholder="真实姓名" size="large" />
            </Form.Item>

            <Form.Item
              name="building"
              rules={[{ required: true, message: '请输入楼栋信息' }]}
            >
              <Input
                placeholder="楼栋 (如：T1栋、T2栋、1栋、2栋等)"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="unit_number"
              rules={[{ required: true, message: '请输入单元号' }]}
            >
              <Input
                prefix={<HomeOutlined />}
                placeholder="单元号 (如：1-101)"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[{ required: true, message: '请输入电话号码' }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="电话号码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                block
                size="large"
                htmlType="submit"
                loading={loading}
              >
                注册
              </Button>
            </Form.Item>

            <Space className="auth-footer">
              <span>已有账号？</span>
              <Link to="/login">立即登录</Link>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Register;
