# EasyBBS 前端与 AI 增强项目面试复习文档

## 1. 一句话介绍

这是一个基于 Vue 3 + Vite 的论坛社区前台项目，覆盖登录注册、板块浏览、发帖编辑、文章详情、评论互动、搜索、用户中心、消息中心、附件下载和积分记录等完整论坛业务。在原有 EasyBBS 后端能力之上，项目额外接入了独立 Node AI 服务，把 AI 写作助手、评论助手、文章摘要和搜索意图理解嵌入到真实业务流程中。

面试时可以这样说：

> 我做的是一个面向技术社区场景的 EasyBBS 前端项目。普通论坛能力包括用户登录注册、板块和帖子浏览、发帖、编辑、评论、点赞、附件下载、积分和消息中心。项目技术栈主要是 Vue 3、Vite、Vue Router、Pinia、Element Plus、Axios、SCSS，同时集成了 wangEditor 富文本编辑器和 v-md-editor Markdown 编辑器。  
> 在这个基础上，我又加了一层独立的 AI Node 服务，通过 Vite proxy 把 `/api/ai/**` 请求转发到 7072 端口，普通 `/api/**` 请求仍然走原 EasyBBS 后端 7070 端口。这样既不破坏原后端，又能把 AI 能力嵌入发帖、评论、阅读和搜索流程。

## 2. 项目定位

这个项目不是简单的后台管理系统，也不是孤立的 AI Demo，而是一个“社区内容产品”：

- 发帖前，用户需要组织内容，所以加入 AI 生成标题、生成摘要、润色正文、续写结构。
- 评论时，用户需要表达更友好、更清晰，所以加入 AI 评论润色、友善回复、风险提示。
- 阅读文章时，长内容阅读成本高，所以在文章详情页右侧加入 AI 智能提纲。
- 搜索时，用户输入可能不准确，所以加入 AI 搜索意图理解和关键词推荐。

项目的核心价值是把 AI 作为论坛业务的增强能力，而不是单独做一个聊天窗口。

## 3. 技术栈与依赖

前端技术：

- Vue 3：组件化开发和 Composition API。
- Vite：开发服务、构建、代理配置。
- Vue Router：前台页面路由。
- Pinia：全局状态管理。
- Element Plus：表单、弹窗、按钮、分页、Tabs、上传等 UI 组件。
- Axios：普通业务接口请求。
- Fetch：AI 接口请求。
- SCSS：样式组织。
- wangEditor：富文本发帖编辑器。
- `@kangc/v-md-editor`：Markdown 发帖编辑器。
- highlight.js：文章详情页代码块高亮。
- js-md5：登录密码提交前进行 MD5 处理。
- vue-cookies：记住登录信息、保存编辑器偏好。

辅助服务：

- 原 EasyBBS 后端：默认运行在 `localhost:7070`，负责论坛核心业务。
- AI Node 服务：默认运行在 `localhost:7072`，负责 AI 能力接口。
- 前端开发服务：默认运行在 `localhost:3004`。

## 4. 目录结构

项目关键目录如下：

```txt
easybbs-front-web
├─ ai-server
│  ├─ server.mjs        # AI Node 服务，提供 /api/ai/** 接口
│  ├─ dev-full.mjs      # 同时启动 AI 服务和 Vite 前端服务
│  └─ README.md
├─ docs                 # 项目文档
├─ public
├─ src
│  ├─ assets            # 全局样式、图标字体、静态文件
│  ├─ components        # 通用组件与 AI 组件
│  ├─ router            # Vue Router 路由配置
│  ├─ store             # Pinia 全局状态
│  ├─ utils             # 请求、消息、确认框、校验、AI 服务封装
│  ├─ views
│  │  ├─ forum          # 论坛帖子、详情、评论、发帖
│  │  └─ ucenter        # 用户中心、消息、积分、资料编辑
│  ├─ App.vue
│  └─ main.js
├─ package.json
└─ vite.config.js
```

面试中可以强调：代码按“页面 views、通用组件 components、工具 utils、状态 store、路由 router”拆分，业务页面和基础能力有清晰边界。

## 5. 启动与联调方式

常用命令：

```bash
npm run dev
npm run dev:full
npm run ai:server
npm run build
```

`npm run dev` 只启动 Vite 前端。  
`npm run ai:server` 只启动 AI Node 服务。  
`npm run dev:full` 通过 `ai-server/dev-full.mjs` 同时启动前端和 AI 服务，更适合开发 AI 功能时使用。

端口关系：

```txt
浏览器
  -> http://localhost:3004

普通论坛请求
  -> /api/**
  -> Vite proxy
  -> http://localhost:7070

AI 请求
  -> /api/ai/**
  -> Vite proxy
  -> http://localhost:7072
```

## 6. Vite 配置与代理设计

`vite.config.js` 里配置了 `@` 指向 `src`，让代码可以用 `@/components/...` 这种方式导入。

代理配置的意义：

- 前端代码不需要硬编码后端端口。
- 开发环境避免跨域问题。
- 普通业务请求和 AI 请求可以被转发到不同服务。
- 原论坛后端和新增 AI 后端解耦。

