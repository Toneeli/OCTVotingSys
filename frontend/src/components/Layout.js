import React, { useContext, useState } from 'react';
import { NavBar, TabBar, Popup, Button } from 'antd-mobile';
import { UserOutlined, HomeOutlined, FileTextOutlined, SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [popupVisible, setPopupVisible] = useState(false);

  const handleLogout = () => {
    logout();
    setPopupVisible(false);
    navigate('/login');
  };

  const handleNavClick = (key) => {
    navigate(key);
  };

  // 导航菜单项
  const navItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
  ];

  if (user) {
    navItems.push({
      key: '/topics',
      icon: <FileTextOutlined />,
      label: '投票',
    });

    // 如果是超级管理员或楼栋管理员，显示管理后台
    if (user.username === 'admin' || user.is_building_admin === 1) {
      navItems.push({
        key: '/admin',
        icon: <SettingOutlined />,
        label: '管理',
      });
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      paddingBottom: user ? '60px' : '0'
    }}>
      {/* 顶部导航栏 */}
      <NavBar
        back={null}
        right={
          user && (
            <UserOutlined
              style={{ fontSize: '20px', cursor: 'pointer' }}
              onClick={() => setPopupVisible(true)}
            />
          )
        }
        style={{
          backgroundColor: '#001529',
          color: '#fff',
          paddingTop: 'env(safe-area-inset-top)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        华侨城投票站
      </NavBar>

      {/* 用户菜单弹窗 */}
      {user && (
        <Popup
          visible={popupVisible}
          onMaskClick={() => setPopupVisible(false)}
          onClose={() => setPopupVisible(false)}
          position='bottom'
          bodyStyle={{ 
            padding: '16px',
            backgroundColor: '#fff',
            borderRadius: '8px 8px 0 0',
            minHeight: '120px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button 
              block 
              color='primary'
              size='large'
              onClick={() => {
                navigate('/profile');
                setPopupVisible(false);
              }}
            >
              个人中心
            </Button>
            <Button 
              block 
              color='danger'
              size='large'
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>
        </Popup>
      )}

      {/* 主内容区域 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>

      {/* 底部导航栏（仅在登录时显示） */}
      {user && (
        <TabBar
          activeKey={location.pathname}
          onChange={handleNavClick}
          safeArea
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {navItems.map((item) => (
            <TabBar.Item
              key={item.key}
              icon={item.icon}
              title={item.label}
            />
          ))}
        </TabBar>
      )}
    </div>
  );
};

export default Layout;
