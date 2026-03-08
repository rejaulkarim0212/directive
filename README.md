<h1 align=”center”>⚖️ Executive Order</h1>

> **⚠️ INCUBATION NOTICE**
> This project is currently in final incubation phase. Core architecture is complete and functional, but full integration testing is underway. Expected to be production-ready within 1-2 days. Watch this repo for updates.

<p align=”center”>
  <strong>我用 237 年前的美国宪法制度，重新设计了 AI 多 Agent 协作架构。<br>结果发现，1787 年费城那个没有空调的夏天，吵出来的架构，比你的 YAML config 文件更经得起压力测试。</strong>
</p>

<p align=”center”>
  <sub>10 个 AI Agent，基于美国宪政框架：幕僚长分拣 → NSC 规划 → 参议院审议封否 → OMB 派发 → 各部并行执行 → 最高法院裁决争议。<br>比 Edict 少 2 个冗余角色，多 1 个 Edict 没有的——<b>司法仲裁层</b>。</sub>
</p>

<p align="center">
  <a href="#-demo">🎬 Demo</a> ·
  <a href="#-30-秒快速体验">🚀 30 秒体验</a> ·
  <a href="#-架构">🏛️ 架构</a> ·
  <a href="#-功能全景">📋 看板功能</a> ·
  <a href="docs/task-dispatch-architecture.md">📚 架构文档</a> ·
  <a href="README_EN.md">English</a> ·
  <a href="README_CN.md">中文补充</a> ·
  <a href="CONTRIBUTING.md">参与贡献</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OpenClaw-Required-blue?style=flat-square" alt="OpenClaw">
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Agents-13_Specialized-8B5CF6?style=flat-square" alt="Agents">
  <img src="https://img.shields.io/badge/Dashboard-Real--time-F59E0B?style=flat-square" alt="Dashboard">
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Frontend-React_18-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Backend-stdlib_only-EC4899?style=flat-square" alt="Zero Backend Dependencies">
</p>

---

## 📸 界面预览

<p align="center">
  <img src="asset/entry.png" alt="Entry Page" width="80%">
  <br>
  <sub>🚪 入口页面 - 总统就职典礼</sub>
</p>

<p align="center">
  <img src="asset/main.png" alt="Main Dashboard" width="80%">
  <br>
  <sub>🏛️ Situation Room 主看板 - 实时监控各部门状态</sub>
</p>

---

## 🤔 为什么是美国宪法？

美国宪法做了一件事：

**司法审查（Judicial Review）**

最高法院可以推翻行政命令，宣布任何机构的行为违宪。

在 AI Agent 协作里，这意味着什么？

当两个 Agent 产出冲突、当某个 Agent 越权行事、当规划层和执行层对结果有争议——**谁来裁决？**

Edict 没有这一层。CrewAI 没有。AutoGen 没有。

**1787 年的麦迪逊已经想好了。**

- 参议院 Agent 拥有 filibuster 权。我们认真考虑过让它对糟糕的执行计划持续输出反对意见直到超时。最终没有实装。
- 最高法院是本项目相对于 Edict 新增的角色。当两个 Agent 的输出互相矛盾、谁都不肯认输的时候，案子提交最高法院，大法官终身任职，没有 retry。

麦迪逊在 1787 年写《联邦党人文集》第 51 篇的时候说过：

> “If men were angels, no government would be necessary.”

**AI 不是天使。所以我们给它造了个政府。**

```
你 (President) → 幕僚长 (Triage) → NSC (Planning) → 参议院 (Review)
      ↑                                                      ↓
最高法院 (Arbitration) ←——— 争议上诉 ←——— OMB (Dispatch)
      ↓ 裁决                                     ↓
                              各部并行执行 → 汇报总统
```

## 📊 与同类框架对比

| | CrewAI | MetaGPT | AutoGen | Edict (三省六部) | Executive Order |
|---|:---:|:---:|:---:|:---:|:---:|
| 审核机制 | ❌ | ⚠️ 可选 | ⚠️ Human-in-loop | ✅ 门下省封驳 | ✅ 参议院 filibuster |
| 司法仲裁 | ❌ | ❌ | ❌ | ❌ | **✅ 最高法院裁决** |
| 实时看板 | ❌ | ❌ | ❌ | ✅ | ✅ Situation Room |
| 任务干预 | ❌ | ❌ | ❌ | ✅ | ✅ 总统否决权 |
| 完整审计 | ⚠️ | ⚠️ | ❌ | ✅ | ✅ Congressional Record |
| Agent 健康监控 | ❌ | ❌ | ❌ | ✅ | ✅ |
| 热切换模型 | ❌ | ❌ | ❌ | ✅ | ✅ |
| Agent 数量 | 自定义 | 自定义 | 自定义 | 12 | **10（更精简）** |
| 部署难度 | 中 | 高 | 中 | 低 | **低 · Docker 一键** |