配置思想：

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

注意：源码里 `/api` 代理配置中有一个 `pathRewirte` 拼写，应为 `rewrite` 或 `pathRewrite` 才符合常见代理写法。不过这个项目当前路径本身仍然带 `/api`，即使不重写也能工作。面试被问到可以坦诚说：这里没有真正依赖路径重写，生产环境可以清理掉这个拼写问题。

## 7. 应用入口与全局能力

`src/main.js` 做了几件核心事情：

- 创建 Vue 应用。
- 注册 Pinia。
- 注册 Vue Router。
- 注册 Element Plus。
- 引入全局样式和 iconfont。
- 注册全局组件。
- 挂载全局工具方法。

全局组件包括：

- `Dialog`
- `Avatar`
- `Cover`
- `DataList`
- `NoData`
- `ImageViewer`
- `EditorHtml`
- `EditorMarkdown`
- `CoverUpload`
- `AttachmentSelect`

全局工具包括：

- `Vertify`：表单校验。
- `Message`：消息提示封装。
- `Request`：普通业务请求封装。
- `Utils`：文件大小格式化等工具。
- `Confirm`：确认框封装。

`globalInfo` 中维护了：

```js
{
  bodyWidth: 1300,
  avatarUrl: '/api/file/getAvatar/',
  imageUrl: '/api/file/getImage/',
}
```

面试追问点：为什么把这些放到全局？

回答：这些配置被多个页面和组件复用，比如头像地址、图片地址、页面宽度。集中维护能减少重复配置，也方便以后改 CDN 地址或接口前缀。

## 8. 路由设计

路由核心文件是 `src/router/index.js`。主路由使用 `Layout.vue` 作为外壳，内部通过子路由切换页面。

主要路由：

- `/`：全部帖子列表。
- `/forum/:pBoardId`：一级板块帖子。
- `/forum/:pBoardId/:boardId/`：二级板块帖子。
- `/post/:articleId/`：文章详情。
- `/newPost`：发布文章。
- `/editPost/:articleId`：编辑文章。
- `/user/:userId`：用户主页。
- `/user/message/:type`：消息中心。
- `/search`：搜索页。
- `/:pathMatch(.*)*`：错误页。

路由守卫：

```js
router.beforeEach((to, from, next) => {
  if (to.path.indexOf("/user") != -1) {
    const store = useAllDataStore()
    store.setActivePBoardId(-1)
  }
  next()
})
```

作用：进入用户相关页面时，取消顶部板块导航的选中状态，避免用户中心还高亮某个论坛板块。

## 9. 全局状态管理

状态管理在 `src/store/index.js`，使用 Pinia。

主要状态：

- `loginUserInfo`：当前登录用户信息。
- `showLogin`：是否显示登录弹窗。
- `boardList`：板块列表。
- `activePBoardId`：当前一级板块。
- `activeBoardId`：当前二级板块。
- `messageCntInfo`：消息数量。
- `sysSetting`：系统配置，例如评论是否开放。

典型使用场景：

- 登录成功后更新 `loginUserInfo`。
- 接口返回 `901` 登录超时后打开登录框。
- Layout 加载板块信息并保存到 store。
- 文章列表根据路由参数更新当前板块高亮。
- 消息中心读取消息后更新未读数量。
- 系统配置控制评论入口是否展示。

面试追问：为什么不用 props 一层层传？

回答：登录状态、板块列表、消息数量属于跨页面共享状态。如果用 props 层层传递，会让组件耦合变高。Pinia 适合维护这种全局、响应式、多个页面都要读写的数据。

## 10. 普通请求封装

`src/utils/Request.js` 用 axios 创建统一实例：

- `baseURL: '/api'`
- `timeout: 10 * 1000`
- 请求前根据 `showLoading` 展示 Element Plus Loading。
- 响应后统一关闭 Loading。
- `code === 200` 返回业务数据。
- `code === 901` 认为登录超时，清空用户信息并打开登录弹窗。
- 其他错误统一弹消息或走 `errorCallback`。

所有普通接口都通过：

```js
proxy.Request({
  url: '/forum/loadArticle',
  params: {},
})
```

由于 axios 实例的 `baseURL` 是 `/api`，最终请求就是 `/api/forum/loadArticle`。

面试追问：为什么封装请求？

回答：

- 统一处理 Loading。
- 统一处理登录超时。
- 统一处理错误提示。
- 页面组件只关注业务参数和结果。
- 后续加 token、日志、重试、取消请求时只改一处。

## 11. 登录注册流程

登录注册在 `src/views/LoginAndRegister.vue`。

支持三种操作：

- `opType = 0`：注册。
- `opType = 1`：登录。
- `opType = 2`：找回密码。

主要能力：

- 邮箱格式校验。
- 密码格式校验。
- 注册/找回密码需要邮箱验证码。
- 登录/注册/找回密码都需要图片验证码。
- 登录密码使用 `js-md5` 处理。
- 勾选“记住我”后使用 `vue-cookies` 保存邮箱、密码和 rememberMe。
- 登录成功后更新 Pinia 中的 `loginUserInfo`。

