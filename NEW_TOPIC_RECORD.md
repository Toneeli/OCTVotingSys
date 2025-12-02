# 新投票议题添加记录

## ✅ 议题信息

### 基本信息
- **议题ID**: 18
- **标题**: 物业费调整方案投票
- **状态**: active (进行中)
- **排序顺序**: 110 (最新议题，显示在所有议题的最前面)
- **创建时间**: 2025-12-01 21:45:53

### 议题描述
```
为更好地服务业主，物业公司拟推出优惠方案。当前物业费标准为3.6元/㎡/月，拟下调30%至2.4元/㎡/月。请选择您的意见：
```

## 🗳️ 投票选项

| 选项ID | 选项文本 | 当前票数 |
|--------|--------|--------|
| 47 | 同意下调，支持2.4元/㎡/月方案 | 0 |
| 48 | 保持现状，维持3.6元/㎡/月 | 0 |
| 49 | 需要更多信息，暂不决定 | 0 |

## 📊 价格对比

| 项目 | 原价 | 新价 | 降幅 |
|------|-----|-----|------|
| 物业费 | 3.6元/㎡/月 | 2.4元/㎡/月 | ↓30% |

### 示例计算（100㎡房子）
- **原月费**: 3.6 × 100 = 360元
- **新月费**: 2.4 × 100 = 240元
- **月度节省**: 360 - 240 = 120元
- **年度节省**: 120 × 12 = 1,440元

## 🔧 技术详情

### 创建方式
- 使用脚本: `add_property_fee_topic.js`
- 数据库: SQLite (voting.db)
- 创建者: admin (ID: 15)

### API端点
- **获取所有议题**: `GET /api/topics`
- **获取该议题**: `GET /api/topics/18`
- **投票**: `POST /api/votes`
  ```json
  {
    "topic_id": 18,
    "option_id": 47  // 或 48 或 49
  }
  ```

### 前端访问
- 访问首页或投票列表页面
- 新议题会显示在最前面（排序顺序=110）
- 点击议题可查看详情并参与投票

## 📝 使用说明

### 业主操作流程
1. 登录系统 (使用业主账号)
2. 进入"投票列表"或"首页"
3. 看到"物业费调整方案投票"议题
4. 点击议题查看详情
5. 选择其中一个选项进行投票
6. 提交投票

### 管理员操作
- **查看投票情况**: 在管理后台查看议题统计
- **修改议题**: 可编辑议题内容和选项
- **删除议题**: 如需删除，在管理后台删除
- **调整排序**: 可修改sort_order值改变显示顺序

## 🔄 后续操作

### 如果需要修改议题
```bash
# 使用以下SQL语句修改
UPDATE topics SET 
  title = '新标题',
  description = '新描述',
  status = '新状态'
WHERE id = 18;
```

### 如果需要删除议题
```bash
# 先删除相关投票记录
DELETE FROM votes WHERE topic_id = 18;

# 再删除选项
DELETE FROM options WHERE topic_id = 18;

# 最后删除议题
DELETE FROM topics WHERE id = 18;
```

### 如果需要修改选项
```bash
# 修改具体选项文本
UPDATE options SET option_text = '新选项文本' WHERE id = 47;

# 或添加新选项
INSERT INTO options (topic_id, option_text, votes) 
VALUES (18, '新选项', 0);
```

## 📈 投票统计查询

### 查看实时投票数据
```bash
curl http://localhost:3001/api/stats/topic/18
```

### 查看投票者信息
```bash
curl http://localhost:3001/api/votes/topic/18
```

### 数据库查询
```bash
# 查看总投票数
sqlite3 voting.db "SELECT SUM(votes) FROM options WHERE topic_id=18;"

# 查看各选项投票数
sqlite3 voting.db "
SELECT option_text, votes 
FROM options 
WHERE topic_id=18 
ORDER BY votes DESC;
"

# 查看谁投过票
sqlite3 voting.db "
SELECT r.username, r.real_name, o.option_text, v.created_at
FROM votes v
JOIN residents r ON v.resident_id = r.id
JOIN options o ON v.option_id = o.id
WHERE v.topic_id = 18
ORDER BY v.created_at DESC;
"
```

## 💾 备份提示

- 如果修改或删除议题，建议先备份数据
- 使用管理后台的"备份数据"功能
- 备份文件包含所有议题和投票数据

## 📱 业主体验

### 前端显示
- ✅ 新议题自动显示在投票列表最前面
- ✅ 议题卡片展示标题和简要描述
- ✅ 点击可查看完整描述和投票选项
- ✅ 登录业主可直接投票
- ✅ 已投票后可查看投票结果
- ✅ 可查看其他投票者的信息

### 权限说明
- ✅ 所有已批准的业主可见和投票
- ✅ 待审核业主无法看到（需先登录，登录前需批准）
- ✅ 每个业主对每个议题只能投票一次
- ✅ 已投票后显示投票结果和参与人数

---

**创建时间**: 2025年12月2日 21:45:53  
**创建脚本**: add_property_fee_topic.js  
**数据库**: voting.db
