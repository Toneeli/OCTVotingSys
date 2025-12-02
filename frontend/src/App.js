import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TopicList from './pages/TopicList';
import TopicDetail from './pages/TopicDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>加载中...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* 公开首页 - 无需登录 */}
        <Route 
          path="/" 
          element={
            <Layout>
              <Home />
            </Layout>
          } 
        />
        
        {/* 登录和注册页面 */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 投票列表 - 需要登录 */}
        <Route
          path="/topics"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicList />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* 投票详情 - 需要登录 */}
        <Route
          path="/topic/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TopicDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* 管理后台 - 需要登录 */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 个人中心 - 需要登录 */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
