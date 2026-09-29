# EasyBBS AI 接口服务

这是给现有 EasyBBS 后端 jar 配套的轻量 AI 服务。现有 `easybbs-web-release-1.0.jar` 没有源码，直接改 jar 风险很高，所以这里用独立服务承接 `/api/ai/**` 接口，原论坛后端仍然运行在 `7070`。

## 启动

```powershell
$env:OPENAI_API_KEY="你的 API Key"
npm run ai:server
```

默认端口是 `7072`。如需修改：

```powershell
$env:AI_SERVER_PORT="7072"
$env:OPENAI_MODEL="gpt-4o-mini"
$env:OPENAI_API_BASE="https://api.openai.com/v1"
npm run ai:server
```

也可以在项目根目录或 `ai-server` 目录新建 `.env`：

```txt
OPENAI_API_KEY=你的 API Key
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_BASE=https://api.openai.com/v1
AI_SERVER_PORT=7072
```

如果没有配置 `OPENAI_API_KEY`，接口会返回本地降级建议，方便开发联调。

## 状态检查

```powershell
Invoke-RestMethod http://localhost:7072/api/ai/status
```

重点看 `hasApiKey` 是否为 `true`。如果是 `false`，说明当前服务没有读取到 `OPENAI_API_KEY`，所有 AI 请求都会使用本地建议。

## 接口

- `POST /api/ai/post/assist`
- `POST /api/ai/comment/assist`
- `POST /api/ai/article/summary`
- `POST /api/ai/search/assist`

返回格式与 EasyBBS 前端现有 `Request.js` 兼容：

```json
{
  "status": "success",
  "code": 200,
  "info": "请求成功",
  "data": {}
}
```

## 与原后端的关系

- 原 web 后端：`java -jar easybbs-web-release-1.0.jar --server.port=7070`
- AI 后端：`npm run ai:server`，默认 `7072`
- 前端 Vite 代理会把 `/api/ai` 转到 `7072`，其余 `/api` 请求仍然转到 `7070`。
