# 🚀 Quick Start Guide

> Build your Executive Order AI collaboration system in 5 minutes

---

## Step 1: Install OpenClaw

Executive Order is based on [OpenClaw](https://openclaw.ai). Install it first:

```bash
# macOS
brew install openclaw

# Or download installer
# https://openclaw.ai/download
```

Initialize after installation:

```bash
openclaw init
```

## Step 2: Clone and Install Executive Order

```bash
git clone https://github.com/your-username/directive.git
cd directive
chmod +x install.sh && ./install.sh
```

The install script automatically:
- ✅ Creates 10 Agent Workspaces (`~/.openclaw/workspace-*`)
- ✅ Writes SOUL.md files for each agent
- ✅ Registers agents and permission matrix to `openclaw.json`
- ✅ Configures data cleaning rules
- ✅ Builds React frontend to `dashboard/dist/` (requires Node.js 18+)
- ✅ Initializes data directory
- ✅ Performs first data sync
- ✅ Restarts Gateway

## Step 3: Configure Message Channels

Configure message channels (Feishu / Telegram / Signal) in OpenClaw. Set `chief_of_staff` as the entry point. Chief of Staff automatically triages chat vs. tasks.

```bash
# View current channels
openclaw channels list

# Add channel (example: Telegram)
openclaw channels add telegram --token YOUR_BOT_TOKEN --agent chief_of_staff
```

## Step 4: Start Services

Open two terminals:

**Terminal 1: Data refresh loop**
```bash
cd directive
bash scripts/run_loop.sh
```

**Terminal 2: Dashboard server**
```bash
cd directive
python3 dashboard/server.py
```

Open browser: `http://127.0.0.1:7891`

## Step 5: Issue Your First Executive Order

Send a message to Chief of Staff via your configured channel:

```
Design a user authentication system:
1. FastAPI REST API
2. PostgreSQL + JWT
3. Full test coverage
4. Deployment docs
5. Security audit
```

Watch the full process in Situation Room:
1. Chief of Staff triages → NSC
2. NSC plans → Senate
3. Senate reviews → OMB
4. OMB dispatches → Departments execute
5. Results consolidated → Report to President

## Using Order Templates

Dashboard → 📜 Order Templates → Select template → Fill parameters → Issue order

9 preset templates covering:
- Weekly reports
- Code review
- API design
- Competitive analysis
- Deployment plans
- Security audits
- Performance optimization
- Documentation generation
- Infrastructure setup

## Customizing Agents

Edit `agents/<agent_id>/SOUL.md` to customize agent behavior.

After editing, restart Gateway:
```bash
openclaw gateway restart
```

## Troubleshooting

**Gateway not starting?**
```bash
openclaw gateway logs
```

**Agents not responding?**
Check agent health in Situation Room → 🔭 Agency Monitor

**Data not refreshing?**
Ensure `run_loop.sh` is running in Terminal 1

## Next Steps

- Read [Architecture Documentation](task-dispatch-architecture.md)
- Explore [Remote Skills Guide](remote-skills-guide.md)
- Check [ROADMAP.md](../ROADMAP.md) for upcoming features