安全追问：

1. 前端 MD5 是否等于安全？

不能。前端 MD5 只能避免明文密码直接出现在请求参数中，但不能替代 HTTPS、后端加盐哈希和服务端安全策略。生产环境应该使用 HTTPS，后端存储密码时使用 bcrypt、PBKDF2、Argon2 等加盐哈希算法。

2. 记住密码存在 Cookie 有没有风险？

有风险。当前实现为了开发便利保存了处理后的密码。更严谨的方案是只保存服务端签发的安全 token，设置 HttpOnly、Secure、SameSite，并且 token 要有过期时间和刷新机制。

## 12. Layout 页面

`src/views/Layout.vue` 是前台主框架，包括：

- 顶部导航。
- Logo。
- 板块菜单。
- 二级板块 Popover。
- 发帖按钮。
- 搜索按钮。
- 登录注册入口。
- 登录后头像菜单。
- 消息未读角标和消息菜单。
- 底部 Footer。
- 登录注册弹窗。
- 回到顶部。

页面加载时会：

- 请求 `/getUserInfo` 获取当前用户。
- 请求 `/board/loadBoard` 获取板块。
- 请求 `/getSysSetting` 获取系统配置。
- 登录后请求 `/ucenter/getMessageCount` 获取消息未读数量。

交互细节：

- 下滑隐藏 Header，上滑显示 Header。
- 点击发帖时，如果未登录则打开登录弹窗。
- 进入发帖/编辑页隐藏 Footer，提升编辑空间。

## 13. 文章列表功能

文章列表在 `src/views/forum/ArticleList.vue`。

功能：

- 根据一级/二级板块筛选帖子。
- 支持排序：热榜、发布时间、最新。
- 复用 `DataList` 实现加载态、空状态和分页。
- 使用 `ArticleListItem` 渲染单条帖子。
- 根据系统设置决定是否显示评论数。

接口：

```txt
/api/forum/loadArticle
```

请求参数：

- `pageNo`
- `orderType`
- `pBoardId`
- `boardId`

这里的路由和状态联动比较典型：

- 监听 `route.params`。
- 从路由参数中取出 `pBoardId`、`boardId`。
- 请求对应文章列表。
- 更新 Pinia 里的当前板块 ID。
- 顶部导航高亮同步变化。

面试追问：为什么路由参数变化要 watch？

回答：同一个 `ArticleList.vue` 会被 `/`、`/forum/:pBoardId`、`/forum/:pBoardId/:boardId` 复用。组件不一定会销毁重建，所以要监听路由参数变化，主动重新加载数据。

## 14. 文章详情功能

文章详情在 `src/views/forum/ArticleDetail.vue`。

核心功能：

- 展示文章标题、作者、发布时间、IP 地址、阅读数。
- 展示文章正文 HTML。
- 作者本人可进入编辑页。
- 支持点赞。
- 支持附件展示、积分校验和下载。
- 支持评论列表。
- 支持文章图片点击预览。
- 支持代码块高亮。
- 自动解析正文中的 H1-H6 生成右侧目录。
- 右侧集成 AI 阅读助手。

接口：

- `/forum/getArticleDetail`
- `/forum/doLike`
- `/forum/getUserDownloadInfo`
- `/api/forum/attachmentDownload`

文章目录实现：

- 文章内容通过 `v-html` 渲染到 `#detail`。
- 使用 DOM 查询拿到 H1-H6。
- 给标题节点动态设置 `id`。
- 生成 `tocArray`。
- 点击目录时 `scrollIntoView` 定位。
- 监听滚动更新当前高亮目录项。

代码高亮实现：

- 引入 `highlight.js`。
- 在文章内容渲染后查询 `pre code`。
- 调用 `hljs.highlightBlock`。

图片预览实现：

- 查询文章正文中的所有图片。
- 生成图片地址数组。
- 给图片绑定点击事件。
- 调用 `ImageViewer` 组件展示大图。

面试追问：`v-html` 有什么风险？

回答：`v-html` 可能带来 XSS 风险。如果后端没有对 HTML 做过滤，恶意用户可能注入脚本。生产环境应在后端进行 HTML 白名单过滤，比如只允许 p、a、img、pre、code、h1-h6 等安全标签，同时过滤事件属性和危险 URL。前端也可以结合 DOMPurify 做二次防护。

## 15. 发帖与编辑功能

发帖编辑在 `src/views/forum/EditPost.vue`。

核心能力：

- 新增帖子。
- 编辑已有帖子。
- 支持富文本编辑器。
- 支持 Markdown 编辑器。
- 用户可切换编辑器类型。
- 编辑器偏好保存到 Cookie。
- 选择板块。
- 上传封面。
- 填写摘要。
- 选择附件。
- 设置附件下载积分。
- 集成 AI 写作助手。

接口：

- `/forum/loadBoard4Post`
- `/forum/postArticle`
- `/forum/articleDetail4Update`
- `/forum/updateArticle`

编辑器类型：

- `editorType = 0`：富文本编辑器。
- `editorType = 1`：Markdown 编辑器。