**核心差异：制度性审核 + 司法仲裁 + 完全可观测 + 实时可干预**

---

## 🏛️ 十个 Agent 完整架构

### 流转路径

```
┌─────────────────────────────────────────┐
│           👔 President（你）              │
│     Slack · Telegram · Signal · Email    │
└──────────────────┬──────────────────────┘
                   │ Executive Order
┌──────────────────▼──────────────────────┐
│         🏠 Chief of Staff               │
│   Triage: 闲聊直接回 / 任务才建单          │
└──────────────────┬──────────────────────┘
                   │ Briefing
┌──────────────────▼──────────────────────┐
│    📋 National Security Council (NSC)   │
│       接令 → 规划 → 拆解子任务             │
└──────────────────┬──────────────────────┘
                   │ Submit for Review
┌──────────────────▼──────────────────────┐
│           🏛️ Senate                     │
│    Hearing → Approve / Filibuster 🚫    │
└──────────────────┬──────────────────────┘
                   │ Approved ✅
┌──────────────────▼──────────────────────┐
│    💼 OMB (Office of Mgmt & Budget)     │
│   Dispatch → Coordinate → Consolidate   │
└──┬─────┬──────┬──────┬──────┬───────────┘
   │     │      │      │      │
┌──▼──┐ ┌▼────┐ ┌▼───┐ ┌▼───┐ ┌▼──────┐
│ 🏦  │ │ 🌐  │ │ 🛡️ │ │ ⚖️ │ │  🔧   │
│Treasury│State│ DOD │ DOJ │Commerce│
└─────┘ └─────┘ └────┘ └────┘ └───────┘
          争议上诉 ↓
┌─────────────────────────────────────────┐
│         ⚖️ Supreme Court                │
│  Dispute Resolution · Final Ruling      │
└─────────────────────────────────────────┘
```

### 👥 十个 Agent 详细职责

#### 🏠 Chief of Staff（幕僚长）
**Agent ID:** `chief_of_staff`

**现实对应：** 白宫幕僚长（Chief of Staff）。历史上 James Baker 干这个干得最好——他不是决策者，他是总统的时间和注意力的门神。

**在系统中的作用：**
所有进入系统的消息都先过他这关。他做且只做一件事：判断这条消息值不值得建任务。

- 闲聊、打招呼、问天气 → 直接回复，不建单，不浪费后续 Agent 的 token
- 真正的任务 → 提炼需求，生成结构化标题，传递给 NSC
- 数据清洗：剥离用户消息里的文件路径、多余元数据、无意义前缀

**权限：** 只能发消息给 NSC，任何人都可以发消息给他。他是唯一的入口。

---

#### 📋 National Security Council — NSC（国家安全委员会）
**Agent ID:** `nsc`

**现实对应：** 国家安全委员会是美国最高级别的政策协调机构，汇集国防部、国务院、CIA、财政部的顶层代表，专门做跨部门的战略规划。它不执行，它只规划。

**在系统中的作用：**
接收幕僚长传来的任务，做深度规划：

- 理解任务全貌和隐含需求
- 判断需要哪些部门参与
- 将任务拆解为结构化子任务
- 确定每个子任务的负责部门、优先级、依赖关系
- 输出完整的执行方案提交参议院审议

**权限：** 接收 Chief of Staff 传来的任务 → 规划后提交给参议院。

---

#### 🏛️ Senate（参议院）
**Agent ID:** `senate`

**现实对应：** 美国参议院对行政提案有确认权和否决权。参议院的 filibuster 机制允许少数派通过无限期辩论阻止法案通过——这是世界上最强的制度性否决工具之一。

**在系统中的作用：**
这是整个系统的质量关卡，也是核心卖点。

NSC 的规划方案必须经过参议院审议才能放行。参议院会检查：

- 任务拆解是否完备，有没有遗漏关键子任务？
- 部门分配是否合理，有没有越权或错配？
- 方案中有没有潜在的安全风险或合规问题？
- 预期输出是否清晰，执行层能否依据此方案行动？

审议结果只有两种：**Approved（通过）**或 **Filibuster（封否，打回重规划）**。

