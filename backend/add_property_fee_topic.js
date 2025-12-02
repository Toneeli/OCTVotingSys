import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'voting.db'));

async function addPropertyFeeVotingTopic() {
  console.log('开始添加物业费投票议题...\n');

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 插入新的投票议题
      db.run(
        `INSERT INTO topics (title, description, status, created_by, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          '物业费调整方案投票',
          '为更好地服务业主，物业公司拟推出优惠方案。当前物业费标准为3.6元/㎡/月，拟下调30%至2.4元/㎡/月。请选择您的意见：',
          'active',
          15, // admin的ID
          110, // 排序顺序，设置为最高
          new Date().toISOString()
        ],
        function(err) {
          if (err) {
            reject(err);
            return;
          }

          const topicId = this.lastID;
          console.log(`✓ 创建投票议题，ID: ${topicId}`);

          // 定义投票选项
          const options = [
            '同意下调，支持2.4元/㎡/月方案',
            '保持现状，维持3.6元/㎡/月',
            '需要更多信息，暂不决定'
          ];

          let optionCount = 0;

          // 逐个插入投票选项
          options.forEach((optionText, index) => {
            db.run(
              `INSERT INTO options (topic_id, option_text, votes, created_at)
               VALUES (?, ?, ?, ?)`,
              [topicId, optionText, 0, new Date().toISOString()],
              (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                optionCount++;
                console.log(`✓ 添加选项 ${index + 1}: ${optionText}`);

                // 当所有选项都添加完成时
                if (optionCount === options.length) {
                  console.log('\n=================================');
                  console.log('✅ 投票议题添加完成！');
                  console.log('=================================');
                  console.log('\n议题详情：');
                  console.log('标题: 物业费调整方案投票');
                  console.log('描述: 当前3.6元/㎡/月 → 拟下调30%至2.4元/㎡/月');
                  console.log('状态: active (进行中)');
                  console.log('排序顺序: 110 (最新议题)');
                  console.log('\n投票选项：');
                  options.forEach((opt, idx) => {
                    console.log(`  ${idx + 1}. ${opt}`);
                  });
                  console.log('=================================\n');

                  db.close();
                  resolve();
                }
              }
            );
          });
        }
      );
    });
  });
}

// 运行添加
addPropertyFeeVotingTopic().catch(err => {
  console.error('添加失败:', err);
  process.exit(1);
});
