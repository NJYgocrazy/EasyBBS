const AI_BASE = '/api/ai'

const stripHtml = (html = '') => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const normalizeText = (value = '') => value.replace(/\s+/g, ' ').trim()

const postForm = async (url, params = {}) => {
  const formData = new FormData()
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key] == null ? '' : params[key])
  })

  const response = await fetch(`${AI_BASE}${url}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (!response.ok) {
    throw new Error(`AI request failed: ${response.status}`)
  }

  const result = await response.json()
  if (result.code && result.code !== 200) {
    throw new Error(result.info || 'AI request failed')
  }
  return result.data || result
}

const pickTopic = (content = '', fallback = '社区讨论') => {
  const text = normalizeText(stripHtml(content))
  return text.slice(0, 28) || fallback
}

const localPostAssist = ({ action, title, content, summary, editorType }) => {
  const plainText = normalizeText(stripHtml(content))
  const topic = title || pickTopic(content)

  if (action === 'title') {
    return {
      title: `${topic.slice(0, 24)}：经验、问题与解决思路`,
    }
  }

  if (action === 'summary') {
    return {
      summary: (plainText || summary || '这篇帖子围绕实际问题展开，梳理背景、核心过程和可复用经验。').slice(
        0,
        180,
      ),
    }
  }

  if (action === 'polish') {
    const polished = plainText
      ? `我想系统整理一下这个问题：${plainText}\n\n欢迎大家补充更好的方案、踩坑经验或相关资料。`
      : '我想系统整理一下这个问题，包括背景、已经尝试过的方法、目前遇到的阻塞点，以及希望大家一起讨论的方向。'
    return editorType == 1 ? { markdownContent: polished, content: polished } : { content: `<p>${polished}</p>` }
  }

  const continuation =
    '\n\n可以从三个角度继续展开：\n1. 背景和目标：说明为什么要做这件事。\n2. 已尝试方案：列出关键步骤、效果和限制。\n3. 讨论问题：明确希望社区成员给出建议的点。'

  if (editorType == 1) {
    return {
      markdownContent: `${content || ''}${continuation}`,
      content: `${plainText}${continuation}`,
    }
  }

  return {
    content: `${content || ''}<p>可以从三个角度继续展开：</p><ol><li>背景和目标：说明为什么要做这件事。</li><li>已尝试方案：列出关键步骤、效果和限制。</li><li>讨论问题：明确希望社区成员给出建议的点。</li></ol>`,
  }
}

const localCommentAssist = ({ action, content }) => {
  const text = normalizeText(content)

  if (action === 'check') {
    const riskyWords = ['傻', '垃圾', '滚', '废物']
    const hasRisk = riskyWords.some((word) => text.includes(word))
    return {
      riskLevel: hasRisk ? 'medium' : 'low',
      suggestion: hasRisk
        ? '这条评论可能包含攻击性表达，建议改成描述事实、问题和建议。'
        : '未发现明显风险，可以发布。建议保持观点清晰、语气友好。',
    }
  }

  if (action === 'reply') {
    return {
      content: text
        ? `我理解你的观点。${text} 这个方向很有参考价值，我也想补充一点：可以结合具体场景再验证一下。`
        : '我理解你的观点，这个方向很有参考价值。可以结合具体场景再验证一下，看看是否适合当前问题。',
    }
  }

  return {
    content: text
      ? `我想更清楚地表达一下：${text}。如果有不同看法，也欢迎继续补充讨论。`
      : '我想补充一个想法：这个问题可以结合具体场景、已有方案和实际限制一起看，可能会更容易找到合适的解法。',
  }
}

const localArticleSummary = ({ title, content }) => {
  const text = normalizeText(stripHtml(content))
  return {
    summary: text
      ? `${title ? `《${title}》` : '这篇文章'}主要讨论：${text.slice(0, 160)}${text.length > 160 ? '...' : ''}`
      : '当前文章内容较少，暂时无法生成更完整的摘要。',
    keyPoints: ['核心问题与背景', '作者提供的解决思路', '评论区可继续讨论的方向'],
  }
}

const localSearchAssist = ({ keyword }) => {
  const base = normalizeText(keyword)
  return {
    intent: base ? `查找与“${base}”相关的帖子、经验和解决方案` : '查找社区内容',
    keywords: [base, `${base} 问题`, `${base} 解决方案`, `${base} 教程`].filter(Boolean),
  }
}

const withFallback = async (request, fallback) => {
  try {
    return await request()
  } catch (error) {
    return {
      ...fallback(),
      fromFallback: true,
    }
  }
}

export default {
  stripHtml,
  postAssist(params) {
    return withFallback(
      () => postForm('/post/assist', params),
      () => localPostAssist(params),
    )
  },
  commentAssist(params) {
    return withFallback(
      () => postForm('/comment/assist', params),
      () => localCommentAssist(params),
    )
  },
  articleSummary(params) {
    return withFallback(
      () => postForm('/article/summary', params),
      () => localArticleSummary(params),
    )
  },
  searchAssist(params) {
    return withFallback(
      () => postForm('/search/assist', params),
      () => localSearchAssist(params),
    )
  },
}