Markdown 编辑器会通过 `@change` 同时返回 Markdown 原文和 HTML 内容。保存文章时，实际提交 HTML 内容用于详情页渲染，同时保留 `markdownContent` 用于编辑回显。

保存前处理：

- 表单校验标题、板块、正文、摘要长度、积分格式。
- 根据 `boardIds` 拆出 `pBoardId` 和 `boardId`。
- 设置 `editorType`。
- 去掉 HTML 标签后判断正文是否为空。
- 处理封面和附件 File 对象。
- 根据是否有 `articleId` 判断新增还是更新。

面试追问：为什么支持两种编辑器？

回答：论坛用户有不同写作习惯。普通用户更适合富文本，技术用户更习惯 Markdown，尤其是代码块、标题层级和列表。保留两种编辑器能覆盖不同内容创作习惯。

## 16. 评论系统

评论列表在 `CommentList.vue`，发送评论在 `PostComment.vue`，评论项在 `CommentListItem.vue`。

评论能力：

- 一级评论。
- 回复评论。
- 评论分页。
- 评论排序：热榜、最新。
- 评论点赞。
- 评论置顶。
- 评论图片上传和预览。
- 评论成功后更新文章评论数。
- 集成 AI 评论助手。

发送评论时：

- 校验评论内容。
- 最少 5 个字。
- 可上传图片。
- 提交 `articleId`、`pCommentId`、`replyUserId`。
- 成功后清空输入和图片。
- 把新评论插入列表头部。

面试追问：为什么评论成功后前端直接插入列表，而不是重新请求？

回答：直接插入可以提升交互体验，减少一次接口请求。但如果后端会做审核、排序、内容过滤，则更严谨的做法是使用后端返回的评论对象插入，或者重新拉取第一页。当前代码使用后端返回的 `res.data` 插入，已经比纯前端拼对象更可靠。

## 17. 搜索功能

搜索页在 `src/views/Search.vue`。

普通搜索：

- 输入关键词。
- 校验不能为空、长度至少 3。
- 请求 `/forum/search`。
- 对返回标题中的关键词做红色高亮。
- 复用 `ArticleListItem` 展示结果。

AI 搜索增强：

- 用户输入关键词后可点击“AI 理解搜索意图”。
- 调用 `AiService.searchAssist`。
- 返回 `intent` 和 `keywords`。
- 展示 AI 理解出的搜索意图。
- 展示推荐关键词标签。
- 点击推荐关键词后自动搜索。

面试追问：为什么不直接用 AI 搜数据库？

回答：当前后端已经有成熟的关键词搜索接口。项目为了降低改造成本，没有重写搜索引擎，而是让 AI 做 query 改写和意图理解，再复用原搜索接口。这种方式成本低、风险小、易落地。后续可以升级为 embedding 语义搜索。

## 18. 用户中心

用户中心在 `src/views/ucenter/Ucenter.vue`。

功能：

- 展示用户头像、昵称、性别、个人简介。
- 展示积分、获赞、发帖数、加入时间、最后登录时间。
- 当前登录用户可修改资料。
- 当前登录用户可查看积分记录。
- Tabs 展示用户发帖、评论、点赞过的文章。
- 当前用户查看自己的发帖时，可直接进入编辑。

接口：

- `/ucenter/getUserInfo`
- `/ucenter/loadUserArticle`

用户资料编辑在 `UcenterEdit.vue`：

- 修改头像。
- 修改性别。
- 修改个人简介。
- 提交 `/ucenter/updateUserInfo`。

积分记录在 `UserIntegral.vue`：

- 支持日期范围筛选。
- 展示积分变动类型、积分数量和时间。
- 调用 `/ucenter/loadUserIntegralRecord`。

## 19. 消息中心

消息中心在 `src/views/ucenter/MessageList.vue`。

消息类型：

- `reply`：回复我的。
- `likePost`：赞了我的文章。
- `downloadAttachment`：下载了我的附件。
- `likeComment`：赞了我的评论。
- `sys`：系统消息。

功能：

- 顶部 Tabs 展示不同消息分类。
- 每个分类显示未读角标。
- 根据路由参数切换消息类型。
- 请求 `/ucenter/loadMessageList`。
- 读取消息后调用 `store.readMessage(activeTabName.value)` 更新未读数。

面试追问：消息未读数为什么放 Pinia？

回答：消息角标既在 Header 展示，也在消息中心内部展示。放到全局状态后，读取消息后 Header 可以同步变化，不需要手动跨组件传参。

## 20. 通用组件设计

### DataList

`DataList.vue` 负责列表通用状态：

- Loading 骨架屏。
- 空状态。
- 列表渲染插槽。
- 分页。
- 页码变化后 emit `loadData`。

它不关心列表项是什么，由父组件通过 slot 决定渲染文章、评论、消息还是积分记录。

面试可讲：这是典型的“容器组件 + 插槽”模式，提高了分页列表的复用性。

### Dialog

全局弹窗组件，配合 `buttons` 配置实现不同业务弹窗，例如登录注册、资料编辑、积分记录。

### Avatar / Cover / CoverUpload / AttachmentSelect

