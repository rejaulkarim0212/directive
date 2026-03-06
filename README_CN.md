# Executive Order（中文补充说明）

`README.md` 是本项目中文主文档。
`README_EN.md` 是英文版本。

本文件提供额外的中文补充说明。

## 核心理念

Executive Order 是基于美国宪政框架（1787）的 AI 多 Agent 协作系统。

**核心流程：**

```
President → Chief of Staff → NSC → Senate → OMB → Departments → Supreme Court（争议时）
```

**10 个 Agent：**
- 🏠 Chief of Staff（幕僚长）- 消息分拣
- 📋 NSC（国家安全委员会）- 战略规划
- 🏛️ Senate（参议院）- 审议封否
- 💼 OMB（管理和预算办公室）- 任务调度
- ⚖️ Supreme Court（最高法院）- 争议仲裁
- 🏦 Treasury（财政部）- 数据分析
- 🌐 State（国务院）- 文档规范
- 🛡️ DoD（国防部）- 工程实现
- ⚖️ DoJ（司法部）- 安全合规
- 🔧 Commerce（商务部）- 基础设施

## 核心能力

- **司法仲裁**：最高法院裁决 Agent 间争议（Edict 没有的层级）
- **强制审议**：参议院 Filibuster 机制
- **全流程可观测**：Situation Room 看板 + 时间线 + Agent 活动流
- **实时干预**：停止、取消、恢复、推进
- **低依赖部署**：Python stdlib 后端 + Docker 一键启动

## 快速启动

```bash
git clone https://github.com/your-username/directive.git
cd directive
chmod +x install.sh && ./install.sh

# 终端 1
bash scripts/run_loop.sh

# 终端 2
python3 dashboard/server.py
```

浏览器访问：`http://127.0.0.1:7891`

## 与 Edict 的区别

| 特性 | Edict（三省六部） | Executive Order |
|---|---|---|
| Agent 数量 | 12 | 10（更精简）|
| 司法仲裁 | ❌ | ✅ Supreme Court |
| 审议机制 | 门下省封驳 | 参议院 Filibuster |
| 争议解决 | 无 | 最高法院终局裁决 |

## 详细文档

完整说明请查看：
- `README.md` - 中文完整文档
- `README_EN.md` - 英文版本
- `docs/` - 架构和使用文档

## License

MIT
