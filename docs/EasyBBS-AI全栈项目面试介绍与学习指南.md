# EasyBBS AI 全栈项目面试介绍与学习指南

## 1. 项目介绍：面试时怎么讲

### 1.1 一句话介绍

这个项目是在原有 EasyBBS 论坛系统基础上，扩展出的一个 AI 增强型全栈社区项目。原系统具备用户登录、发帖、评论、搜索、附件、积分等论坛核心能力，我在此基础上加入了 AI 写作助手、AI 评论助手、AI 阅读提纲和 AI 搜索意图理解，让传统论坛从“内容发布平台”升级成“内容生产、阅读和互动都有 AI 辅助的智能社区”。

### 1.2 项目定位

项目不是单纯做一个 AI Demo，而是围绕论坛真实业务场景做 AI 落地：

- 发帖前：AI 辅助生成标题、摘要、润色正文、续写结构。
- 评论时：AI 辅助润色表达、生成友善回复、提示风险内容。
- 阅读时：AI 自动总结文章主旨和关键点，形成智能提纲。
- 搜索时：AI 理解用户搜索意图，生成更适合检索的关键词。

这几个功能都不是孤立页面，而是嵌入到用户原本的操作路径中，所以更接近真实产品需求。

### 1.3 技术栈

前端：

- Vue 3
- Vite
- Element Plus
- Vue Router
- Pinia
- Axios / Fetch
- SCSS

后端：

- 原 EasyBBS 后端 jar，运行在 `7070`
- 新增 AI Node 服务，运行在 `7072`
- 通过 OpenAI 兼容接口调用大模型，例如 DeepSeek 兼容接口

工程联调：

- 前端开发端口：`localhost:3004`
- 原论坛后端：`localhost:7070`
- AI 服务：`localhost:7072`
- Vite 代理：
  - `/api/**` 转发到原 EasyBBS 后端
  - `/api/ai/**` 转发到 AI 服务

### 1.4 核心架构

```txt
浏览器
  |
  | http://localhost:3004
  v
Vue 前端
  |
  | 普通论坛请求 /api/forum/search、/api/comment/postComment 等
  v
EasyBBS Web 后端 jar :7070

Vue 前端
  |
  | AI 请求 /api/ai/post/assist、/api/ai/article/summary 等
  v
AI Node 服务 :7072
  |
  | OpenAI-compatible Chat Completions API
  v
大模型服务
```

这个架构的核心思想是：不破坏原有论坛后端，在已有业务系统外加一个 AI 能力层。这样做的好处是改动小、风险低、容易部署，也方便以后把 AI 服务迁移成 Java Spring Boot 服务。

### 1.5 项目亮点

#### 亮点一：AI 功能和真实业务强绑定

很多项目只是单独做一个聊天框，但这个项目把 AI 嵌入到论坛的关键流程中：

- 发帖需要内容生产，所以接 AI 写作。
- 评论需要表达优化和风险控制，所以接 AI 评论助手。
- 长文章阅读成本高，所以接 AI 摘要和提纲。
- 搜索关键词不准确，所以接 AI 意图理解。

面试时可以强调：我不是为了用 AI 而用 AI，而是从用户痛点出发，找到内容社区里最适合 AI 增强的环节。

#### 亮点二：AI 请求统一封装

前端所有 AI 调用都集中在：

```txt
src/utils/AiService.js
```

页面组件不直接拼接口地址，也不直接处理模型调用细节，而是通过统一方法：

```js
AiService.postAssist(...)
AiService.commentAssist(...)
AiService.articleSummary(...)
AiService.searchAssist(...)
```

这样做的好处：

- 后续换接口路径只改一处。
- 后续加鉴权、日志、错误处理也只改一处。
- 页面组件更专注于交互和展示。

#### 亮点三：AI 服务具备降级能力

AI 服务不稳定是常态，比如：

- API Key 失效
- 模型名不可用
- 网络失败
- 服务限流
- AI 服务没有启动

所以项目里做了本地降级逻辑。即使 AI 接口失败，页面也能返回本地建议，保证论坛核心功能不受影响。