这些组件封装了头像、封面展示、封面上传、附件选择等重复 UI，避免页面里重复写上传和图片展示逻辑。

### EditorHtml

基于 wangEditor：

- 支持图片上传。
- 上传接口 `/api/file/uploadImage`。
- 上传成功后插入图片地址。
- 编辑器销毁时调用 `editor.destroy()`，避免内存泄漏。

### EditorMarkdown

基于 `@kangc/v-md-editor`：

- 使用 GitHub 主题。
- 接入 highlight.js。
- 支持图片上传。
- 编辑时同时 emit Markdown 和 HTML。

## 21. AI 前端封装

AI 请求集中在 `src/utils/AiService.js`。

主要方法：

- `postAssist(params)`：发帖 AI 助手。
- `commentAssist(params)`：评论 AI 助手。
- `articleSummary(params)`：文章摘要。
- `searchAssist(params)`：搜索意图理解。
- `stripHtml(html)`：去 HTML 文本。

请求特点：

- AI 接口统一走 `/api/ai`。
- 使用 `fetch` + `FormData`。
- 带 `credentials: 'include'`。
- 如果接口失败，使用本地 fallback。

本地 fallback 的意义：

- AI 服务没启动时页面不崩。
- API Key 未配置时还能演示基础效果。
- 模型异常、网络异常时用户仍能获得可用建议。
- 体现“AI 是增强能力，不应该成为核心流程单点故障”的工程意识。

面试追问：为什么 AI 不复用 `Request.js`？

回答：普通业务接口和 AI 接口的行为不同。普通接口失败通常需要明确报错；AI 接口失败可以降级为本地建议。单独封装能让 AI 请求拥有自己的 fallback、结果归一化和错误策略。当然，如果后续做工程统一，也可以抽象一个更底层的 request client，再分别封装业务请求和 AI 请求。

## 22. AI 组件设计

### AI 写作助手

组件：`src/components/AiPostAssistant.vue`

嵌入位置：发帖/编辑页右侧设置栏。

功能：

- 生成标题。
- 生成摘要。
- 润色正文。
- 续写结构。
- 展示生成结果预览。
- 如果走 fallback，展示“本地建议”提示。
- 通过 `emit('apply', result)` 把结果交给父组件应用到表单。

父组件 `EditPost.vue` 通过 `applyAiPatch` 把 AI 返回字段合并到 `formData`。

### AI 评论助手

组件：`src/components/AiCommentAssistant.vue`

嵌入位置：评论输入框下方。

功能：

- 润色评论。
- 生成友善回复。
- 风险提示。

润色/回复会 emit 新内容给父组件；风险检查只展示提示，不强制阻止发布。

面试追问：为什么风险提示不直接拦截发布？

回答：当前 AI 风险检查定位是输入阶段的辅助提醒，不能替代后端审核。AI 可能误判，真正的内容审核应该放在后端，结合敏感词规则、审核状态、人工复核和风控策略。

### AI 阅读助手

组件：`src/components/AiArticleInsight.vue`

嵌入位置：文章详情右侧目录上方。

功能：

- 点击生成文章摘要。
- 返回 summary。
- 返回 keyPoints。
- 支持刷新。
- 失败时展示本地建议。

设计原因：摘要是阅读辅助，放在右侧不会打断正文阅读，同时和目录形成“阅读辅助区”。

### AI 搜索助手

嵌入位置：`Search.vue`。

功能：

- 理解搜索意图。
- 生成 3 到 6 个搜索关键词。
- 用户点击关键词后复用普通搜索接口。

## 23. AI Node 服务

AI 服务文件：`ai-server/server.mjs`。

它使用 Node 原生 `http` 模块，没有引入 Express。

职责：

- 读取项目根目录 `.env`。
- 读取 `ai-server/.env`。
- 获取 `AI_SERVER_PORT`、`OPENAI_API_KEY`、`OPENAI_API_BASE`、`OPENAI_MODEL`。
- 解析 JSON、urlencoded、multipart/form-data。
- 提供 AI 相关接口。
- 调用 OpenAI-compatible Chat Completions API。
- 解析模型返回 JSON。
- 失败时返回本地 fallback。
- 提供状态接口。

接口：

```txt
GET  /api/ai/status
POST /api/ai/post/assist
POST /api/ai/comment/assist
POST /api/ai/article/summary
POST /api/ai/search/assist
```

统一返回格式：

```json
{
  "status": "success",
  "code": 200,
  "info": "请求成功",
  "data": {}
}
```

模型调用：

- 请求 `${OPENAI_API_BASE}/chat/completions`。
- 使用 Bearer Token。
- 传入 `model`、`temperature`、`messages`。
- system prompt 限制角色和输出格式。
- user prompt 传入具体任务上下文。

面试追问：为什么前端不能直接调大模型 API？

回答：

- API Key 会暴露在浏览器。
- 无法做统一鉴权。
- 无法做限流。
- 无法做日志审计。
- 无法做成本统计。
- 无法统一 fallback。
- 无法屏蔽不同模型厂商接口差异。

正确做法是：前端 -> 自己的后端 -> 大模型平台。

