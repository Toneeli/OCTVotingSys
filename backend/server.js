import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

let db;

// 初始化数据库
async function initDatabase() {
  db = await open({
    filename: './voting.db',
    driver: sqlite3.Database
  });

  // 创建业主表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS residents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT NOT NULL,
      building TEXT NOT NULL,
      unit_number TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'pending',
      is_building_admin INTEGER DEFAULT 0,
      managed_building TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建投票议题表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_by INTEGER,
      start_date DATETIME,
      end_date DATETIME,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES residents(id)
    )
  `);

  // 创建投票选项表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      votes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    )
  `);

  // 创建投票记录表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      resident_id INTEGER NOT NULL,
      option_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(topic_id, resident_id),
      FOREIGN KEY (topic_id) REFERENCES topics(id),
      FOREIGN KEY (resident_id) REFERENCES residents(id),
      FOREIGN KEY (option_id) REFERENCES options(id)
    )
  `);

  // 创建楼栋管理员表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS building_admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resident_id INTEGER NOT NULL,
      building TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(resident_id, building),
      FOREIGN KEY (resident_id) REFERENCES residents(id)
    )
  `);

  // 为已有的表添加 sort_order 字段（如果不存在）
  try {
    await db.run('ALTER TABLE topics ADD COLUMN sort_order INTEGER DEFAULT 0');
  } catch (err) {
    // sort_order 字段可能已存在，忽略错误
  }

  // 创建默认管理员账号（如果不存在）
  try {
    const adminExists = await db.get(
      'SELECT id FROM residents WHERE username = ?',
      ['admin']
    );
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('895600', 10);
      await db.run(
        `INSERT INTO residents (username, password, real_name, building, unit_number, phone, status, is_building_admin, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin', hashedPassword, '张管理', 'T1栋', '1-A1', '13800138000', 'approved', 0, new Date().toISOString()]
      );
      console.log('✅ 默认管理员账号已创建: admin / 895600');
    }
  } catch (err) {
    console.error('创建管理员账号失败:', err);
  }
}

// JWT 密钥
const JWT_SECRET = 'your-secret-key-change-in-production';

// 中间件：验证 Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ============ 根路由 ============

// 健康检查
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '华侨城-智慧社区投票站后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0',
    endpoints: {
      topics: 'GET /api/topics',
      auth: 'POST /api/auth/login',
      docs: 'GET /api/docs'
    }
  });
});

// API文档
app.get('/api/docs', (req, res) => {
  res.json({
    name: '华侨城-智慧社区投票站 API',
    version: '1.0',
    baseUrl: 'http://localhost:3001',
    endpoints: [
      {
        method: 'GET',
        path: '/api/topics',
        description: '获取所有投票议题',
        auth: false
      },
      {
        method: 'GET',
        path: '/api/topics/:id',
        description: '获取单个投票议题',
        auth: false
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        description: '用户登录',
        auth: false
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: '用户注册',
        auth: false
      },
      {
        method: 'POST',
        path: '/api/topics/:id/vote',
        description: '提交投票',
        auth: true
      },
      {
        method: 'GET',
        path: '/api/admin/residents/pending',
        description: '获取待审核用户',
        auth: true
      },
      {
        method: 'PATCH',
        path: '/api/admin/residents/:id/approve',
        description: '审核批准用户',
        auth: true
      },
      {
        method: 'PATCH',
        path: '/api/admin/residents/:id/set-building-admin',
        description: '设置楼栋管理员',
        auth: true
      },
      {
        method: 'POST',
        path: '/api/admin/topics',
        description: '创建投票议题',
        auth: true
      },
      {
        method: 'PUT',
        path: '/api/topics/:id',
        description: '更新投票议题',
        auth: true
      },
      {
        method: 'GET',
        path: '/api/stats/topic/:id',
        description: '获取投票统计',
        auth: false
      }
    ]
  });
});

// ============ 业主认证 API ============

// 业主注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, real_name, building, unit_number, phone } = req.body;
    
    if (!building) {
      return res.status(400).json({ error: '楼栋信息不能为空' });
    }
    
    // 自动添加"栋"字，如果没有的话
    let normalizedBuilding = building.trim();
    if (!normalizedBuilding.endsWith('栋')) {
      normalizedBuilding += '栋';
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO residents (username, password, real_name, building, unit_number, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, hashedPassword, real_name, normalizedBuilding, unit_number, phone]
    );
    
    res.json({ 
      message: '注册成功，等待审核',
      id: result.lastID 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 业主登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const resident = await db.get(
      'SELECT * FROM residents WHERE username = ?',
      [username]
    );
    
    if (!resident) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    if (resident.status !== 'approved') {
      return res.status(403).json({ error: '账户待审核或已禁用' });
    }
    
    const validPassword = await bcrypt.compare(password, resident.password);
    if (!validPassword) {
      return res.status(401).json({ error: '密码错误' });
    }
    
    const token = jwt.sign(
      { id: resident.id, username: resident.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      resident: { 
        id: resident.id, 
        username: resident.username, 
        real_name: resident.real_name,
        is_building_admin: resident.is_building_admin
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 修改密码
app.patch('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    
    // 验证新密码确认
    if (new_password !== confirm_password) {
      return res.status(400).json({ error: '两次输入的密码不一致' });
    }
    
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ error: '新密码至少6个字符' });
    }
    
    // 获取当前用户
    const user = await db.get(
      'SELECT * FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 验证旧密码
    const validPassword = await bcrypt.compare(old_password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '旧密码错误' });
    }
    
    // 更新密码
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.run(
      'UPDATE residents SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: '密码已成功修改' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 投票管理 API ============

// 获取所有投票议题
app.get('/api/topics', async (req, res) => {
  try {
    const topics = await db.all('SELECT * FROM topics ORDER BY sort_order DESC, created_at DESC');
    
    for (let topic of topics) {
      topic.options = await db.all('SELECT * FROM options WHERE topic_id = ?', [topic.id]);
    }
    
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取单个投票议题详情
app.get('/api/topics/:id', async (req, res) => {
  try {
    const topic = await db.get('SELECT * FROM topics WHERE id = ?', [req.params.id]);
    if (!topic) return res.status(404).json({ error: '议题不存在' });
    
    topic.options = await db.all('SELECT * FROM options WHERE topic_id = ?', [topic.id]);
    
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建投票议题（管理员）
app.post('/api/topics', authenticateToken, async (req, res) => {
  try {
    // 检查是否为超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser && currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能创建投票议题' });
    }
    
    const { title, description, options, start_date, end_date } = req.body;
    
    const result = await db.run(
      'INSERT INTO topics (title, description, created_by, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
      [title, description, req.user.id, start_date, end_date]
    );
    
    const topicId = result.lastID;
    
    for (let optionText of options) {
      await db.run(
        'INSERT INTO options (topic_id, option_text) VALUES (?, ?)',
        [topicId, optionText]
      );
    }
    
    res.json({ message: '议题创建成功', id: topicId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 更新投票议题（管理员）
app.put('/api/topics/:id', authenticateToken, async (req, res) => {
  try {
    // 检查是否为超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser && currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能编辑投票议题' });
    }
    
    const topicId = req.params.id;
    const { title, description, options, start_date, end_date } = req.body;
    
    // 验证议题存在
    const topic = await db.get('SELECT * FROM topics WHERE id = ?', [topicId]);
    if (!topic) {
      return res.status(404).json({ error: '议题不存在' });
    }
    
    // 更新议题基本信息
    await db.run(
      'UPDATE topics SET title = ?, description = ?, start_date = ?, end_date = ? WHERE id = ?',
      [title, description, start_date, end_date, topicId]
    );
    
    // 删除旧选项
    await db.run('DELETE FROM options WHERE topic_id = ?', [topicId]);
    
    // 添加新选项
    for (let optionText of options) {
      await db.run(
        'INSERT INTO options (topic_id, option_text) VALUES (?, ?)',
        [topicId, optionText]
      );
    }
    
    res.json({ message: '议题更新成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 更新投票议题的排序顺序
app.patch('/api/topics/:id/sort', authenticateToken, async (req, res) => {
  try {
    // 检查是否为超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser && currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能调整投票议题顺序' });
    }
    
    const { sort_order } = req.body;
    
    if (sort_order === undefined || sort_order === null) {
      return res.status(400).json({ error: '排序顺序不能为空' });
    }
    
    await db.run(
      'UPDATE topics SET sort_order = ? WHERE id = ?',
      [sort_order, req.params.id]
    );
    
    res.json({ message: '排序已更新' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 提交投票
app.post('/api/votes', authenticateToken, async (req, res) => {
  try {
    const { topic_id, option_id } = req.body;
    
    // 检查是否已投票
    const existingVote = await db.get(
      'SELECT * FROM votes WHERE topic_id = ? AND resident_id = ?',
      [topic_id, req.user.id]
    );
    
    if (existingVote) {
      return res.status(400).json({ error: '您已投过票' });
    }
    
    // 插入投票记录
    await db.run(
      'INSERT INTO votes (topic_id, resident_id, option_id) VALUES (?, ?, ?)',
      [topic_id, req.user.id, option_id]
    );
    
    // 更新选项票数
    await db.run(
      'UPDATE options SET votes = votes + 1 WHERE id = ?',
      [option_id]
    );
    
    res.json({ message: '投票成功' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 获取投票业主信息（投票后查看）
app.get('/api/votes/topic/:topic_id', async (req, res) => {
  try {
    // 获取所有投票业主信息
    const voters = await db.all(
      `SELECT DISTINCT r.id, r.real_name, r.username, r.building, r.unit_number 
       FROM votes v 
       JOIN residents r ON v.resident_id = r.id 
       WHERE v.topic_id = ? 
       ORDER BY v.created_at`,
      [req.params.topic_id]
    );
    
    res.json({
      topic_id: req.params.topic_id,
      voter_count: voters.length,
      voters: voters
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 管理员 API ============

// 获取当前用户信息
app.get('/api/admin/user/current', authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      'SELECT id, username, real_name, building, is_building_admin, managed_building FROM residents WHERE id = ?',
      [req.user.id]
    );
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取所有业主信息
app.get('/api/admin/residents', authenticateToken, async (req, res) => {
  try {
    const residents = await db.all(
      'SELECT id, username, real_name, building, unit_number, phone, status, is_building_admin, managed_building, created_at FROM residents ORDER BY created_at DESC'
    );
    res.json(residents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取待审核业主
app.get('/api/admin/residents/pending', authenticateToken, async (req, res) => {
  try {
    // 获取当前用户信息
    const currentUser = await db.get(
      'SELECT is_building_admin, managed_building FROM residents WHERE id = ?',
      [req.user.id]
    );

    if (!currentUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    let residents;
    if (currentUser.is_building_admin === 1) {
      // 楼栋管理员只能看自己楼栋的待审核业主
      residents = await db.all(
        'SELECT id, username, real_name, building, unit_number, phone, created_at FROM residents WHERE status = ? AND building = ?',
        ['pending', currentUser.managed_building]
      );
    } else {
      // 超级管理员可以看所有待审核业主
      residents = await db.all(
        'SELECT id, username, real_name, building, unit_number, phone, created_at FROM residents WHERE status = ?',
        ['pending']
      );
    }
    res.json(residents || []);
  } catch (err) {
    console.error('获取待审核业主失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 审核业主（批准或拒绝）
app.patch('/api/admin/residents/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    
    // 验证权限
    const currentUser = await db.get(
      'SELECT is_building_admin, managed_building FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    const targetResident = await db.get(
      'SELECT building FROM residents WHERE id = ?',
      [req.params.id]
    );
    
    if (!targetResident) {
      return res.status(404).json({ error: '业主不存在' });
    }
    
    // 如果是楼栋管理员，只能审核自己楼栋的业主
    if (currentUser.is_building_admin === 1 && currentUser.managed_building !== targetResident.building) {
      return res.status(403).json({ error: '您只能审核自己楼栋的业主' });
    }
    
    await db.run(
      'UPDATE residents SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    res.json({ message: `业主${status === 'approved' ? '已批准' : '已拒绝'}` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 设置楼栋管理员
app.patch('/api/admin/residents/:id/set-building-admin', authenticateToken, async (req, res) => {
  try {
    const { building } = req.body;
    
    if (!building) {
      return res.status(400).json({ error: '楼栋不能为空' });
    }
    
    // 验证业主是否存在
    const resident = await db.get(
      'SELECT * FROM residents WHERE id = ?',
      [req.params.id]
    );
    
    if (!resident) {
      return res.status(404).json({ error: '业主不存在' });
    }
    
    // 更新业主的管理员标记
    await db.run(
      'UPDATE residents SET is_building_admin = 1, managed_building = ? WHERE id = ?',
      [building, req.params.id]
    );
    
    // 创建或更新楼栋管理员记录
    await db.run(
      'INSERT OR REPLACE INTO building_admins (resident_id, building) VALUES (?, ?)',
      [req.params.id, building]
    );
    
    res.json({ message: `已设置为${building}的楼栋管理员` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 更新业主信息
app.patch('/api/admin/residents/:id', authenticateToken, async (req, res) => {
  try {
    const { real_name, building, unit_number, phone, reset_password } = req.body;
    const residentId = req.params.id;
    
    // 验证必填字段
    if (!real_name || !building || !unit_number || !phone) {
      return res.status(400).json({ error: '所有字段都是必填的' });
    }
    
    // 获取当前用户信息
    const currentUser = await db.get(
      'SELECT id, is_building_admin, managed_building FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    // 获取要更新的业主信息
    const targetResident = await db.get(
      'SELECT id, building FROM residents WHERE id = ?',
      [residentId]
    );
    
    if (!targetResident) {
      return res.status(404).json({ error: '业主不存在' });
    }
    
    // 权限检查：楼栋管理员只能编辑自己楼栋的业主
    if (currentUser.is_building_admin === 1) {
      // 检查楼栋管理员的managed_building是否匹配
      if (currentUser.managed_building !== targetResident.building && currentUser.managed_building !== building) {
        return res.status(403).json({ error: '您只能编辑自己楼栋的业主信息' });
      }
    }
    
    // 如果需要重置密码
    if (reset_password) {
      const defaultPassword = '123456';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await db.run(
        'UPDATE residents SET real_name = ?, building = ?, unit_number = ?, phone = ?, password = ? WHERE id = ?',
        [real_name, building, unit_number, phone, hashedPassword, residentId]
      );
    } else {
      // 只更新基本信息，不更改密码
      await db.run(
        'UPDATE residents SET real_name = ?, building = ?, unit_number = ?, phone = ? WHERE id = ?',
        [real_name, building, unit_number, phone, residentId]
      );
    }
    
    res.json({ message: '业主信息已更新' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 删除业主（仅超级管理员）
app.delete('/api/admin/residents/:id', authenticateToken, async (req, res) => {
  try {
    const residentId = req.params.id;
    
    // 验证是否为超级管理员
    const currentUser = await db.get(
      'SELECT id, username FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (!currentUser || currentUser.username !== 'admin') {
      return res.status(403).json({ error: '只有超级管理员可以删除业主' });
    }
    
    // 检查要删除的业主是否存在
    const targetResident = await db.get(
      'SELECT id, username FROM residents WHERE id = ?',
      [residentId]
    );
    
    if (!targetResident) {
      return res.status(404).json({ error: '业主不存在' });
    }
    
    // 不允许删除超级管理员自己
    if (targetResident.username === 'admin') {
      return res.status(403).json({ error: '不能删除超级管理员账号' });
    }
    
    // 先删除该业主的投票记录
    await db.run(
      'DELETE FROM votes WHERE resident_id = ?',
      [residentId]
    );
    
    // 删除业主记录
    await db.run(
      'DELETE FROM residents WHERE id = ?',
      [residentId]
    );
    
    res.json({ message: '业主已删除' });
  } catch (err) {
    console.error('删除业主失败:', err);
    res.status(500).json({ error: err.message });
  }
});

// 指定楼栋管理员
app.post('/api/admin/building-admins', authenticateToken, async (req, res) => {
  try {
    const { resident_id, building } = req.body;
    
    // 检查是否是超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能指定楼栋管理员' });
    }
    
    // 更新业主的管理员标记
    await db.run(
      'UPDATE residents SET is_building_admin = 1, managed_building = ? WHERE id = ?',
      [building, resident_id]
    );
    
    // 创建楼栋管理员记录
    await db.run(
      'INSERT OR IGNORE INTO building_admins (resident_id, building) VALUES (?, ?)',
      [resident_id, building]
    );
    
    res.json({ message: `已设置为${building}的楼栋管理员` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 获取楼栋管理员列表
app.get('/api/admin/building-admins', authenticateToken, async (req, res) => {
  try {
    const buildingAdmins = await db.all(
      `SELECT ba.id, r.id as resident_id, r.real_name, r.username, ba.building, ba.created_at 
       FROM building_admins ba 
       JOIN residents r ON ba.resident_id = r.id 
       ORDER BY ba.building`
    );
    res.json(buildingAdmins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 获取所有楼栋列表
app.get('/api/admin/buildings', authenticateToken, async (req, res) => {
  try {
    const buildings = await db.all(
      'SELECT DISTINCT building FROM residents ORDER BY building'
    );
    res.json(buildings.map(b => b.building));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 数据备份和恢复 API ============

// 备份数据库
app.post('/api/admin/backup', authenticateToken, async (req, res) => {
  try {
    // 检查是否为超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (!currentUser || currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能执行此操作' });
    }

    // 获取所有表的数据
    const residents = await db.all('SELECT * FROM residents');
    const topics = await db.all('SELECT * FROM topics');
    const options = await db.all('SELECT * FROM options');
    const votes = await db.all('SELECT * FROM votes');
    const building_admins = await db.all('SELECT * FROM building_admins');

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        residents,
        topics,
        options,
        votes,
        building_admins
      }
    };

    res.json(backupData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 恢复数据库
app.post('/api/admin/restore', authenticateToken, async (req, res) => {
  try {
    // 检查是否为超级管理员
    const currentUser = await db.get(
      'SELECT is_building_admin FROM residents WHERE id = ?',
      [req.user.id]
    );
    
    if (!currentUser || currentUser.is_building_admin === 1) {
      return res.status(403).json({ error: '只有超级管理员才能执行此操作' });
    }

    const { data } = req.body;
    
    if (!data || !data.residents || !data.topics || !data.options || !data.votes) {
      return res.status(400).json({ error: '备份数据格式不正确' });
    }

    // 清空所有现有数据
    await db.run('DELETE FROM votes');
    await db.run('DELETE FROM options');
    await db.run('DELETE FROM topics');
    await db.run('DELETE FROM building_admins');
    await db.run('DELETE FROM residents');

    // 恢复residents数据
    for (const resident of data.residents) {
      await db.run(
        `INSERT INTO residents (id, username, password, real_name, building, unit_number, phone, status, is_building_admin, managed_building, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [resident.id, resident.username, resident.password, resident.real_name, resident.building, resident.unit_number, resident.phone, resident.status, resident.is_building_admin, resident.managed_building, resident.created_at]
      );
    }

    // 恢复topics数据
    for (const topic of data.topics) {
      await db.run(
        `INSERT INTO topics (id, title, description, status, created_by, start_date, end_date, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [topic.id, topic.title, topic.description, topic.status, topic.created_by, topic.start_date, topic.end_date, topic.sort_order || 0, topic.created_at]
      );
    }

    // 恢复options数据
    for (const option of data.options) {
      await db.run(
        `INSERT INTO options (id, topic_id, option_text, votes, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [option.id, option.topic_id, option.option_text, option.votes, option.created_at]
      );
    }

    // 恢复votes数据
    for (const vote of data.votes) {
      await db.run(
        `INSERT INTO votes (id, topic_id, resident_id, option_id, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [vote.id, vote.topic_id, vote.resident_id, vote.option_id, vote.created_at]
      );
    }

    // 恢复building_admins数据
    if (data.building_admins && data.building_admins.length > 0) {
      for (const admin of data.building_admins) {
        await db.run(
          `INSERT INTO building_admins (id, resident_id, building, created_at)
           VALUES (?, ?, ?, ?)`,
          [admin.id, admin.resident_id, admin.building, admin.created_at]
        );
      }
    }

    res.json({ message: '数据恢复成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 统计投票信息
app.get('/api/stats/topic/:id', async (req, res) => {
  try {
    const topic = await db.get('SELECT * FROM topics WHERE id = ?', [req.params.id]);
    const options = await db.all(
      'SELECT id, option_text, votes FROM options WHERE topic_id = ?',
      [req.params.id]
    );
    const totalVotes = await db.get(
      'SELECT COUNT(*) as count FROM votes WHERE topic_id = ?',
      [req.params.id]
    );
    
    res.json({
      topic,
      options,
      totalVotes: totalVotes.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网卡

initDatabase().then(() => {
  app.listen(PORT, HOST, () => {
    const localUrl = `http://localhost:${PORT}`;
    const networkUrl = `http://0.0.0.0:${PORT}`;
    console.log(`✅ Backend running on ${localUrl}`);
    console.log(`✅ Network access on http://<your-ip>:${PORT}`);
    console.log(`📝 API Docs: ${localUrl}/api/docs`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});