面试时可以说：AI 是增强能力，不应该成为核心链路的单点故障。

#### 亮点四：前后端分离联调清晰

通过 Vite proxy 解决开发环境跨域和多后端转发：

```js
proxy: {
  '/api/ai': {
    target: 'http://localhost:7072',
    changeOrigin: true,
  },
  '/api': {
    target: 'http://localhost:7070',
    changeOrigin: true,
  },
}
```

这样前端代码里仍然只需要请求：

```txt
/api/ai/article/summary
/api/forum/search
```

不需要在前端写死不同端口。

#### 亮点五：保留原系统稳定性

原 EasyBBS 后端是 jar 包，没有源码。直接改 jar 非常不稳定，所以采用独立 AI 服务：

- 原有发帖、评论、登录、搜索逻辑不动。
- 新 AI 功能以旁路服务方式接入。
- 后续如果有 Java 源码，可以平滑迁移为 Spring Boot Controller。

这个决策体现了工程上的风险意识。

### 1.6 可以这样向面试官介绍

面试时可以按下面这段讲：

> 我做的是一个基于 EasyBBS 的 AI 增强型论坛项目。原项目已经具备用户、帖子、评论、搜索、附件等传统论坛能力。我主要做的是把 AI 能力嵌入到内容社区的核心链路里，包括发帖时的标题摘要生成和正文润色，评论时的友善回复和风险提示，阅读文章时的 AI 摘要提纲，以及搜索时的搜索意图理解。
>
> 技术上，前端使用 Vue3、Vite、Element Plus。因为原后端只有 jar 包没有源码，我没有直接反编译改 jar，而是新增了一个独立的 AI Node 服务，监听 7072 端口。前端通过 Vite proxy 把 `/api/ai/**` 转发到 AI 服务，把普通 `/api/**` 请求继续转发到原论坛后端 7070。这样既不破坏原系统，又能扩展 AI 能力。
>
> 在代码结构上，我把 AI 请求统一封装到 `AiService.js`，页面组件只负责交互和展示。后端 AI 服务负责读取 `.env` 配置、调用 OpenAI 兼容模型接口、解析模型返回，并用和原项目一致的 `code/status/info/data` 格式返回给前端。同时我加了本地降级，避免 AI 服务异常时影响论坛主流程。

## 2. 全栈基础结构补充

### 2.1 一个全栈项目通常有哪些部分

一个基础全栈项目通常包括：

```txt
前端页面层
  负责 UI、用户交互、路由、状态管理

前端请求层
  负责封装 API、统一错误处理、统一 loading、鉴权 token/cookie

后端 Controller 层
  接收 HTTP 请求，校验参数，返回响应

后端 Service 层
  写业务逻辑，比如发帖、评论、调用 AI

后端 DAO/Mapper 层
  操作数据库

数据库
  存用户、帖子、评论、附件等数据

第三方服务
  邮件、对象存储、AI 大模型、支付等
```

你的项目现在可以理解为：

```txt
Vue 前端
  -> 原 EasyBBS jar 后端
  -> MySQL 数据库

Vue 前端
  -> 新增 AI Node 服务
  -> 大模型 API
```

### 2.2 前端组件层和请求层的关系

以 AI 发帖助手为例：

```txt
AiPostAssistant.vue
  负责展示按钮、收集标题/正文、展示生成结果

AiService.js
  负责请求 /api/ai/post/assist

ai-server/server.mjs
  负责调用大模型并返回结果

EditPost.vue
  负责把 AI 返回结果应用到表单
```

为什么不能把所有逻辑都写在 `EditPost.vue`？

因为这样会导致页面越来越臃肿。更好的结构是：

- 页面组件负责业务流程。
- 子组件负责局部 UI 和交互。
- 工具模块负责请求。
- 后端负责真正 AI 调用。

### 2.3 前后端联调的核心

前后端联调时最重要的是确认 4 件事：

#### 第一，请求地址是否正确

浏览器里看到：

```txt
http://localhost:3004/api/ai/article/summary
```

不代表请求真的由前端处理。它会被 Vite 代理转发到：

```txt
http://localhost:7072/api/ai/article/summary
```