## 24. AI Prompt 与 JSON 约束

项目中的 AI 服务要求模型“只返回 JSON”。

原因：

- 前端需要稳定解析。
- 不希望模型返回一大段自然语言后再猜字段。
- 各 AI 功能需要固定字段，例如：
  - 写作标题返回 `title`。
  - 摘要返回 `summary`。
  - 文章提纲返回 `summary` 和 `keyPoints`。
  - 搜索返回 `intent` 和 `keywords`。

服务端的 `asJson` 会从模型内容中提取 `{...}` 并 `JSON.parse`。如果解析失败，就用 fallback。

面试追问：只在 prompt 里要求 JSON 够吗？

回答：不够。模型仍可能输出非标准 JSON。更稳妥的做法包括：

- 使用支持 JSON mode 或 structured output 的模型接口。
- 服务端做 schema 校验。
- 缺字段时补默认值。
- 解析失败时重试一次。
- 仍失败时 fallback。

## 25. AI 输入长度控制

AI 服务会截断输入：

- 发帖内容：`slice(0, 3000)`。
- 文章摘要内容：`slice(0, 5000)`。

原因：

- 模型上下文有限。
- token 越多成本越高。
- 输入越长响应越慢。
- 太长可能超出模型限制。

更进一步的优化：

- 长文章分段摘要，再合并摘要。
- 提取纯文本，过滤 HTML。
- 缓存相同文章的摘要。
- 根据标题、摘要、正文开头组合上下文，不必传完整正文。

## 26. 降级策略

项目有两层降级：

1. 前端 `AiService.js` 降级。
2. 后端 `server.mjs` 降级。

降级场景：

- AI 服务未启动。
- API Key 未配置。
- 模型接口失败。
- 模型返回无法解析。
- 网络异常。

返回字段中会带：

```js
fromFallback: true
fallbackReason: '...'
```

前端根据 `fromFallback` 展示“本地建议”。

面试可讲亮点：

> AI 能力是增强链路，不应该影响论坛核心链路。即使 AI 失败，用户仍然可以发帖、评论、阅读和搜索。

## 27. 权限与登录态

项目主要依赖后端判断登录态。前端处理：

- 未登录点击发帖：打开登录弹窗。
- 请求返回 `901`：清空用户信息，打开登录弹窗。
- 下载附件前：如果未登录，打开登录弹窗。
- 编辑文章入口：文章作者本人显示。

面试追问：只靠前端判断作者是否能编辑安全吗？

回答：不安全。前端只是 UI 控制，真正权限必须由后端校验。例如 `/forum/articleDetail4Update` 和 `/forum/updateArticle` 必须验证当前登录用户是否是作者或管理员，否则用户可以绕过前端直接请求接口。

## 28. 文件上传与附件下载

上传点：

- 富文本图片上传：`/api/file/uploadImage`。
- Markdown 图片上传：`file/uploadImage`，经 Request 的 `/api` baseURL 拼接后请求 `/api/file/uploadImage`。
- 评论图片上传：前端先用 FileReader 生成预览，再提交 File。
- 封面上传：通过 `CoverUpload`。
- 附件选择：通过 `AttachmentSelect`。

附件下载流程：

- 文章详情展示附件名、大小、所需积分、下载次数。
- 点击下载先检查登录。
- 请求 `/forum/getUserDownloadInfo`。
- 如果已经下载过，直接下载。
- 如果积分不足，提示不能下载。
- 如果需要扣积分，确认后跳转下载接口。

面试追问：附件下载为什么不用 axios？

回答：文件下载通常直接让浏览器访问下载地址，后端返回文件流并触发下载。当前实现使用 `document.location.href` 跳转到下载接口，简单直接。更复杂场景可以用 blob 下载，并处理文件名、鉴权和错误提示。

## 29. 系统配置

Layout 请求 `/getSysSetting`，保存到 Pinia 的 `sysSetting`。

当前主要用于控制评论是否展示：

- 文章列表是否展示评论数。
- 文章详情是否展示评论区。
- 用户中心文章列表是否展示评论信息。

注意：源码里有的地方使用 `commnetOpen`，有的地方使用 `commentOpen`，拼写不完全一致。面试中可以作为可优化点说明：应统一字段命名，避免系统配置失效。

## 30. 项目亮点总结

### 亮点 1：完整论坛业务闭环

项目不是单页面 Demo，而是有完整业务链路：

- 登录注册。
- 板块导航。
- 帖子列表。
- 发帖编辑。
- 文章详情。
- 评论互动。
- 点赞。
- 附件下载。
- 积分记录。
- 用户主页。
- 消息中心。
- 搜索。

### 亮点 2：前端工程分层清晰

- 路由集中在 router。
- 全局状态集中在 Pinia。
- 普通请求集中在 Request。
- AI 请求集中在 AiService。
- 页面在 views。
- 通用组件在 components。

### 亮点 3：AI 能力嵌入真实业务

AI 不只是聊天，而是服务于社区内容生产、阅读和检索：

- 写作助手降低发帖门槛。
- 评论助手优化表达。
- 阅读助手降低长文理解成本。
- 搜索助手提升关键词质量。