封否时必须附带明确的修改意见，NSC 必须按意见重新规划，重新提交，直到通过为止。

**为什么这是杀手锏：** 其他框架是"做完就交"——没有人检查质量。参议院的存在使得系统在执行前就已经完成了一次强制质量审查。

**权限：** 接收 NSC 方案 → 通过后发给 OMB / 封否后打回 NSC。

---

#### 💼 OMB — Office of Management and Budget（管理和预算办公室）
**Agent ID:** `omb`

**现实对应：** OMB 是美国联邦政府最强大的内部协调机构，负责联邦预算分配、跨部门任务协调，以及对各部门的绩效监督。所有联邦法规在发布前都必须经过 OMB 审查。

**在系统中的作用：**
参议院通过后，OMB 接管执行协调：

- 将 NSC 的规划方案解析为具体任务单，分配给对应部门
- 实时跟踪各部门的执行进度
- 处理部门间的依赖和阻塞
- 当某部门完成后，触发依赖它的下游部门
- 所有部门完成后，汇总结果，生成最终报告，回报总统

**权限：** 接收参议院放行的任务 → 分发给五个执行部门 → 接收各部门回报 → 汇总上报总统。

---

#### ⚖️ Supreme Court（最高法院）
**Agent ID:** `supreme_court`

**现实对应：** 美国最高法院的核心权力是 Judicial Review——任何联邦机构的行为，如果被认为违宪，最高法院可以将其推翻。这个权力在 Marbury v. Madison（1803）确立。

**在系统中的作用（Edict 没有的角色）：**

这是 Executive Order 相比 Edict 最重要的新增层。

**触发场景：**

- **部门冲突**：Treasury（财政部）和 DOJ（司法部）对同一数据的解读出现矛盾，谁的结论算数？
- **越权行为**：某个执行部门的输出超出了其职责范围，应该采信还是打回？
- **方案争议**：NSC 和 Senate 对某个方案的合规性存在根本分歧，无法通过正常流程解决
- **结果异议**：OMB 汇总的最终结果，某部门认为其贡献被错误归因，需要仲裁
- **紧急叫停**：任何 Agent 认为当前任务走向有根本性问题，可上诉最高法院要求暂停并裁决

最高法院的裁决是终局的，任何 Agent 都不能再次挑战。裁决结果写入任务审计日志（Congressional Record），作为永久记录。

**权限：** 被动接受上诉，主动有权暂停任何任务。对所有 Agent 有单向影响力，但不参与日常流程。

#### 🏦 Treasury Department（财政部）
**Agent ID:** `treasury`

**现实对应：** 美国财政部管理国家财政、货币政策、经济数据统计，负责一切数字相关的事务。

**在系统中的作用：** 系统的数据与分析引擎。

- 数据处理、清洗、统计分析
- 生成报表、仪表盘、数据可视化
- 成本核算、Token 消耗统计
- 竞品数据对比分析
- 任何需要"拿数字说话"的任务

**擅长：** Python 数据处理、SQL 查询、数据报告生成、Excel/CSV 分析

---

#### 🌐 State Department（国务院）
**Agent ID:** `state_dept`

**现实对应：** 美国国务院负责外交事务，核心工作是沟通、表达、文件——外交照会、条约文本、声明起草，全是文字工作。

**在系统中的作用：** 系统的文档与规范引擎。

- 技术文档、API 文档、用户手册
- 规范制定、代码注释标准、架构说明文档
- 对外沟通材料：邮件文案、博客文章、产品说明
- 会议纪要、周报、执行摘要
- 任何需要"把事情说清楚"的任务

**擅长：** Markdown、技术写作、多格式文档输出、多语言翻译

---

#### 🛡️ Department of Defense / DARPA（国防部）
**Agent ID:** `dod`

**现实对应：** 国防部负责实际的"作战执行"。DARPA 是国防部下属的高级研究机构，互联网本身就是 DARPA 的产物。

**在系统中的作用：** 系统的工程实现引擎，也是最核心的执行部门。

- 功能开发、Bug 修复、代码审查
- 算法设计、性能优化
- 单元测试、集成测试编写
- 技术方案评估和原型实现
- 任何需要"写代码"的任务

**擅长：** Python、TypeScript、Go、Rust、系统架构设计

---

#### ⚖️ Department of Justice（司法部）
**Agent ID:** `doj`

**现实对应：** 美国司法部执行联邦法律，FBI 是其下属机构。负责法律合规、犯罪调查、执法监督。