#### 第二，请求参数是否正确

比如 AI 搜索需要：

```txt
keyword
```

如果关键词为空或太短，后端可能会返回参数错误。所以前端需要先做基础校验。

#### 第三，响应格式是否一致

这个项目统一使用：

```json
{
  "status": "success",
  "code": 200,
  "info": "请求成功",
  "data": {}
}
```

前端只要判断 `code === 200` 就知道成功。

#### 第四，服务是否启动

现在开发时至少需要：

```txt
原 EasyBBS 后端 7070
AI 服务 7072
前端 Vite 3004
```

如果只启动 `npm run dev`，AI 接口会报：

```txt
ECONNREFUSED
```

因为 `7072` 没有服务监听。

所以推荐：

```bash
npm run dev:full
```

它会同时启动前端和 AI 服务。

## 3. AI 功能底层实现补充

### 3.1 AI 功能的本质

大模型接口本质上就是一个 HTTP 请求。

你发送：

```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    {
      "role": "system",
      "content": "你是中文技术社区的写作助手"
    },
    {
      "role": "user",
      "content": "请根据这篇文章生成摘要"
    }
  ]
}
```

模型返回：

```json
{
  "summary": "...",
  "keyPoints": ["...", "..."]
}
```

所以 AI 功能的关键不是“神秘算法”，而是：

- 怎么组织 prompt
- 怎么传递上下文
- 怎么限制输出格式
- 怎么解析返回结果
- 怎么处理失败
- 怎么把结果应用回业务页面

### 3.2 system prompt 和 user prompt

在 AI 后端里，调用模型时会传两类消息：

```txt
system: 告诉模型扮演什么角色、输出什么格式
user: 告诉模型这次具体要处理什么内容
```

例如文章摘要：

```txt
system:
你是中文技术社区阅读助手。只返回 JSON，字段为 summary 和 keyPoints。

user:
标题是什么，正文是什么。
```

为什么要求“只返回 JSON”？

因为前端需要稳定解析。如果模型返回一大段自然语言，前端不知道哪句是摘要、哪句是重点。

### 3.3 为什么要限制内容长度

后端调用 AI 时会截断文章内容：

```js
content.slice(0, 5000)
```

原因：

- 模型上下文长度有限。
- 内容越长，消耗 token 越多。
- 长内容响应更慢。
- 太长可能超出模型限制。

真实项目里还可以进一步优化：

- 长文章先分段摘要，再汇总。
- 只提取正文纯文本，过滤 HTML。
- 对重复内容去重。

### 3.4 为什么前端不能直接调用大模型

绝对不要在前端写：

```js
fetch('https://api.deepseek.com/...')
```

原因：

- API Key 会暴露在浏览器里。
- 用户可以在 DevTools 里看到 Key。
- 无法做统一限流。
- 无法做日志审计。
- 无法统一兜底。

正确做法是：

```txt
前端 -> 自己的后端 -> 大模型平台
```

Key 只存在后端 `.env`。

### 3.5 AI 服务为什么需要状态接口

项目里加了：

```txt
GET /api/ai/status
```

它可以返回：

```json
{
  "port": 7072,
  "model": "deepseek-v4-flash",
  "apiBase": "https://api.deepseek.com",
  "hasApiKey": true
}
```

这个接口用于排查：

- 服务有没有启动
- `.env` 有没有读到
- 当前用的模型是什么
- 当前 API 地址是什么

调试 AI 功能时非常有用。

## 4. 后端需要什么

### 4.1 当前项目的后端方案

当前因为原后端没有源码，所以新增了 Node AI 服务：

```txt
ai-server/server.mjs
```

它承担：

- 读取 `.env`
- 接收 `/api/ai/**` 请求
- 解析 FormData / JSON 参数
- 拼接 prompt
- 请求大模型
- 解析模型返回 JSON
- 返回统一响应
- 失败时降级

### 4.2 如果换成 Java Spring Boot 应该怎么写

如果你以后有 Java 后端源码，可以新增：

```txt
AiController
AiService
AiProperties
AiClient
```

推荐结构：

