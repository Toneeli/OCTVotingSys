import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'voting.db'));

async function initTestData() {
  console.log('开始初始化测试数据...');

  // 清空现有数据（保留超级管理员）
  await new Promise((resolve, reject) => {
    db.run(`DELETE FROM votes`, (err) => {
      if (err) reject(err);
      else {
        console.log('✓ 清空投票记录');
        resolve();
      }
    });
  });

  await new Promise((resolve, reject) => {
    db.run(`DELETE FROM topics`, (err) => {
      if (err) reject(err);
      else {
        console.log('✓ 清空投票话题');
        resolve();
      }
    });
  });

  await new Promise((resolve, reject) => {
    db.run(`DELETE FROM residents WHERE username != 'admin'`, (err) => {
      if (err) reject(err);
      else {
        console.log('✓ 清空业主数据（保留超级管理员）');
        resolve();
      }
    });
  });

  // 准备密码哈希
  const passwordHash = await bcrypt.hash('password', 10);
  console.log('✓ 生成密码哈希');

  // 1. 添加楼栋管理员
  const buildingAdmins = [
    { username: 'liz', real_name: '李管理', building: 'T4栋', unit_number: '401', phone: '13800001001' },
    { username: 'wangadmin', real_name: '王管理', building: 'T5栋', unit_number: '501', phone: '13800001002' },
    { username: 'zhangadmin', real_name: '张管理', building: 'T6栋', unit_number: '601', phone: '13800001003' },
  ];

  for (const admin of buildingAdmins) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO residents (username, password, real_name, building, unit_number, phone, status, is_building_admin, managed_building)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', 1, ?)`,
        [admin.username, passwordHash, admin.real_name, admin.building, admin.unit_number, admin.phone, admin.building],
        (err) => {
          if (err) reject(err);
          else {
            console.log(`✓ 添加楼栋管理员: ${admin.real_name} (${admin.building})`);
            resolve();
          }
        }
      );
    });
  }

  // 2. 添加普通业主（已批准）
  const approvedResidents = [
    // T4栋
    { username: 'zhang', real_name: '张三', building: 'T4栋', unit_number: '402', phone: '13900001001' },
    { username: 'li', real_name: '李四', building: 'T4栋', unit_number: '403', phone: '13900001002' },
    { username: 'wang', real_name: '王五', building: 'T4栋', unit_number: '404', phone: '13900001003' },
    { username: 'zhao', real_name: '赵六', building: 'T4栋', unit_number: '405', phone: '13900001004' },
    { username: 'qian', real_name: '钱七', building: 'T4栋', unit_number: '406', phone: '13900001005' },
    
    // T5栋
    { username: 'sun', real_name: '孙八', building: 'T5栋', unit_number: '502', phone: '13900001006' },
    { username: 'zhou', real_name: '周九', building: 'T5栋', unit_number: '503', phone: '13900001007' },
    { username: 'wu', real_name: '吴十', building: 'T5栋', unit_number: '504', phone: '13900001008' },
    { username: 'zheng', real_name: '郑十一', building: 'T5栋', unit_number: '505', phone: '13900001009' },
    { username: 'chen', real_name: '陈十二', building: 'T5栋', unit_number: '506', phone: '13900001010' },
    
    // T6栋
    { username: 'huang', real_name: '黄十三', building: 'T6栋', unit_number: '602', phone: '13900001011' },
    { username: 'xu', real_name: '徐十四', building: 'T6栋', unit_number: '603', phone: '13900001012' },
    { username: 'lin', real_name: '林十五', building: 'T6栋', unit_number: '604', phone: '13900001013' },
    { username: 'he', real_name: '何十六', building: 'T6栋', unit_number: '605', phone: '13900001014' },
    { username: 'gao', real_name: '高十七', building: 'T6栋', unit_number: '606', phone: '13900001015' },
  ];

  for (const resident of approvedResidents) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO residents (username, password, real_name, building, unit_number, phone, status, is_building_admin)
         VALUES (?, ?, ?, ?, ?, ?, 'approved', 0)`,
        [resident.username, passwordHash, resident.real_name, resident.building, resident.unit_number, resident.phone],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log(`✓ 添加 ${approvedResidents.length} 个已批准业主`);

  // 3. 添加待审核业主
  const pendingResidents = [
    { username: 'liu', real_name: '刘十八', building: 'T4栋', unit_number: '407', phone: '13900001016' },
    { username: 'song', real_name: '宋十九', building: 'T5栋', unit_number: '507', phone: '13900001017' },
    { username: 'tang', real_name: '唐二十', building: 'T6栋', unit_number: '607', phone: '13900001018' },
    { username: 'feng', real_name: '冯二一', building: 'T4栋', unit_number: '408', phone: '13900001019' },
    { username: 'han', real_name: '韩二二', building: 'T5栋', unit_number: '508', phone: '13900001020' },
  ];

  for (const resident of pendingResidents) {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO residents (username, password, real_name, building, unit_number, phone, status, is_building_admin)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`,
        [resident.username, passwordHash, resident.real_name, resident.building, resident.unit_number, resident.phone],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
  console.log(`✓ 添加 ${pendingResidents.length} 个待审核业主`);

  // 4. 添加投票话题和选项
  const topics = [
    {
      title: '小区停车费调整方案投票',
      description: '根据物业管理成本上涨，拟调整停车费标准。A方案：月卡500元；B方案：月卡600元；C方案：维持现状400元',
      options: [
        { label: 'A方案（500元/月）', votes: 12 },
        { label: 'B方案（600元/月）', votes: 5 },
        { label: 'C方案（维持400元/月）', votes: 8 }
      ],
      status: 'active',
      sort_order: 100
    },
    {
      title: '小区健身房改造意见征集',
      description: '为提升业主生活品质，拟对小区健身房进行改造升级，请投票选择您希望的改造方案',
      options: [
        { label: '增加器械设备', votes: 15 },
        { label: '增设瑜伽室', votes: 10 },
        { label: '增加游泳池', votes: 8 },
        { label: '暂不改造', votes: 2 }
      ],
      status: 'active',
      sort_order: 90
    },
    {
      title: '小区绿化改造方案',
      description: '为美化小区环境，拟进行绿化改造，请选择您认为最重要的改造项目',
      options: [
        { label: '增加花圃', votes: 18 },
        { label: '种植大树', votes: 12 },
        { label: '增加休闲座椅', votes: 15 }
      ],
      status: 'pending',
      sort_order: 80
    },
    {
      title: '小区安防系统升级',
      description: '为提高小区安全性，拟升级安防系统，请投票选择升级方案',
      options: [
        { label: '增加摄像头', votes: 20 },
        { label: '升级门禁系统', votes: 16 },
        { label: '增加保安巡逻', votes: 9 }
      ],
      status: 'active',
      sort_order: 70
    },
    {
      title: '小区公共区域WiFi覆盖',
      description: '是否需要在小区公共区域增设免费WiFi？',
      options: [
        { label: '非常需要', votes: 25 },
        { label: '可有可无', votes: 8 },
        { label: '不需要', votes: 3 }
      ],
      status: 'active',
      sort_order: 60
    },
    {
      title: '小区儿童游乐设施更新',
      description: '小区儿童游乐设施老化，拟进行更新，请选择您期望的设施类型',
      options: [
        { label: '大型滑梯组合', votes: 14 },
        { label: '秋千跷跷板', votes: 11 },
        { label: '沙池区域', votes: 7 },
        { label: '攀岩墙', votes: 4 }
      ],
      status: 'closed',
      sort_order: 50
    }
  ];

  for (const topic of topics) {
    const topicId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO topics (title, description, status, sort_order, created_at)
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [topic.title, topic.description, topic.status, topic.sort_order],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    // 添加该话题的选项
    for (const option of topic.options) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO options (topic_id, option_text, votes, created_at)
           VALUES (?, ?, ?, datetime('now'))`,
          [topicId, option.label, option.votes],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
  }
  console.log(`✓ 添加 ${topics.length} 个投票话题及其选项`);

  console.log('\n=================================');
  console.log('✅ 测试数据初始化完成！');
  console.log('=================================');
  console.log('\n测试账号信息：');
  console.log('1. 超级管理员：admin / 895600');
  console.log('2. 楼栋管理员：');
  console.log('   - liz / password (T4栋)');
  console.log('   - wangadmin / password (T5栋)');
  console.log('   - zhangadmin / password (T6栋)');
  console.log('3. 普通业主：zhang, li, wang 等 / password');
  console.log('4. 待审核业主：liu, song, tang 等 / password');
  console.log('\n数据统计：');
  console.log(`- 楼栋管理员：${buildingAdmins.length} 人`);
  console.log(`- 已批准业主：${approvedResidents.length} 人`);
  console.log(`- 待审核业主：${pendingResidents.length} 人`);
  console.log(`- 投票话题：${topics.length} 个`);
  console.log('=================================\n');

  db.close();
}

// 运行初始化
initTestData().catch(err => {
  console.error('初始化失败:', err);
  process.exit(1);
});
