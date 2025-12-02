import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';

/**
 * 初始化测试数据
 * 用于快速测试投票系统
 * 运行: node init-test-data.js
 */

async function initTestData() {
  const db = await open({
    filename: './voting.db',
    driver: sqlite3.Database
  });

  console.log('🔄 初始化测试数据...\n');

  try {
    // 创建测试用户
    const adminPassword = await bcrypt.hash('admin895600', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // 插入管理员账户
    await db.run(
      `INSERT OR IGNORE INTO residents (id, username, password, real_name, building, unit_number, phone, status)
       VALUES (1, 'admin', ?, '张管理', 'T1栋', '1-A1', '13800138000', 'approved')`,
      [adminPassword]
    );

    // 插入普通用户账户
    await db.run(
      `INSERT OR IGNORE INTO residents (username, password, real_name, building, unit_number, phone, status)
       VALUES (?, ?, '李用户', 'T2栋', '2-201', '13900139000', 'approved')`,
      ['user', userPassword]
    );

    // 插入楼栋管理员账户 (T2栋)
    const buildingAdminPassword = await bcrypt.hash('buildingadmin123', 10);
    await db.run(
      `INSERT OR IGNORE INTO residents (username, password, real_name, building, unit_number, phone, status, is_building_admin, managed_building)
       VALUES (?, ?, '王楼栋', 'T2栋', '2-101', '13700137000', 'approved', 1, ?)`,
      ['buildingadmin', buildingAdminPassword, 'T2栋']
    );

    console.log('✅ 业主账户创建成功');
    console.log('📝 超级管理员账户:');
    console.log('   用户名: admin');
    console.log('   密码: admin895600');
    console.log('   楼栋: T1栋');
    console.log('📝 普通业主账户:');
    console.log('   用户名: user');
    console.log('   密码: user123');
    console.log('   楼栋: T2栋');
    console.log('📝 楼栋管理员账户:');
    console.log('   用户名: buildingadmin');
    console.log('   密码: buildingadmin123');
    console.log('   楼栋: T2栋 (管理员)\n');

    // 创建测试投票议题
    const topicResult = await db.run(
      `INSERT INTO topics (title, description, created_by, status)
       VALUES (?, ?, ?, ?)`,
      [
        '小区物业费调整方案',
        '尊敬的各位业主，由于近年来物业服务成本增加，物业公司提议调整物业费。本次投票将决定是否同意将物业费从每平方米2.5元调整至3.5元。请各位业主踊跃投票，投票结果将于本周五公布。',
        1,
        'active'
      ]
    );

    const topicId = topicResult.lastID;

    // 创建投票选项
    const options = ['同意', '不同意', '弃权'];
    for (const option of options) {
      await db.run(
        `INSERT INTO options (topic_id, option_text) VALUES (?, ?)`,
        [topicId, option]
      );
    }

    console.log('✅ 投票议题创建成功');
    console.log(`📋 议题: 小区物业费调整方案`);
    console.log(`   状态: 进行中`);
    console.log(`   选项: 同意、不同意、弃权\n`);

    // 创建第二个测试议题
    const topic2Result = await db.run(
      `INSERT INTO topics (title, description, created_by, status)
       VALUES (?, ?, ?, ?)`,
      [
        '小区绿化改造计划',
        '为了提升小区环境品质，物业提出了一个绿化改造计划。该计划包括重新设计景观、增加花卉种植、维护草坪等。请问您是否同意实施这个绿化改造计划？',
        1,
        'active'
      ]
    );

    const topic2Id = topic2Result.lastID;

    const options2 = ['支持', '反对', '无意见'];
    for (const option of options2) {
      await db.run(
        `INSERT INTO options (topic_id, option_text) VALUES (?, ?)`,
        [topic2Id, option]
      );
    }

    console.log('✅ 第二个投票议题创建成功');
    console.log(`📋 议题: 小区绿化改造计划`);
    console.log(`   状态: 进行中`);
    console.log(`   选项: 支持、反对、无意见\n`);

    console.log('🎉 测试数据初始化完成！');
    console.log('\n接下来你可以：');
    console.log('1. 使用 admin/admin895600 登录到管理后台');
    console.log('2. 审核其他用户');
    console.log('3. 使用 user/user123 账户进行投票');
    console.log('4. 查看投票统计结果\n');

  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await db.close();
  }
}

initTestData();