```txt
controller
  AiController.java

service
  AiService.java

client
  AiModelClient.java

config
  AiProperties.java

dto
  AiPostAssistRequest.java
  AiCommentAssistRequest.java
  AiArticleSummaryRequest.java
  AiSearchAssistRequest.java
```

Controller 负责接请求：

```java
@RestController
@RequestMapping("/api/ai")
public class AiController {

    @PostMapping("/article/summary")
    public ResponseVO articleSummary(AiArticleSummaryRequest request) {
        return getSuccessResponseVO(aiService.articleSummary(request));
    }
}
```

Service 负责业务：

```java
public AiSummaryResult articleSummary(AiArticleSummaryRequest request) {
    String prompt = buildPrompt(request);
    return aiModelClient.chat(prompt);
}
```

Client 负责调用模型：

```java
public String chat(String prompt) {
    // 用 RestTemplate、WebClient 或 OkHttp 请求模型接口
}
```

配置放到：

```properties
ai.api-key=xxx
ai.api-base=https://api.deepseek.com
ai.model=deepseek-v4-flash
```

不要写死在代码里。

### 4.3 后端必须考虑的安全问题

AI 后端上线前要考虑：

- API Key 不能提交到 Git。
- 用户输入要限制长度。
- 要做频率限制，防止刷接口烧 token。
- 敏感内容不能直接信任 AI 判断。
- 日志里不要打印完整 Key。
- 模型返回结果要校验格式。
- 调用超时要设置合理时间。
- 失败时要返回可理解的错误或降级内容。

## 5. 面试官拷打问题与回答

### Q1：你为什么不直接在原 Java 后端里加 AI 接口？

答：

因为当前拿到的是 EasyBBS 的 release jar，没有完整 Java 源码。直接反编译修改 jar 风险很大，也不利于维护。所以我选择新增独立 AI 服务，通过 Vite 代理把 `/api/ai/**` 转发到 AI 服务。这样既不破坏原有论坛业务，又能快速扩展 AI 能力。如果后续拿到 Java 源码，可以把 Node AI 服务迁移成 Spring Boot 的 Controller 和 Service。

### Q2：你的 AI 服务为什么单独跑在 7072？

答：

这是为了和原论坛后端解耦。原论坛后端运行在 7070，负责用户、帖子、评论等核心功能。AI 服务运行在 7072，只负责 AI 相关接口。这样 AI 服务异常不会影响原有论坛功能，也方便单独扩容、替换模型或迁移技术栈。

### Q3：如果 AI 服务挂了，用户还能用论坛吗？

答：

可以。AI 是增强能力，不是核心链路。前端和 AI 服务都做了降级处理，AI 请求失败时会返回本地建议，或者只影响 AI 摘要、润色等功能，不影响正常发帖、评论、搜索和阅读。

### Q4：为什么要做 `AiService.js`，不能在每个组件里直接 fetch 吗？

答：

可以直接 fetch，但不利于维护。AI 接口有统一的 base path、错误处理、降级逻辑和返回格式。如果每个组件都写一份请求逻辑，后期换模型接口、加鉴权、加日志会非常麻烦。所以我把所有 AI 请求统一放到 `AiService.js`，组件只关心调用哪个能力。

### Q5：你怎么保证 AI 返回的数据前端能解析？

答：

后端 prompt 明确要求模型只返回 JSON，并指定字段，比如文章摘要返回 `summary` 和 `keyPoints`。后端收到模型返回后会尝试提取 JSON 并解析。如果解析失败，就走本地 fallback，保证前端拿到的数据结构稳定。

### Q6：为什么文章摘要要放在右侧栏？

答：

文章摘要属于阅读辅助信息，不应该打断正文阅读。如果放在正文顶部，会把文章内容往下推，影响阅读节奏。放在右侧栏可以和目录一起形成阅读辅助区，用户一眼能看到 AI 功能，也能按需生成，不干扰正文。

### Q7：评论风险提示能不能完全替代审核？

答：

不能。AI 风险提示只能作为用户输入阶段的辅助提醒。真正的内容审核应该在后端提交评论时做，包括敏感词规则、人工审核状态、风控策略等。AI 判断可能有误，所以现在只是提醒用户，而不是强制阻止发布。