### 亮点 4：旁路 AI 服务降低改造风险

原 EasyBBS 后端继续负责核心论坛业务，AI Node 服务只负责新增 AI 接口。这样：

- 不破坏原系统。
- 改动范围小。
- 容易联调。
- 容易替换模型。
- 后续可迁移到 Java 后端。

### 亮点 5：AI 失败可降级

项目对 AI 失败有 fallback，不会因为模型异常影响发帖、评论、阅读、搜索主流程。

### 亮点 6：编辑体验比较完整

支持富文本和 Markdown 两种编辑器，支持图片、封面、附件、摘要、积分设置，符合技术社区发帖需求。

### 亮点 7：阅读体验有增强

文章详情支持图片预览、代码高亮、目录解析、AI 提纲，适合技术文章阅读。

## 31. 面试高频追问与回答

### Q1：这个项目你主要负责什么？

可以回答：

我主要负责前端论坛功能的实现和 AI 能力接入。前端包括路由、页面、登录弹窗、文章列表、发帖编辑、文章详情、评论、搜索、用户中心和消息中心。AI 部分我做了前端组件、AI 请求封装和独立 Node AI 服务，把大模型能力接入到发帖、评论、阅读和搜索流程。

### Q2：为什么用 Pinia？

因为项目里有多处跨组件共享状态，比如登录用户、是否显示登录框、板块列表、当前板块高亮、消息未读数、系统配置。如果不用状态管理，就需要 props 和 emit 多层传递，组件耦合会变高。Pinia 写法简洁，和 Vue 3 Composition API 配合比较自然。

### Q3：登录超时怎么处理？

普通请求统一走 `Request.js`。如果后端返回 `code == 901`，说明登录超时，前端会打开登录弹窗，并清空 `loginUserInfo`。这样所有接口都不用重复写登录超时逻辑。

### Q4：为什么 AI 服务独立出来？

因为原 EasyBBS 后端主要负责论坛核心业务，AI 是新增能力。独立 Node 服务可以减少对原系统的侵入，也方便单独配置 API Key、模型地址和降级逻辑。以后如果有后端源码，也可以迁移到 Spring Boot 的 Controller 和 Service 里。

### Q5：AI 接口为什么要服务端转发？

API Key 不能放到前端，否则浏览器里会暴露。服务端转发可以统一保护 Key、做限流、日志、鉴权、成本统计、失败重试和 fallback。

### Q6：AI 写作助手怎么应用结果？

`AiPostAssistant` 调用 `AiService.postAssist`，拿到结果后通过 `emit('apply', result)` 传给 `EditPost.vue`。父组件的 `applyAiPatch` 遍历返回字段并合并到 `formData`。这样 AI 组件只负责生成建议，父页面负责决定如何应用。

### Q7：如果 AI 返回格式不正确怎么办？

服务端会尝试从模型返回中提取 JSON 并解析。如果解析失败，就返回本地 fallback。前端也有 fallback，所以不会因为 AI 返回异常导致页面崩溃。

### Q8：搜索为什么只是 AI 改写关键词？

这是低成本落地方案。原后端已有关键词搜索接口，AI 做意图理解和关键词推荐，可以提升搜索体验，同时不用重写搜索后端。后续可以加入 embedding、向量数据库和混合排序，升级为语义搜索。

### Q9：文章目录怎么实现？

文章详情页把 HTML 内容渲染后，查询正文里的 H1-H6 标签，动态设置 id，然后生成目录数组。点击目录项时滚动到对应标题，页面滚动时根据标题 offset 更新当前高亮项。

### Q10：代码高亮怎么实现？

文章详情引入 highlight.js，在内容渲染后查询 `pre code` 节点并调用高亮方法。Markdown 编辑器也使用 highlight.js 配合 GitHub 主题。

### Q11：项目里有哪些可以优化的地方？

可以回答：

- 统一 `commentOpen` 和 `commnetOpen` 字段命名。
- 清理无用 import 和 console。
- 修复个别拼写问题，例如 `pathRewirte`。
- AI 摘要可以按 `articleId + contentHash` 缓存。
- AI 接口可以加限流、鉴权和调用日志。
- 文章 HTML 可接入 DOMPurify 或后端白名单过滤。
- 请求层可以支持取消重复请求。
- 评论提交后可以根据后端审核状态决定是否立即展示。
- 附件下载可增强错误处理和文件名处理。
- 移动端适配还可以加强。

### Q12：如果让你把 AI Node 服务迁移到 Java，你怎么设计？

可以设计：

```txt
controller
  AiController

service
  AiService

client
  AiModelClient

config
  AiProperties

dto
  AiPostAssistRequest
  AiCommentAssistRequest
  AiArticleSummaryRequest
  AiSearchAssistRequest
```

Controller 接收 `/api/ai/**` 请求，Service 拼接 prompt 和处理业务，Client 调用大模型接口，Config 从配置文件读取 Key、Base URL 和模型名。

### Q13：这个项目怎么体现工程能力？

可以从三点说：

