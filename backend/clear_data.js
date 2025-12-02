import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'voting.db'));

async function clearDataExceptAdmin() {
  console.log('开始清空数据（保留超级管理员）...\n');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. 删除所有投票记录
      db.run('DELETE FROM votes', (err) => {
        if (err) reject(err);
        else console.log('✓ 删除投票记录');
      });

      // 2. 删除所有投票话题选项
      db.run('DELETE FROM options', (err) => {
        if (err) reject(err);
        else console.log('✓ 删除投票话题选项');
      });

      // 3. 删除所有投票话题
      db.run('DELETE FROM topics', (err) => {
        if (err) reject(err);
        else console.log('✓ 删除投票话题');
      });

      // 4. 删除楼栋管理员记录
      db.run('DELETE FROM building_admins', (err) => {
        if (err) reject(err);
        else console.log('✓ 删除楼栋管理员记录');
      });

      // 5. 删除除了admin外的所有业主
      db.run("DELETE FROM residents WHERE username != 'admin'", (err) => {
        if (err) reject(err);
        else console.log('✓ 删除其他业主数据');
      });

      // 6. 验证admin账户还在
      db.get(
        "SELECT id, username, real_name, status FROM residents WHERE username = 'admin'",
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            console.log('\n=================================');
            console.log('✅ 数据清空完成！');
            console.log('=================================');
            console.log('\n保留的超级管理员账号：');
            console.log(`ID: ${row.id}`);
            console.log(`用户名: ${row.username}`);
            console.log(`姓名: ${row.real_name}`);
            console.log(`状态: ${row.status}`);
            console.log('\n登录命令: admin / 895600');
            console.log('=================================\n');
            db.close();
            resolve();
          } else {
            console.error('错误：超级管理员账号不存在！');
            db.close();
            reject(new Error('Admin account not found'));
          }
        }
      );
    });
  });
}

// 运行清空
clearDataExceptAdmin().catch(err => {
  console.error('清空失败:', err);
  process.exit(1);
});