### Q8：你为什么要做搜索意图理解，而不是直接用 AI 搜索数据库？

答：

当前项目原后端已经有成熟的关键词搜索接口。为了保持改动小，我没有重写搜索引擎，而是让 AI 帮用户改写关键词、理解搜索意图，然后仍然调用原搜索接口。这种方式成本低、风险小，能快速提升搜索体验。后续如果要升级，可以引入向量数据库做语义搜索。

### Q9：如果要做真正的语义搜索，你会怎么设计？

答：

我会增加 embedding 流程。发帖时把标题、摘要、正文生成向量，存入向量数据库，比如 Milvus、Elasticsearch dense vector、pgvector。搜索时先把用户 query 生成向量，再做相似度召回，然后结合关键词匹配、时间、热度、板块等因素做排序。AI 还可以对搜索结果做总结。

### Q10：AI 功能会不会很耗钱？怎么控制成本？

答：

会，所以要做成本控制：

- 限制输入长度。
- 对高频接口做限流。
- 对相同内容做缓存。
- 对摘要类结果可以落库缓存。
- 使用便宜模型处理简单任务。
- 只有用户点击时才生成，不自动大量调用。
- 后台记录调用次数和 token 消耗。

### Q11：你现在的 AI 摘要会不会重复调用，浪费 token？

答：

当前是点击生成时调用，刷新会重新生成。生产环境可以优化为缓存：以 `articleId + contentHash` 作为 key，文章内容不变时直接返回上次摘要。如果文章被编辑导致 hash 变化，再重新生成。

### Q12：你怎么处理模型返回慢的问题？

答：

前端按钮有 loading 状态，避免重复点击。后端可以设置请求超时。生产环境可以进一步改成异步任务，比如用户点击生成后先返回任务 ID，后端生成完成后再轮询或 WebSocket 通知。

### Q13：为什么你的 AI 后端要支持 `.env`？

答：

因为 API Key、模型名、接口地址都属于环境配置，不应该写死在代码里。`.env` 可以让开发、测试、生产使用不同配置，也避免敏感信息提交到 Git。

### Q14：如果面试官问你这个项目哪里最能体现工程能力，你怎么答？

答：

我会说主要体现在三个点：

- 第一，我没有破坏原系统，而是用独立 AI 服务以旁路方式接入，降低改造风险。
- 第二，我把 AI 请求统一封装，并做了失败降级，保证 AI 异常不影响论坛主流程。
- 第三，我把 AI 能力放在真实业务场景里，而不是做一个孤立聊天框，体现了从产品场景到技术实现的完整思考。

### Q15：这个项目还有哪些可以继续优化？

答：

可以从几个方向优化：

- AI 摘要结果落库缓存，减少重复调用。
- 评论风险提示接入后端审核流程。
- 搜索升级为 embedding 语义搜索。
- 增加 AI 调用日志和 token 统计。
- 增加用户级限流，防止恶意刷接口。
- 把 Node AI 服务迁移进 Spring Boot 后端，统一部署。
- 增加流式输出，让长文本生成体验更好。

## 6. 建议你重点掌握的知识点

### 必须会讲

- Vue 组件如何通过 props 和 emit 通信。
- 为什么要封装 `AiService.js`。
- Vite proxy 如何解决开发环境接口转发。
- AI 服务为什么不能放在前端直接调。
- `.env` 的作用。
- AI 接口失败为什么要降级。

### 进阶加分

- prompt 设计。
- JSON 输出约束。
- token 成本控制。
- AI 结果缓存。
- 语义搜索和 embedding。
- 服务解耦和旁路架构。
- 限流、鉴权、日志和监控。

## 7. 面试最后可以这样总结

> 这个项目让我理解到，AI 功能落地不是简单调一个模型接口，而是要考虑它和原业务怎么结合、失败时怎么降级、Key 怎么保护、请求怎么统一封装、前后端怎么联调、服务怎么部署。我的实现重点是把 AI 作为论坛的增强能力，以较低风险接入到发帖、评论、阅读和搜索四个核心场景中，同时保持原论坛系统稳定可用。
