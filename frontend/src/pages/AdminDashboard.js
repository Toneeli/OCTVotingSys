import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, message, Tabs, Spin, Select, Upload, Alert, Statistic, Row, Col } from 'antd';
import { CheckOutlined, CloseOutlined, PlusOutlined, UserOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import * as adminApi from '../api/admin';
import * as votingApi from '../api/voting';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();
  const [topics, setTopics] = useState([]);
  const [buildingAdminModalVisible, setBuildingAdminModalVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [buildingAdminForm] = Form.useForm();
  const [buildingAdminLoading, setBuildingAdminLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allResidents, setAllResidents] = useState([]);
  const [allResidentsLoading, setAllResidentsLoading] = useState(false);
  const [approvedResidents, setApprovedResidents] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [editResidentModalVisible, setEditResidentModalVisible] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [editResidentForm] = Form.useForm();
  const [editResidentLoading, setEditResidentLoading] = useState(false);
  const [buildingList, setBuildingList] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [stats, setStats] = useState({
    totalResidents: 0,
    approvedResidents: 0,
    pendingResidents: 0,
    totalTopics: 0,
    totalVotes: 0,
    buildingAdmins: 0,
  });

  // 辅助函数：判断是否为超级管理员
  const isSuperAdmin = (user) => {
    return user && user.username === 'admin';
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 先加载当前用户信息，这是必须的
        await loadCurrentUser();
        // 然后并行加载其他数据
        await Promise.allSettled([
          loadResidents(),
          loadTopics(),
          calculateStats()
        ]);
      } catch (error) {
        console.error('初始化管理后台失败:', error);
        // 用户信息加载失败时，其他数据无法加载
      }
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    if (residents.length > 0) {
      calculateStats();
    }
  }, [residents, topics]);

  const calculateStats = async () => {
    try {
      const [allRes, allTopics] = await Promise.all([
        adminApi.getAllResidents(),
        votingApi.getTopics()
      ]);
      
      const approvedCount = allRes.filter(r => r.status === 'approved').length;
      const pendingCount = allRes.filter(r => r.status === 'pending').length;
      const buildingAdminCount = allRes.filter(r => r.is_building_admin === 1).length;
      
      let totalVotes = 0;
      for (const topic of allTopics) {
        if (topic.options) {
          totalVotes += topic.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        }
      }
      
      setStats({
        totalResidents: allRes.length,
        approvedResidents: approvedCount,
        pendingResidents: pendingCount,
        totalTopics: allTopics.length,
        totalVotes: totalVotes,
        buildingAdmins: buildingAdminCount,
      });
    } catch (error) {
      console.error('计算统计数据失败:', error);
      // 统计数据失败不影响主要功能，只记录错误
    }
  };

  const loadCurrentUser = async () => {
    try {
      const data = await adminApi.getCurrentUser();
      setCurrentUser(data);
      return data;
    } catch (error) {
      console.error('加载当前用户失败:', error);
      message.error('加载用户信息失败，请重新登录');
      throw error; // 抛出错误以便上层处理
    }
  };

  const loadAllResidents = async () => {
    setAllResidentsLoading(true);
    try {
      const data = await adminApi.getAllResidents();
      setAllResidents(data);
    } catch (error) {
      message.error('加载业主列表失败');
    } finally {
      setAllResidentsLoading(false);
    }
  };

  const loadApprovedResidents = async () => {
    setApprovedLoading(true);
    try {
      const data = await adminApi.getAllResidents();
      // 过滤出已批准的业主
      const approved = data.filter(r => r.status === 'approved');
      setApprovedResidents(approved);
    } catch (error) {
      message.error('加载已批准业主失败');
    } finally {
      setApprovedLoading(false);
    }
  };

  const loadResidents = async (retryCount = 0) => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingResidents();
      setResidents(data);
    } catch (error) {
      console.error('加载待审核业主失败:', error);
      
      // 如果是首次加载失败，尝试重试一次
      if (retryCount < 2) {
        console.log(`重试加载待审核业主 (${retryCount + 1}/2)...`);
        setTimeout(() => {
          loadResidents(retryCount + 1);
        }, 1000); // 1秒后重试
        return;
      }
      
      message.error('加载待审核业主失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    try {
      const data = await votingApi.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('加载议题失败:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminApi.approveResident(id, 'approved');
      message.success('已批准该业主');
      loadResidents();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.approveResident(id, 'rejected');
      message.success('已拒绝该业主');
      loadResidents();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSetBuildingAdmin = (record) => {
    setSelectedResident(record);
    
    // 加载所有楼栋信息
    loadBuildingList();
    
    setBuildingAdminModalVisible(true);
  };

  const loadBuildingList = async () => {
    try {
      const data = await adminApi.getAllResidents();
      // 提取所有不重复的楼栋信息
      const buildings = new Set();
      // 如果 data 是一个数组，直接遍历；否则取响应的 data 字段
      const residentsArray = Array.isArray(data) ? data : data.data || [];
      residentsArray.forEach(resident => {
        if (resident.building) {
          buildings.add(resident.building);
        }
      });
      // 按照楼栋名称排序
      const sortedBuildings = Array.from(buildings).sort();
      setBuildingList(sortedBuildings);
    } catch (error) {
      console.error('加载楼栋信息失败:', error);
      message.error('加载楼栋信息失败');
    }
  };

  const onBuildingAdminFinish = async (values) => {
    setBuildingAdminLoading(true);
    try {
      await adminApi.setBuildingAdmin(selectedResident.id, values.building);
      message.success(`${selectedResident.real_name}已设置为${values.building}的楼栋管理员`);
      setBuildingAdminModalVisible(false);
      buildingAdminForm.resetFields();
      setSelectedResident(null);
      loadResidents();
    } catch (error) {
      message.error(error.error || '设置失败');
    } finally {
      setBuildingAdminLoading(false);
    }
  };

  const handleEditResident = (record) => {
    setEditingResident(record);
    editResidentForm.setFieldsValue({
      real_name: record.real_name,
      building: record.building,
      unit_number: record.unit_number,
      phone: record.phone,
    });
    
    // 加载楼栋列表
    loadBuildingList();
    
    setEditResidentModalVisible(true);
  };

  const onEditResidentFinish = async (values) => {
    setEditResidentLoading(true);
    try {
      await adminApi.updateResident(editingResident.id, {
        ...values,
        reset_password: true,
      });
      message.success('业主信息已更新，密码已重置为 123456');
      setEditResidentModalVisible(false);
      editResidentForm.resetFields();
      setEditingResident(null);
      loadApprovedResidents();
    } catch (error) {
      message.error(error.error || '更新失败');
    } finally {
      setEditResidentLoading(false);
    }
  };

  const handleDeleteResident = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除业主 "${record.real_name}" (${record.username}) 吗？此操作将同时删除该业主的所有投票记录，且不可恢复！`,
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await adminApi.deleteResident(record.id);
          message.success('业主已删除');
          // 刷新所有列表
          loadResidents();
          loadApprovedResidents();
          calculateStats();
        } catch (error) {
          message.error(error.error || '删除失败');
        }
      },
    });
  };

  const handleUpdateSort = async (topicId, sortOrder) => {
    try {
      await votingApi.updateTopicSort(topicId, sortOrder);
      message.success('排序已更新');
      loadTopics();
    } catch (error) {
      message.error(error.error || '排序更新失败');
    }
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    form.setFieldsValue({
      title: topic.title,
      description: topic.description,
      options: topic.options?.map(opt => opt.option_text).join('\n'),
    });
    setModalVisible(true);
  };

  const onFinish = async (values) => {
    setSubmitLoading(true);
    try {
      const options = values.options
        .split('\n')
        .filter((opt) => opt.trim())
        .map((opt) => opt.trim());

      if (options.length < 2) {
        message.error('至少需要2个选项');
        return;
      }

      if (editingTopic) {
        // Update existing topic
        await votingApi.updateTopic(editingTopic.id, {
          ...values,
          options,
        });
        message.success('议题更新成功');
      } else {
        // Create new topic
        await votingApi.createTopic({
          ...values,
          options,
        });
        message.success('议题创建成功');
      }

      form.resetFields();
      setModalVisible(false);
      setEditingTopic(null);
      loadTopics();
    } catch (error) {
      message.error(error.error || (editingTopic ? '更新失败' : '创建失败'));
    } finally {
      setSubmitLoading(false);
    }
  };

  const residentColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '单元号',
      dataIndex: 'unit_number',
      key: 'unit_number',
    },
    {
      title: '楼栋',
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleApprove(record.id)}
          >
            批准
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleReject(record.id)}
          >
            拒绝
          </Button>
          <Button
            type="dashed"
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleSetBuildingAdmin(record)}
          >
            指定管理员
          </Button>
        </Space>
      ),
    },
  ];

  const topicColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: '进行中',
          closed: '已关闭',
          pending: '待开始',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      render: (sortOrder, record) => (
        isSuperAdmin(currentUser) ? (
          <Input
            type="number"
            value={sortOrder || 0}
            onChange={(e) => handleUpdateSort(record.id, parseInt(e.target.value))}
            size="small"
            style={{ width: '80px' }}
          />
        ) : (
          sortOrder || 0
        )
      ),
    },
    {
      title: '选项数',
      key: 'options_count',
      render: (_, record) => record.options?.length || 0,
    },
    {
      title: '总票数',
      key: 'total_votes',
      render: (_, record) => {
        return record.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {isSuperAdmin(currentUser) && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleEditTopic(record)}
            >
              编辑
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // 楼栋管理员用的业主列表列定义（包含审核操作）
  const buildingAdminResidentColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '单元号',
      dataIndex: 'unit_number',
      key: 'unit_number',
    },
    {
      title: '楼栋',
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: '待审核',
          approved: '已批准',
          rejected: '已拒绝',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        // 待审核的显示审核按钮
        if (record.status === 'pending') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                批准
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                拒绝
              </Button>
              {isSuperAdmin(currentUser) && (
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={() => handleDeleteResident(record)}
                >
                  删除
                </Button>
              )}
            </Space>
          );
        }
        // 已批准的显示编辑按钮
        if (record.status === 'approved') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleEditResident(record)}
              >
                编辑
              </Button>
            </Space>
          );
        }
        return <span>-</span>;
      },
    },
  ];

  // 已批准业主列表列定义（包含编辑操作）
  const approvedResidentColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
    },
    {
      title: '单元号',
      dataIndex: 'unit_number',
      key: 'unit_number',
    },
    {
      title: '楼栋',
      dataIndex: 'building',
      key: 'building',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '楼栋管理员',
      key: 'admin_info',
      render: (_, record) => (
        <span>
          {record.is_building_admin === 1 ? (
            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {record.managed_building}管理员
            </span>
          ) : (
            <span style={{ color: '#999' }}>普通业主</span>
          )}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {currentUser?.is_building_admin === 1 ? (
            // 楼栋管理员只能编辑同一栋楼的业主
            record.building === currentUser?.managed_building && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleEditResident(record)}
              >
                编辑
              </Button>
            )
          ) : (
            // 超级管理员可以编辑和删除所有业主
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => handleEditResident(record)}
              >
                编辑
              </Button>
              {isSuperAdmin(currentUser) && record.username !== 'admin' && (
                <Button
                  type="primary"
                  danger
                  size="small"
                  onClick={() => handleDeleteResident(record)}
                >
                  删除
                </Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  // 数据备份函数
  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const data = await adminApi.backupData();
      setBackupData(data);
      message.success('数据备份成功！');
      
      // 自动下载备份文件
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = `backup-${new Date().getTime()}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      message.error(error.error || '备份失败');
    } finally {
      setBackupLoading(false);
    }
  };

  // 数据恢复函数
  const handleRestore = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.data || !data.data.residents) {
        throw new Error('备份文件格式不正确');
      }

      Modal.confirm({
        title: '确认恢复数据',
        content: '此操作将覆盖所有现有数据。请确保已备份重要数据！',
        okText: '确认恢复',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: async () => {
          setRestoreLoading(true);
          try {
            await adminApi.restoreData(data.data);
            message.success('数据恢复成功！');
            // 刷新页面
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } catch (error) {
            message.error(error.error || '恢复失败');
          } finally {
            setRestoreLoading(false);
          }
        }
      });
    } catch (error) {
      message.error('文件读取失败或格式不正确');
    }
    return false;
  };

  return (
    <div className="admin-dashboard">
      <Tabs
        items={[
          // 待审核业主选项卡（仅超级管理员显示）
          ...(isSuperAdmin(currentUser)
            ? [
                {
                  key: '1',
                  label: '待审核业主',
                  children: (
                    <Card title="待审核业主列表">
                      <Spin spinning={loading}>
                        <Table
                          dataSource={residents}
                          columns={residentColumns}
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                        />
                      </Spin>
                    </Card>
                  ),
                },
              ]
            : []),
          // 楼栋业主列表选项卡（仅楼栋管理员显示）
          ...(currentUser && currentUser.is_building_admin === 1
            ? [
                {
                  key: '3',
                  label: `${currentUser.managed_building}待审核业主`,
                  children: (
                    <Card title={`${currentUser.managed_building}的待审核业主`}>
                      <Spin spinning={loading}>
                        <Table
                          dataSource={residents.filter(
                            (r) => r.building === currentUser.managed_building
                          )}
                          columns={residentColumns}
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                        />
                      </Spin>
                    </Card>
                  ),
                },
              ]
            : []),
          // 投票议题管理选项卡（所有人可见）
          {
            key: '2',
            label: '投票议题管理',
            children: (
              <Card
                title="投票议题列表"
                extra={
                  // 只有超级管理员才能创建议题
                  isSuperAdmin(currentUser) && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setModalVisible(true)}
                    >
                      创建议题
                    </Button>
                  )
                }
              >
                <Table
                  dataSource={topics}
                  columns={topicColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            ),
          },
          // 数据统计标签页（仅超级管理员显示）
          ...(isSuperAdmin(currentUser)
            ? [
                {
                  key: '3',
                  label: '数据统计',
                  children: (
                    <Card title="系统数据统计">
                      <Row gutter={24} style={{ marginBottom: 32 }}>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="总业主数"
                            value={stats.totalResidents}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="已批准业主"
                            value={stats.approvedResidents}
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="待审核业主"
                            value={stats.pendingResidents}
                            valueStyle={{ color: '#faad14' }}
                          />
                        </Col>
                      </Row>
                      <Row gutter={24} style={{ marginBottom: 32 }}>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="总投票议题数"
                            value={stats.totalTopics}
                            valueStyle={{ color: '#722ed1' }}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="总投票数"
                            value={stats.totalVotes}
                            valueStyle={{ color: '#fa541c' }}
                          />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                          <Statistic
                            title="楼栋管理员数"
                            value={stats.buildingAdmins}
                            valueStyle={{ color: '#13c2c2' }}
                          />
                        </Col>
                      </Row>
                      <Button
                        onClick={calculateStats}
                        style={{ marginTop: 16 }}
                      >
                        刷新统计数据
                      </Button>
                    </Card>
                  ),
                },
              ]
            : []),
          // 已批准业主列表选项卡（所有人可见）
          {
            key: '4',
            label: '已批准业主',
            children: (
              <Card title="已批准业主列表">
                <Button
                  type="primary"
                  style={{ marginBottom: 16 }}
                  onClick={() => {
                    loadApprovedResidents();
                  }}
                >
                  加载列表
                </Button>
                <Spin spinning={approvedLoading}>
                  <Table
                    dataSource={currentUser && currentUser.is_building_admin === 1 
                      ? approvedResidents.filter(r => r.building === currentUser.managed_building)
                      : approvedResidents
                    }
                    columns={approvedResidentColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </Spin>
              </Card>
            ),
          },
          // 数据备份恢复标签页（仅超级管理员显示）
          ...(isSuperAdmin(currentUser)
            ? [
                {
                  key: '5',
                  label: '数据备份恢复',
                  children: (
                    <Card title="数据备份和恢复">
                      <Alert
                        message="注意"
                        description="备份包含所有业主、投票议题、投票记录等数据。恢复操作将覆盖所有现有数据，请谨慎操作。"
                        type="warning"
                        showIcon
                        style={{ marginBottom: 24 }}
                      />
                      <div style={{ marginBottom: 24 }}>
                        <h3>备份数据</h3>
                        <p>点击下方按钮将数据库中的所有数据导出为 JSON 文件。</p>
                        <Button
                          type="primary"
                          size="large"
                          icon={<DownloadOutlined />}
                          loading={backupLoading}
                          onClick={handleBackup}
                        >
                          导出备份
                        </Button>
                      </div>
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
                        <h3>恢复数据</h3>
                        <p>选择之前备份的 JSON 文件来恢复数据。</p>
                        <Upload
                          accept=".json"
                          maxCount={1}
                          beforeUpload={handleRestore}
                          customRequest={() => {}}
                        >
                          <Button
                            icon={<UploadOutlined />}
                            loading={restoreLoading}
                          >
                            选择备份文件恢复
                          </Button>
                        </Upload>
                      </div>
                    </Card>
                  ),
                },
              ]
            : []),
        ]}
      />

      {/* 楼栋管理员 Modal */}
      <Modal
        title="指定楼栋管理员"
        open={buildingAdminModalVisible}
        onCancel={() => {
          setBuildingAdminModalVisible(false);
          buildingAdminForm.resetFields();
          setSelectedResident(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setBuildingAdminModalVisible(false);
            buildingAdminForm.resetFields();
            setSelectedResident(null);
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={buildingAdminLoading}
            onClick={() => buildingAdminForm.submit()}
          >
            确定
          </Button>,
        ]}
      >
        <Form form={buildingAdminForm} onFinish={onBuildingAdminFinish} layout="vertical">
          <Form.Item>
            <p>业主：<strong>{selectedResident?.real_name}</strong> ({selectedResident?.building})</p>
          </Form.Item>
          <Form.Item
            name="building"
            label="指定为以下楼栋的管理员"
            rules={[{ required: true, message: '请选择楼栋' }]}
          >
            <Select placeholder="选择楼栋">
              {buildingList.map((building) => (
                <Select.Option key={building} value={building}>
                  {building}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 投票议题 Modal */}
      <Modal
        title={editingTopic ? '编辑投票议题' : '创建投票议题'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTopic(null);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setEditingTopic(null);
            form.resetFields();
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={() => form.submit()}
          >
            {editingTopic ? '更新' : '创建'}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="title"
            label="议题标题"
            rules={[{ required: true, message: '请输入议题标题' }]}
          >
            <Input placeholder="例如：是否同意增加绿化维护费用？" />
          </Form.Item>

          <Form.Item
            name="description"
            label="议题描述"
            rules={[{ required: true, message: '请输入议题描述' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="详细描述该投票议题的背景和内容"
            />
          </Form.Item>

          <Form.Item
            name="options"
            label="投票选项（每行一个）"
            rules={[{ required: true, message: '请输入至少2个投票选项' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="同意&#10;不同意&#10;弃权"
            />
          </Form.Item>

          <Form.Item name="start_date" label="开始时间">
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item name="end_date" label="结束时间">
            <Input type="datetime-local" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑业主信息 Modal */}
      <Modal
        title="编辑业主信息"
        open={editResidentModalVisible}
        onCancel={() => {
          setEditResidentModalVisible(false);
          editResidentForm.resetFields();
          setEditingResident(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setEditResidentModalVisible(false);
            editResidentForm.resetFields();
            setEditingResident(null);
          }}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={editResidentLoading}
            onClick={() => editResidentForm.submit()}
          >
            保存
          </Button>,
        ]}
      >
        <Form form={editResidentForm} onFinish={onEditResidentFinish} layout="vertical">
          <Form.Item>
            <p>用户名：<strong>{editingResident?.username}</strong></p>
          </Form.Item>
          <Form.Item
            name="real_name"
            label="真实姓名"
            rules={[{ required: true, message: '请输入真实姓名' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="building"
            label="楼栋"
            rules={[{ required: true, message: '请选择楼栋' }]}
          >
            <Select 
              placeholder="选择楼栋"
              disabled={currentUser?.is_building_admin === 1}
            >
              {currentUser?.is_building_admin === 1 ? (
                // 楼栋管理员只显示自己管理的楼栋
                <Select.Option key={currentUser.managed_building} value={currentUser.managed_building}>
                  {currentUser.managed_building}
                </Select.Option>
              ) : (
                // 超级管理员显示所有楼栋
                buildingList.map((building) => (
                  <Select.Option key={building} value={building}>
                    {building}
                  </Select.Option>
                ))
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="unit_number"
            label="单元号"
            rules={[{ required: true, message: '请输入单元号' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话号码' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
