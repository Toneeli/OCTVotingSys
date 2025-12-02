import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Tabs, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordForm] = Form.useForm();

  useEffect(() => {
    const currentUser = authApi.getProfile();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const onChangePasswordFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }

    setChangePasswordLoading(true);
    try {
      await authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      message.success('密码已成功修改');
      changePasswordForm.resetFields();
    } catch (error) {
      message.error(error.error || '修改密码失败');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const items = [
    {
      key: '1',
      label: '个人信息',
      children: (
        <Card>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">用户名：</span>
              <span className="info-value">{user?.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">真实姓名：</span>
              <span className="info-value">{user?.real_name}</span>
            </div>
          </div>
        </Card>
      ),
    },
    {
      key: '2',
      label: '修改密码',
      children: (
        <Card title="修改密码">
          <Form
            form={changePasswordForm}
            onFinish={onChangePasswordFinish}
            layout="vertical"
            style={{ maxWidth: '400px' }}
          >
            <Form.Item
              name="old_password"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password placeholder="请输入旧密码" />
            </Form.Item>

            <Form.Item
              name="new_password"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入新密码（至少6个字符）" />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={changePasswordLoading}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  if (loading) {
    return <Spin />;
  }

  return (
    <div className="profile-container">
      <Card title="个人中心">
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default Profile;
