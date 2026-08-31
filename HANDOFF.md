# 项目交接说明

更新日期：2026-08-31

当前分支：`codex/field-data-integration`

项目状态：现场清单已脱敏接入配置，可本地完整运行和演示。

## 1. 项目定位

“体育博物馆智慧化综合管理平台”包含两个入口：

- `/portal`：面向观众的公众展示入口。
- `/` 及各管理路由：面向运营、管理和技术人员的综合管理平台。

右上角可在两个入口之间切换。当前前端使用配置数据完成页面、字段、数量和业务流程验证；未直接连接真实摄像头、门禁、公众号、人脸库、发布屏、背景音乐、无线网管、动环或 UPS。

## 2. 本次现场数据接入

本分支选择性整合了 PR #1 的现场表格成果，并保留原系统的告警、工单、访客、车辆等完整业务能力。

| 数据范围 | 当前数量 | 主要入口 |
| --- | ---: | --- |
| 摄像头 | 112 路 | `public/config/cameras.json` |
| 通行相关设备 | 150 台 | `config/backend.json`、`config/platform.json` |
| 无线 AP | 42 台 | `config/platform.json` |
| 全部设备资产 | 396 台 | `config/backend.json` |
| VLAN 网段 / 地址分配 | 10 / 15 条 | `config/field-data.json` |
| 舞台灯具页 / 控制回路 | 4 / 7 组 | `config/field-data.json` |
| UPS / 背景音乐 / 发布屏 | 7 / 18 / 2 台 | `config/backend.json`、`config/platform.json` |

现场来源包含 B1F、1F、AP、VLAN、交换机、机房、独立出口和舞台灯光等表格。前端保留设备名称、位置、类型、IP、VLAN、型号和回路规则；账号、密码、口令、Token、MAC、序列号等敏感字段未进入本分支。

## 3. 主要功能路由

| 路由 | 模块 | 当前能力 |
| --- | --- | --- |
| `/` | 综合态势 | 设备、告警、工单、通行、趋势和系统状态 |
| `/alarms` | 告警中心 | 查询、详情、动态、媒体、确认、转工单和关闭 |
| `/video` | 视频监控 | 112 路完整目录、楼层联动、实时/回放、田字格和资源待配置状态 |
| `/access` | 人员通行 | 通行、人员、访客、车辆，以及 150 台现场通行设备清单 |
| `/publishing` | 信息发布 | 屏幕、预览、素材、节目单和发布任务 |
| `/workorders` | 工单管理 | 维修、更换、申购、巡检和流程流转 |
| `/map` | 电子地图 | 楼层、搜索、筛选、点位和模块跳转 |
| `/environment` | 机房动环 | 温湿度、漏水、烟雾、阈值、趋势和 UPS |
| `/audio` | 背景音乐 | 分区、音量、节目和定时任务 |
| `/network` | 无线网络 | 42 台 AP、终端、流量、状态和详情 |
| `/interfaces` | 接口管理 | 接入方式、能力和接口边界 |
| `/backend` | 技术后台 | 资产、VLAN、舞台灯光、协议、外部应用、渠道、API 和日志 |
| `/demo` | 场景控制台 | 固定验证场景、跨模块状态触发和重置 |

## 4. 技术栈与运行

- React 19 + TypeScript + Vite 8
- React Router、Recharts、Lucide React、Vitest
- Node.js 20.19 或更高版本

```bash
npm install
npm run dev -- --host 127.0.0.1 --port 5196
```

访问 `http://127.0.0.1:5196`。提交前执行：

```bash
npm run check
```

## 5. 配置驱动方式

客户资料到达后优先修改配置，不要在页面 JSX 中硬编码：

1. `config/project.json`：项目名称、版本和主题。
2. `config/platform.json`：业务记录、地图、动环、UPS、音频、AP 和接口状态。
3. `config/backend.json`：设备资产、协议、外部应用、渠道和 API。
4. `config/field-data.json`：VLAN、地址分配和舞台灯光。
5. `public/config/cameras.json`：摄像头编号、位置、IP、状态和视频资源。
6. `config/public.json`：公众端展览、活动和服务内容。

技术后台数据存入带 `schemaVersion` 的 LocalStorage。配置结构变化时同步更新版本号，可避免旧浏览器缓存覆盖新现场清单。

更详细规则见 [config/README.md](config/README.md)，接口边界见 [INTERFACE_BOUNDARIES.md](INTERFACE_BOUNDARIES.md)。

## 6. 接口边界

`配置就绪` 只表示字段与适配器配置已加载，不代表真实接口已经联调。第二阶段仍需厂家资料、网络条件和现场测试：

- 视频 SDK 或 GB/T 28181；
- 公众号、二维码、人脸、门禁和车辆道闸；
- 信息发布与背景音乐 SDK；
- 无线网管协议；
- 动环 SDK、UPS 协议、Modbus 或 SNMP；
- 登录、权限、数据库、审计和生产部署。

控制类接口应在只读数据接入稳定后单独评审，禁止把厂家原始结构直接传给页面。

## 7. 已知限制

- 摄像头尚无现场视频素材，页面显示视频资源待配置，播放和回放交互可验证。
- 平面图仍为可替换的示意布局，尚未接入最终 GIS/CAD。
- 业务操作和技术后台编辑主要保存在浏览器 LocalStorage，当前没有生产后端。
- 场景控制台用于验证流程，不代表控制指令已发送到真实设备。
- 构建存在非阻塞的单包体积提示，生产开发阶段应进行路由级拆包。

## 8. 接手检查清单

- [ ] 确认位于 `codex/field-data-integration` 分支。
- [ ] 执行 `npm install` 和 `npm run check`。
- [ ] 打开 `/video`，确认 112 路及三段楼层目录。
- [ ] 打开 `/access` 的“通行设备 150”页签。
- [ ] 打开 `/backend`，核对 VLAN 与舞台灯光配置。
- [ ] 在 1280×720 下检查关键页面无横向溢出。
- [ ] 未取得厂家文档和现场结果前，不得将任何真实接口标记为已联调。
