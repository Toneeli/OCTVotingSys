import React, { useContext } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 只在用户登录时显示菜单项
  const menuItems = [];
  if (user) {
    menuItems.push({
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    });
    menuItems.push({
      key: '/topics',
      icon: <HomeOutlined />,
      label: '投票列表',
    });

    // 如果是超级管理员或楼栋管理员，显示管理后台
    if (user.username === 'admin' || user.is_building_admin === 1) {
      menuItems.push({
        key: '/admin',
        icon: <SettingOutlined />,
        label: '管理后台',
      });
    }

  }

  // 处理菜单点击事件
  const handleMenuClick = (e) => {
    console.log('菜单点击:', e.key);
    navigate(e.key);
  };

  // 用户下拉菜单项
  const userMenuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/profile')
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 50px',
        backgroundColor: '#001529'
      }}>
        {/* 菜单左对齐显示 */}
        {menuItems.length > 0 && (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ 
              flex: 0,
              border: 'none',
              backgroundColor: 'transparent'
            }}
          />
        )}

        {/* 用户信息和下拉菜单（仅在登录时显示） */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', gap: '12px' }}>
            <span style={{ color: '#fff' }}>
              {user.real_name || user.username}
            </span>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
            >
              <Avatar 
                style={{ backgroundColor: '#87d068', cursor: 'pointer' }} 
                icon={<UserOutlined />} 
              />
            </Dropdown>
          </div>
        )}
      </Header>

      <Content style={{ minHeight: 'calc(100vh - 128px)' }}>
        {children}
      </Content>

      <Footer style={{ 
        textAlign: 'center',
        backgroundColor: '#f0f2f5',
        color: '#666'
      }}>
        © {new Date().getFullYear()} 华侨城-智慧社区投票站
      </Footer>
    </AntLayout>
  );
};

export default Layout;
