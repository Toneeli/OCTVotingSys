import React, { useState, useEffect, useContext } from 'react';
import { List, Card, Button, Tag, Empty, Spin, Row, Col, Statistic, Divider } from 'antd';
import { ArrowRightOutlined, LoginOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import * as votingApi from '../api/voting';
import './Home.css';

const Home = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await votingApi.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('加载议题失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: 'green', label: '进行中' },
      closed: { color: 'red', label: '已关闭' },
      pending: { color: 'blue', label: '待开始' },
    };
    const config = statusMap[status] || { color: 'default', label: status };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const getTotalVotes = (options) => {
    return options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  };

  // 获取投票状态
  const getVotingStatus = (topic) => {
    if (!topic.start_date && !topic.end_date) {
      return { status: 'active', label: '进行中', color: 'green' };
    }

    const now = new Date();
    const startDate = topic.start_date ? new Date(topic.start_date) : null;
    const endDate = topic.end_date ? new Date(topic.end_date) : null;

    if (startDate && now < startDate) {
      return { status: 'pending', label: '待开始', color: 'blue' };
    }

    if (endDate && now > endDate) {
      return { status: 'closed', label: '已关闭', color: 'red' };
    }

    return { status: 'active', label: '进行中', color: 'green' };
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleVoteClick = (topicId) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/topic/${topicId}`);
    }
  };

  // 统计数据
  const totalTopics = topics.length;
  const activeTopics = topics.filter(t => {
    const status = getVotingStatus(t);
    return status.status === 'active';
  }).length;
  const closedTopics = topics.filter(t => {
    const status = getVotingStatus(t);
    return status.status === 'closed';
  }).length;
  const pendingTopics = topics.filter(t => {
    const status = getVotingStatus(t);
    return status.status === 'pending';
  }).length;
  const totalVotes = topics.reduce((sum, topic) => sum + getTotalVotes(topic.options), 0);

  return (
    <div className="home-container">
      {/* 头部欢迎区域 */}
      <div className="home-hero">
        <div className="hero-content">
          <h1>🗳️ 华侨城-智慧社区投票站</h1>
          <p>参与社区决策，让您的声音被听见</p>
          {!user && (
            <div className="hero-actions">
              <Button 
                type="primary" 
                size="large" 
                icon={<LoginOutlined />}
                onClick={() => navigate('/login')}
              >
                登录投票
              </Button>
              <Button 
                size="large"
                onClick={() => navigate('/register')}
              >
                注册账户
              </Button>
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* 统计概览 */}
      <div className="statistics-section">
        <h2>📊 投票统计</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="总议题数"
                value={totalTopics}
                suffix="个"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="进行中"
                value={activeTopics}
                suffix="个"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="待开始"
                value={pendingTopics}
                suffix="个"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="已关闭"
                value={closedTopics}
                suffix="个"
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="总投票数"
                value={totalVotes}
                suffix="票"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* 议题列表 */}
      <div className="topics-section">
        <h2>📋 投票议题</h2>
        <Spin spinning={loading}>
          {topics.length === 0 ? (
            <Empty description="暂无投票议题" />
          ) : (
            <List
              dataSource={topics}
              renderItem={(topic) => {
                const votingStatus = getVotingStatus(topic);
                return (
                <Card className="topic-card" key={topic.id}>
                  <div className="topic-content">
                    <div className="topic-header">
                      <h3>{topic.title}</h3>
                      <Tag color={votingStatus.color}>{votingStatus.label}</Tag>
                    </div>

                    <p className="topic-description">{topic.description}</p>

                    {/* 投票时间段 */}
                    {(topic.start_date || topic.end_date) && (
                      <div className="topic-date-info">
                        <span className="date-label">投票时间：</span>
                        <span className="date-text">
                          {formatDate(topic.start_date)} ~ {formatDate(topic.end_date)}
                        </span>
                      </div>
                    )}

                    <div className="topic-options">
                      <h4>选项及投票情况：</h4>
                      <div className="options-container">
                        {topic.options?.map((option) => {
                          const totalVote = getTotalVotes(topic.options);
                          const percentage = totalVote > 0 ? ((option.votes || 0) / totalVote * 100).toFixed(1) : 0;
                          return (
                            <div key={option.id} className="option-item">
                              <div className="option-header">
                                <span className="option-text">{option.option_text}</span>
                                <span className="option-votes">{option.votes || 0} 票</span>
                              </div>
                              <div className="option-bar">
                                <div 
                                  className="option-bar-fill" 
                                  style={{ width: `${percentage}%` }}
                                />
                                <span className="option-percentage">{percentage}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Row gutter={16} className="topic-stats">
                      <Col span={12}>
                        <Statistic
                          title="总票数"
                          value={getTotalVotes(topic.options)}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="选项数"
                          value={topic.options?.length || 0}
                        />
                      </Col>
                    </Row>

                    <div className="topic-actions">
                      <Button 
                        type="primary" 
                        icon={<ArrowRightOutlined />}
                        onClick={() => handleVoteClick(topic.id)}
                      >
                        {user ? '投票详情' : '登录投票'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
              }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default Home;
