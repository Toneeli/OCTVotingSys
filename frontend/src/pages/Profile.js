import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Toast, Tabs, SpinLoading } from 'antd-mobile';
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
      Toast.show({
        content: '两次输入的密码不一致',
        position: 'top',
      });
      return;
    }

    setChangePasswordLoading(true);
    try {
      await authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
      Toast.show({
        content: '密码已成功修改',
        position: 'top',
      });
      changePasswordForm.resetFields();
    } catch (error) {
      Toast.show({
        content: error.error || '修改密码失败',
        position: 'top',
      });
    } finally {
      setChangePasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px' 
      }}>
        <SpinLoading size='large' />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '20px' }}>
      <Tabs>
        <Tabs.Tab title='个人信息' key='profile'>
          <div style={{ padding: '16px' }}>
            <div style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px solid #eee',
              }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>用户名</span>
                <span style={{ color: '#666' }}>{user?.username}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: 'bold', color: '#333' }}>真实姓名</span>
                <span style={{ color: '#666' }}>{user?.real_name}</span>
              </div>
            </div>
          </div>
        </Tabs.Tab>

        <Tabs.Tab title='修改密码' key='password'>
          <div style={{ padding: '16px' }}>
            <Form
              form={changePasswordForm}
              onFinish={onChangePasswordFinish}
              layout='vertical'
              mode='card'
              footer={
                <Button
                  block
                  type='submit'
                  color='primary'
                  size='large'
                  loading={changePasswordLoading}
                  style={{ marginTop: '20px' }}
                >
                  确认修改
                </Button>
              }
            >
              <Form.Item
                name='old_password'
                label='旧密码'
                rules={[{ required: true, message: '请输入旧密码' }]}
              >
                <Input
                  placeholder='请输入旧密码'
                  type='password'
                  clearable
                />
              </Form.Item>

              <Form.Item
                name='new_password'
                label='新密码'
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input
                  placeholder='请输入新密码（至少6个字符）'
                  type='password'
                  clearable
                />
              </Form.Item>

              <Form.Item
                name='confirm_password'
                label='确认新密码'
                rules={[
                  { required: true, message: '请确认新密码' },
                ]}
              >
                <Input
                  placeholder='请再次输入新密码'
                  type='password'
                  clearable
                />
              </Form.Item>
            </Form>
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default Profile;
