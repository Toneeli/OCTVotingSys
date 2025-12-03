import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Radio, Space, message, Spin, Statistic, Row, Col, Empty, Progress, Table } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import * as votingApi from '../api/voting';
import './TopicDetail.css';

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [stats, setStats] = useState(null);
  const [voters, setVoters] = useState(null);
  const [loadingVoters, setLoadingVoters] = useState(false);

  useEffect(() => {
    loadTopic();
    loadStats();
    loadVoters();
  }, [id]);

  const loadTopic = async () => {
    try {
      const data = await votingApi.getTopic(id);
      setTopic(data);
    } catch (error) {
      message.error('加载议题失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await votingApi.getStats(id);
      setStats(data);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const loadVoters = async () => {
    setLoadingVoters(true);
    try {
      const data = await votingApi.getVoters(id);
      setVoters(data);
    } catch (error) {
      console.error('加载投票业主信息失败:', error);
    } finally {
      setLoadingVoters(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption) {
      message.warning('请选择投票选项');
      return;
    }

    // 检查是否在投票时间范围内
    const now = new Date();
    if (topic.start_date) {
      const startDate = new Date(topic.start_date);
      if (now < startDate) {
        message.warning('投票尚未开始');
        return;
      }
    }
    if (topic.end_date) {
      const endDate = new Date(topic.end_date);
      if (now > endDate) {
        message.warning('投票已结束');
        return;
      }
    }

    setSubmitting(true);
    try {
      await votingApi.submitVote({
        topic_id: parseInt(id),
        option_id: selectedOption,
      });
      message.success('投票成功！');
      setVoted(true);
      setSelectedOption(null);
      loadStats();
      loadVoters();
    } catch (error) {
      message.error(error.error || '投票失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getTotalVotes = () => {
    return stats?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  };

  const getOptionPercentage = (votes) => {
    const total = getTotalVotes();
    return total === 0 ? 0 : ((votes / total) * 100).toFixed(1);
  };

  // 检查投票是否可用
  const isVotingAvailable = () => {
    if (!topic) return false;
    const now = new Date();
    
    if (topic.start_date) {
      const startDate = new Date(topic.start_date);
      if (now < startDate) return false;
    }
    
    if (topic.end_date) {
      const endDate = new Date(topic.end_date);
      if (now > endDate) return false;
    }
    
    return true;
  };

  // 获取投票状态文本
  const getVotingStatusText = () => {
    if (!topic) return '';
    const now = new Date();
    
    if (topic.start_date) {
      const startDate = new Date(topic.start_date);
      if (now < startDate) {
        return `投票将在 ${startDate.toLocaleString('zh-CN')} 开始`;
      }
    }
    
    if (topic.end_date) {
      const endDate = new Date(topic.end_date);
      if (now > endDate) {
        return `投票已于 ${endDate.toLocaleString('zh-CN')} 结束`;
      }
    }
    
    return '投票进行中';
  };

  // 投票业主列表表格列
  const voterColumns = [
    {
      title: '业主姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      align: 'left',
    },
    {
      title: '楼栋',
      dataIndex: 'building',
      key: 'building',
      align: 'left',
    },
    {
      title: '单元号',
      dataIndex: 'unit_number',
      key: 'unit_number',
      align: 'left',
    },
  ];

  return (
    <div className="topic-detail-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        className="back-button"
      >
        返回列表
      </Button>

      <Spin spinning={loading}>
        {topic ? (
          <Card className="topic-detail-card">
            <h1 className="topic-title">{topic.title}</h1>
            <p className="topic-desc">{topic.description}</p>

            <div className="voting-section">
              <h3>投票选项</h3>
              
              {/* 显示日期信息 */}
              {(topic.start_date || topic.end_date) && (
                <Card style={{ marginBottom: '16px', backgroundColor: '#f0f5ff' }}>
                  {topic.start_date && (
                    <div>
                      <strong>开始时间：</strong> {new Date(topic.start_date).toLocaleString('zh-CN')}
                    </div>
                  )}
                  {topic.end_date && (
                    <div>
                      <strong>结束时间：</strong> {new Date(topic.end_date).toLocaleString('zh-CN')}
                    </div>
                  )}
                  <div style={{ marginTop: '8px', color: '#1890ff', fontWeight: 'bold' }}>
                    状态：{getVotingStatusText()}
                  </div>
                </Card>
              )}

              {voted ? (
                <div className="voted-message">
                  <CheckCircleOutlined className="success-icon" />
                  <p>您已成功投票！</p>
                </div>
              ) : (
                <>
                  <Radio.Group
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="options-group"
                    disabled={!isVotingAvailable()}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {topic.options?.map((option) => (
                        <div key={option.id} className="option-item">
                          <Radio value={option.id}>
                            <span>{option.option_text}</span>
                          </Radio>
                        </div>
                      ))}
                    </Space>
                  </Radio.Group>

                  <div className="vote-button">
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={handleVote}
                      loading={submitting}
                      disabled={!isVotingAvailable()}
                    >
                      {isVotingAvailable() ? '确认投票' : '投票不可用'}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {stats && (
              <div className="stats-section">
                <h3>投票统计</h3>

                <Row gutter={16} className="stats-cards">
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="总票数"
                      value={getTotalVotes()}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="选项数"
                      value={stats.options?.length || 0}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="投票状态"
                      value={voted ? '已投票' : '未投票'}
                      valueStyle={{ color: voted ? '#52c41a' : '#1890ff' }}
                    />
                  </Col>
                </Row>

                <div className="results-section">
                  <h4>选项得票情况</h4>
                  {stats.options && stats.options.length > 0 ? (
                    <div className="results-list">
                      {stats.options.map((option) => (
                        <div key={option.id} className="result-item">
                          <div className="result-header">
                            <span className="result-text">{option.option_text}</span>
                            <span className="result-votes">
                              {option.votes} 票 ({getOptionPercentage(option.votes)}%)
                            </span>
                          </div>
                          <Progress
                            percent={parseFloat(getOptionPercentage(option.votes))}
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无投票数据" />
                  )}
                </div>
              </div>
            )}

            {voters && (
              <div className="voters-section">
                <h3>已投票的业主 ({voters.voter_count})</h3>
                <Spin spinning={loadingVoters}>
                  {voters.voters && voters.voters.length > 0 ? (
                    <Table
                      columns={voterColumns}
                      dataSource={voters.voters.map((voter, index) => ({
                        ...voter,
                        key: voter.id || index,
                      }))}
                      pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50', '100'] }}
                      size="small"
                      style={{ marginTop: '16px' }}
                    />
                  ) : (
                    <Empty description="暂无投票业主" style={{ marginTop: '16px' }} />
                  )}
                </Spin>
              </div>
            )}
          </Card>
        ) : (
          <Empty description="议题不存在" />
        )}
      </Spin>
    </div>
  );
};

export default TopicDetail;