**在系统中的作用：** 系统的安全合规引擎。

- 安全扫描、漏洞检测
- 代码合规审查（License、隐私、数据合规）
- 依赖项安全检查（CVE 扫描）
- Secret/密钥泄露检测
- 红线管控：任何任务中涉及敏感操作，必须经过 DOJ 确认
- 生成合规报告

**擅长：** OWASP 安全规范、GDPR/CCPA 合规、依赖安全扫描、渗透测试思路

---

#### 🔧 Department of Commerce / NIST（商务部）
**Agent ID:** `commerce`

**现实对应：** 美国商务部管理标准和基础设施。NIST（国家标准与技术研究院）是其下属机构，制定了大量技术标准，包括著名的 NIST 网络安全框架。

**在系统中的作用：** 系统的基础设施与工具引擎。

- CI/CD 流水线设计与维护
- Docker 配置、docker-compose、Kubernetes
- 云基础设施（AWS/GCP/Azure）配置
- 自动化脚本、部署方案
- 开发环境标准化、工具链配置
- 监控告警配置

**擅长：** Docker、GitHub Actions、Terraform、Shell 脚本、云平台配置

---

### 🗺️ 权限矩阵

不是想发就能发，这是宪政框架下的权力边界。

| From ↓ \ To → | Chief of Staff | NSC | Senate | OMB | Treasury | State | DoD | DoJ | Commerce | Supreme Court |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| President | ✅ | | | | | | | | | |
| Chief of Staff | — | ✅ | | | | | | | | |
| NSC | ✅ | — | ✅ | | | | | | | ⚠️ 上诉 |
| Senate | | ✅ | — | ✅ | | | | | | ⚠️ 上诉 |
| OMB | | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ 上诉 |
| 五个执行部门 | | | | ✅ | | | | | | ⚠️ 上诉 |
| Supreme Court | | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |

⚠️ 上诉 = 只能在争议时触发，不参与日常消息流

---

### 📋 任务状态机

```
President下令 → 幕僚长分拣 → NSC规划 → 参议院审议 → OMB派发 → 执行中 → 待审查 → ✅ 完成
                                  ↑         │                              │
                                  └── Filibuster 打回 ──┘                  ↓
                                                                   ⚖️ 最高法院裁决（争议时）
                                                                           │
                                                                    Blocked / Resume
```

**九种任务状态：**

- `pending` 待分拣
- `planning` NSC 规划中
- `under_review` 参议院审议中
- `filibustered` 被封否，打回重规划
- `dispatched` OMB 已派发
- `in_progress` 执行中
- `pending_review` 待最终审查
- `blocked` 争议阻塞，等待最高法院裁决
- `completed` 已完成，归档为 Executive Record

---

## ✨ 功能全景

### 📋 Situation Room 看板（对应 Edict 军机处）

**10 个功能面板：**

1. **📋 Order Board · 任务看板** — 按状态列展示全部 Executive Order，部门过滤 + 全文搜索，心跳徽章（🟢 Active 🟡 Stalled 🔴 Alert），完整任务流转链每一步都有时间戳，暂停 / 取消 / 恢复操作。

2. **🔭 Agency Monitor · 部门监控** — 各状态任务数量可视化，部门负载横向条形图，每个 Agent 的健康状态实时卡片。

3. **📜 Executive Records · 执行档案** — 已完成 Order 自动归档，五阶段时间线：下令 → NSC → 参议院 → 执行 → 完成，一键导出为 Markdown，最高法院裁决记录单独标注。

4. **📜 Order Templates · 命令模板库** — 9 个预设模板，参数表单 · 预估时间和 Token 费用，预览 → 一键下令。

5. **👥 Agency Personnel · 官员总览** — Token 消耗排行，活跃度 · 完成数 · 会话统计。

6. **⚖️ Docket · 最高法院案件栏**（新增，Edict 没有）— 当前待裁决案件列表，历史裁决记录，每个裁决的理由和影响范围。

7. **📰 Intelligence Brief · 情报简报** — 每日科技/商业资讯聚合，分类订阅 + Slack/Email 推送。

8. **⚙️ Model Config · 模型配置** — 每个 Agent 独立切换 LLM，应用后自动重启 Gateway。

9. **🛠️ Skills Config · 技能配置** — 各部门已安装 Skills 一览，查看详情 + 添加新技能。

10. **🎬 Inauguration · 就职典礼** — 每日首次打开播放开场动画，今日统计 · 3.5 秒自动消失。

---

## 🚀 快速体验

### Docker 一键启动

