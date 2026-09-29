import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const loadEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, 'utf8')
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const index = trimmed.indexOf('=')
    if (index === -1) return

    const key = trimmed.slice(0, index).trim()
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')
    if (key && process.env[key] == null) {
      process.env[key] = value
    }
  })
}

loadEnvFile(path.resolve(process.cwd(), '.env'))
loadEnvFile(path.resolve(process.cwd(), 'ai-server', '.env'))

const PORT = Number(process.env.AI_SERVER_PORT || 7072)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

const ok = (data) => ({
  status: 'success',
  code: 200,
  info: '请求成功',
  data,
})

const fail = (message, code = 500) => ({
  status: 'error',
  code,
  info: message,
  data: null,
})

const sendJson = (res, body, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json;charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Requested-With',
  })
  res.end(JSON.stringify(body))
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

const parseMultipart = (body, contentType) => {
  const boundaryMatch = contentType.match(/boundary=(.+)$/)
  if (!boundaryMatch) return {}

  const boundary = `--${boundaryMatch[1]}`
  const text = body.toString('utf8')
  const params = {}

  text.split(boundary).forEach((part) => {
    const nameMatch = part.match(/name="([^"]+)"/)
    if (!nameMatch) return

    const valueStart = part.indexOf('\r\n\r\n')
    if (valueStart === -1) return

    const rawValue = part.slice(valueStart + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '')
    params[nameMatch[1]] = rawValue
  })

  return params
}

const parseParams = async (req) => {
  const body = await readBody(req)
  const contentType = req.headers['content-type'] || ''

  if (contentType.includes('application/json')) {
    return JSON.parse(body.toString('utf8') || '{}')
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(body.toString('utf8')))
  }

  if (contentType.includes('multipart/form-data')) {
    return parseMultipart(body, contentType)
  }

  return {}
}

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const asJson = (value, fallback) => {
  if (!value) return fallback
  const jsonMatch = value.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return fallback

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    return fallback
  }
}

const localPostAssist = ({ action, title, content, summary, editorType }) => {
  const text = stripHtml(content)
  const topic = title || text.slice(0, 24) || '社区讨论'

  if (action === 'title') {
    return { title: `${topic}：问题复盘与解决思路` }
  }
  if (action === 'summary') {
    return { summary: (text || summary || '本文整理了问题背景、处理过程和可继续讨论的方向。').slice(0, 180) }
  }
  if (action === 'polish') {
    const polished = text
      ? `我想系统整理一下这个问题：${text}\n\n欢迎大家补充更好的方案、踩坑经验或相关资料。`
      : '我想系统整理一下这个问题，包括背景、已尝试的方法、当前阻塞点，以及希望大家一起讨论的方向。'
    return editorType == 1 ? { markdownContent: polished, content: polished } : { content: `<p>${polished}</p>` }
  }

  const appendText =
    '\n\n可以从三个角度继续展开：\n1. 背景和目标：说明为什么要做这件事。\n2. 已尝试方案：列出关键步骤、效果和限制。\n3. 讨论问题：明确希望社区成员给出建议的点。'
  return editorType == 1
    ? { markdownContent: `${content || ''}${appendText}`, content: `${text}${appendText}` }
    : {
        content: `${content || ''}<p>可以从三个角度继续展开：</p><ol><li>背景和目标：说明为什么要做这件事。</li><li>已尝试方案：列出关键步骤、效果和限制。</li><li>讨论问题：明确希望社区成员给出建议的点。</li></ol>`,
      }
}

const localCommentAssist = ({ action, content }) => {
  const text = (content || '').trim()
  if (action === 'check') {
    const risky = ['傻', '垃圾', '滚', '废物'].some((word) => text.includes(word))
    return {
      riskLevel: risky ? 'medium' : 'low',
      suggestion: risky ? '这条评论可能包含攻击性表达，建议改成描述事实、问题和建议。' : '未发现明显风险，可以发布。',
    }
  }
  if (action === 'reply') {
    return {
      content: text
        ? `我理解你的观点。${text} 这个方向很有参考价值，也可以结合具体场景再验证一下。`
        : '我理解你的观点，这个方向很有参考价值。可以结合具体场景再验证一下。',
    }
  }
  return {
    content: text
      ? `我想更清楚地表达一下：${text}。如果有不同看法，也欢迎继续补充讨论。`
      : '我想补充一个想法：这个问题可以结合具体场景、已有方案和实际限制一起看。',
  }
}

