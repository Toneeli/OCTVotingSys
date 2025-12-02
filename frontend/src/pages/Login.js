import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Space, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as authApi from '../api/auth';
import './Auth.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      login(response.resident, response.token);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <h1 className="auth-title">🗳️ 华侨城-智慧社区投票站</h1>
        <h2 className="auth-subtitle">业主登录</h2>

        <Spin spinning={loading}>
          <Form onFinish={onFinish} layout="vertical">
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
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
                登录
              </Button>
            </Form.Item>

            <Space className="auth-footer">
              <span>还没有账号？</span>
              <Link to="/register">立即注册</Link>
            </Space>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