```bash
docker run -p 7891:7891 your-username/directive
```

打开 http://localhost:7891

### 完整安装

```bash
git clone https://github.com/your-username/directive.git
cd directive
chmod +x install.sh && ./install.sh
```

启动服务：

```bash
# 终端 1：数据刷新循环
bash scripts/run_loop.sh

# 终端 2：看板服务器
python3 dashboard/server.py

# 打开浏览器
open http://127.0.0.1:7891
```

---

## 🏗️ 项目结构

```
directive/
├── agents/
│   ├── chief_of_staff/SOUL.md     # 消息分拣 · 任务识别 · 数据清洗
│   ├── nsc/SOUL.md                # 战略规划 · 任务拆解 · 方案设计
│   ├── senate/SOUL.md             # 审议把关 · Filibuster · 质量标准
│   ├── omb/SOUL.md                # 任务调度 · 进度跟踪 · 结果整合
│   ├── supreme_court/SOUL.md      # 争议仲裁 · 终局裁决 · 越权纠正
│   ├── treasury/SOUL.md           # 数据分析 · 报表生成 · 成本核算
│   ├── state_dept/SOUL.md         # 文档规范 · 技术写作 · 沟通材料
│   ├── dod/SOUL.md                # 工程实现 · 代码开发 · 算法设计
│   ├── doj/SOUL.md                # 安全合规 · 审计扫描 · 红线管控
│   └── commerce/SOUL.md           # CI/CD · 部署 · 基础设施
├── dashboard/
│   ├── situation_room.html        # Situation Room 看板（单文件 · 零依赖）
│   └── server.py                  # API 服务器（Python stdlib · 零依赖）
├── scripts/
│   ├── run_loop.sh                # 数据刷新循环（每 15 秒）
│   ├── kanban_update.py           # 看板 CLI
│   ├── skill_manager.py           # Skills 管理工具
│   └── file_lock.py               # 文件锁
├── tests/
│   └── test_e2e.py                # 端到端测试
├── docs/
│   ├── architecture.md            # 完整架构文档
│   ├── getting-started.md         # 快速上手
│   └── screenshots/
├── install.sh
├── docker-compose.yml
├── CONTRIBUTING.md
└── LICENSE
```

---

## 📁 项目结构

```text
directive/
├── agents/
│   ├── chief_of_staff/
│   ├── nsc/
│   ├── wh_counsel/
│   ├── omb/
│   ├── cabinet_sec/
│   ├── treasury/
│   ├── state/
│   ├── defense/
│   ├── justice/
│   ├── commerce/
│   ├── opm/
│   └── press_sec/
├── dashboard/
│   ├── dashboard.html
│   ├── server.py
│   └── dist/
├── scripts/
│   ├── run_loop.sh
│   ├── kanban_update.py
│   ├── sync_from_openclaw_runtime.py
│   ├── sync_agent_config.py
│   ├── sync_officials_stats.py
│   ├── skill_manager.py
│   └── ...
├── docs/
├── tests/
└── install.sh
```

---

## 🎯 使用示例

通过 Slack / Telegram / Signal 给 Chief of Staff 发消息：

```
Design a user authentication system:
1. RESTful API (FastAPI)
2. PostgreSQL + JWT
3. Full test coverage
4. Deployment docs
5. Security audit included
```

然后在 Situation Room 看全程：

1. 🏠 Chief of Staff 识别为任务，提炼需求，传递 NSC
2. 📋 NSC 规划：拆解为 5 个子任务，分配 DoD + Commerce + State + DoJ
3. 🏛️ Senate 审议：通过（附注：需要 DoJ 重点审查 JWT 实现安全性）
4. 💼 OMB 派发：DoD 开始写代码，Commerce 搭 CI/CD，State 写文档，DoJ 做安全扫描
5. ⚖️ 途中 DoD 和 DoJ 对某段代码的安全性产生争议 → 上诉最高法院 → 裁决：采用 DoJ 建议
6. ✅ OMB 汇总，回报总统，自动归档为 Executive Record

---

## 🗺️ Roadmap

详见 [ROADMAP.md](ROADMAP.md)

---

## 🙏 致谢

本项目架构灵感来源于：

- [wanikua/boluobobo-ai-court-tutorial](https://github.com/wanikua/boluobobo-ai-court-tutorial) - AI 法庭教程
- [cft0808/edict](https://github.com/cft0808/edict) - 三省六部架构
- 美国宪法（1787）- 分权制衡与司法审查

---

## 📄 License

MIT