const localArticleSummary = ({ title, content }) => {
  const text = stripHtml(content)
  return {
    summary: text
      ? `${title ? `《${title}》` : '这篇文章'}主要讨论：${text.slice(0, 180)}${text.length > 180 ? '...' : ''}`
      : '当前文章内容较少，暂时无法生成更完整的摘要。',
    keyPoints: ['核心问题与背景', '作者提供的解决思路', '评论区可继续讨论的方向'],
  }
}

const localSearchAssist = ({ keyword }) => {
  const text = (keyword || '').trim()
  return {
    intent: text ? `查找与“${text}”相关的帖子、经验和解决方案` : '查找社区内容',
    keywords: [text, `${text} 问题`, `${text} 解决方案`, `${text} 教程`].filter(Boolean),
  }
}

const chat = async (system, user, fallback) => {
  if (!OPENAI_API_KEY) {
    return { ...fallback, fromFallback: true, fallbackReason: 'OPENAI_API_KEY is not configured' }
  }

  const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return {
      ...fallback,
      fromFallback: true,
      fallbackReason: `model request failed: ${response.status} ${errorText.slice(0, 160)}`,
    }
  }

  const result = await response.json()
  return asJson(result.choices?.[0]?.message?.content, fallback)
}

const postAssist = (params) => {
  const fallback = localPostAssist(params)
  return chat(
    '你是中文技术社区的写作助手。只返回 JSON，不要 Markdown 代码块。字段按任务返回 title、summary、content、markdownContent 中需要的字段。',
    JSON.stringify({
      task: params.action,
      title: params.title,
      summary: params.summary,
      editorType: params.editorType,
      content: stripHtml(params.content || '').slice(0, 3000),
    }),
    fallback,
  )
}

const commentAssist = (params) => {
  const fallback = localCommentAssist(params)
  return chat(
    '你是中文技术社区评论助手。只返回 JSON。润色/回复返回 content；风险检查返回 riskLevel 和 suggestion。',
    JSON.stringify({
      task: params.action,
      content: params.content || '',
      articleId: params.articleId || '',
    }),
    fallback,
  )
}

const articleSummary = (params) => {
  const fallback = localArticleSummary(params)
  return chat(
    '你是中文技术社区阅读助手。只返回 JSON，字段为 summary 和 keyPoints，keyPoints 是字符串数组。',
    JSON.stringify({
      title: params.title || '',
      content: stripHtml(params.content || '').slice(0, 5000),
    }),
    fallback,
  )
}

const searchAssist = (params) => {
  const fallback = localSearchAssist(params)
  return chat(
    '你是中文论坛搜索助手。只返回 JSON，字段为 intent 和 keywords，keywords 是 3 到 6 个搜索词。',
    JSON.stringify({
      keyword: params.keyword || '',
    }),
    fallback,
  )
}

const routes = {
  '/api/ai/post/assist': postAssist,
  '/api/ai/comment/assist': commentAssist,
  '/api/ai/article/summary': articleSummary,
  '/api/ai/search/assist': searchAssist,
}

const status = () => ({
  port: PORT,
  model: OPENAI_MODEL,
  apiBase: OPENAI_API_BASE,
  hasApiKey: Boolean(OPENAI_API_KEY),
})

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, ok(null))
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)
  const handler = routes[url.pathname]

  if (req.method === 'GET' && url.pathname === '/api/ai/status') {
    sendJson(res, ok(status()))
    return
  }

  if (req.method !== 'POST' || !handler) {
    sendJson(res, fail('接口不存在', 404), 404)
    return
  }

  try {
    const params = await parseParams(req)
    const data = await handler(params)
    sendJson(res, ok(data))
  } catch (error) {
    sendJson(res, fail(error.message || 'AI 服务异常'), 500)
  }
})

server.listen(PORT, () => {
  console.log(`EasyBBS AI server is running at http://localhost:${PORT}`)
})