- 第一，普通业务请求、AI 请求、状态管理、路由和组件都有分层，没有把所有逻辑写在页面里。
- 第二，AI 采用旁路服务接入，不破坏原论坛后端，降低改造风险。
- 第三，AI 失败时有降级策略，保证主流程可用，体现了对稳定性和用户体验的考虑。

## 32. 可拓展知识点

### 32.1 SPA 路由

Vue Router 的 history 模式让 URL 更像正常路径，例如 `/post/123`。但生产部署时服务器要把未知路径回退到 `index.html`，否则刷新子路由会 404。

### 32.2 前端状态管理

Pinia 适合存放跨页面共享状态，但不应该把所有局部状态都放进去。比如发帖表单内容只属于 `EditPost.vue`，放组件内部即可；登录用户和消息数则适合放全局。

### 32.3 接口封装

请求封装不是简单包一层 axios，而是统一处理横切逻辑：

- Loading。
- 错误提示。
- 登录过期。
- 请求头。
- 超时。
- 文件上传。
- 业务 code 判断。

### 32.4 XSS 防护

论坛文章和评论属于用户生成内容，凡是使用 `v-html` 都要考虑 XSS。生产方案通常是后端过滤 + 前端谨慎渲染，避免直接信任用户输入。

### 32.5 AI 成本控制

AI 功能上线后要控制成本：

- 限制输入长度。
- 给接口做限流。
- 缓存摘要类结果。
- 对重复内容做 hash。
- 使用更便宜的小模型处理简单任务。
- 记录调用次数和 token 消耗。

### 32.6 语义搜索

如果升级搜索，可以这样做：

1. 发帖时对标题、摘要、正文生成 embedding。
2. 存入向量数据库，如 Milvus、pgvector、Elasticsearch dense vector。
3. 搜索时对 query 生成 embedding。
4. 做向量相似度召回。
5. 结合关键词匹配、热度、时间、板块等做混合排序。

### 32.7 AI 流式输出

当前 AI 请求是一次性返回。对于长内容生成，可以升级为 SSE 或 WebSocket 流式输出，让用户更早看到内容，提高体验。

## 33. 项目风险与不足

面试时不要只讲优点，也要能讲不足：

- 部分源码存在拼写问题，如 `commnetOpen`、`pathRewirte`。
- 部分文件有无用 import 和调试 `console.log`。
- `EditorHtml.vue` 中仍有 Vuex 风格的 `store.commit`，但项目实际用的是 Pinia，需要统一。
- 前端登录记住密码方案不适合生产。
- 文章详情 `v-html` 依赖后端过滤，否则有 XSS 风险。
- AI 服务使用 Node 原生 multipart 解析，适合轻量演示，生产可换成成熟框架和中间件。
- AI 接口目前没有限流、鉴权、成本统计。
- 前端整体更偏 PC 固定宽度，移动端适配不足。

讲不足时要补一句：这些不是方向错误，而是下一阶段工程化优化点。

## 34. 面试项目介绍模板

可以按 2 分钟版本这样说：

> 这个项目是一个基于 Vue 3 + Vite 的论坛社区前台。它包含用户登录注册、板块浏览、帖子列表、发帖编辑、文章详情、评论互动、点赞、附件下载、积分、用户中心、消息中心和搜索等功能。  
> 技术上我使用 Vue Router 管理页面路由，Pinia 管理登录用户、板块、消息数量和系统配置，Element Plus 负责基础 UI，普通业务接口通过 Axios 统一封装，处理 loading、错误提示和登录超时。发帖编辑器支持富文本和 Markdown 两种模式，文章详情支持代码高亮、图片预览和目录解析。  
> 项目比较有亮点的是 AI 增强能力。我没有把 AI 做成一个孤立聊天框，而是嵌入到论坛真实流程里：发帖时可以生成标题、摘要、润色正文和续写结构；评论时可以润色、生成友善回复和风险提示；阅读时可以生成文章摘要和重点；搜索时可以理解搜索意图并推荐关键词。  
> 架构上，原论坛后端继续运行在 7070，AI Node 服务独立运行在 7072，前端通过 Vite proxy 把普通 `/api/**` 请求转发到原后端，把 `/api/ai/**` 请求转发到 AI 服务。这样降低了对原系统的侵入，也方便后续迁移和扩展。AI 服务还做了本地 fallback，保证 AI 异常时不影响论坛主流程。

## 35. 最后总结

这个项目面试时的关键词是：

- 完整论坛业务闭环。
- Vue 3 前端工程化。
- Pinia 全局状态。
- Axios 请求统一封装。
- 双编辑器发帖体验。
- 文章详情阅读增强。
- AI 旁路服务。
- OpenAI-compatible 接口。
- Prompt JSON 约束。
- AI fallback 降级。
- 搜索意图理解。
- 可迁移、可扩展、低侵入。

最有说服力的表达是：

> 我不是为了用 AI 而用 AI，而是从论坛内容生产、评论互动、长文阅读和搜索检索这四个真实痛点出发，把 AI 能力嵌进原有业务链路。同时通过独立 AI 服务、统一封装和 fallback，保证新增能力不影响原论坛的稳定性。
