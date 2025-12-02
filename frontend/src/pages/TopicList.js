import React, { useState, useEffect } from 'react';
import { List, Card, Button, Tag, Empty, Spin, Row, Col, Statistic } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as votingApi from '../api/voting';
import './TopicList.css';

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="topic-list-container">
      <div className="topic-list-header">
        <h2>📋 投票议题列表</h2>
      </div>

      <Spin spinning={loading}>
        {topics.length === 0 ? (
          <Empty description="暂无投票议题" />
        ) : (
          <List
            dataSource={topics}
            renderItem={(topic) => (
              <Card className="topic-card" key={topic.id}>
                <div className="topic-content">
                  <div className="topic-header">
                    <h3>{topic.title}</h3>
                    {getStatusTag(topic.status)}
                  </div>

                  <p className="topic-description">{topic.description}</p>

                  <div className="topic-options">
                    <h4>选项：</h4>
                    <ul>
                      {topic.options?.map((option) => (
                        <li key={option.id}>
                          <span className="option-text">{option.option_text}</span>
                          <span className="option-votes">{option.votes || 0} 票</span>
                        </li>
                      ))}
                    </ul>
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
                    <Link to={`/topic/${topic.id}`}>
                      <Button type="primary" icon={<ArrowRightOutlined />}>
                        投票详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          />
        )}
      </Spin>
    </div>
  );
};

export default TopicList;
