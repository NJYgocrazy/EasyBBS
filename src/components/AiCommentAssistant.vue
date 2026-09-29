<template>
  <div class="ai-comment-assistant">
    <div class="ai-brand">
      <span class="ai-badge">AI</span>
      <span class="ai-title">评论助手</span>
    </div>

    <div class="ai-actions">
      <el-button
        class="ai-action"
        size="small"
        :loading="loadingAction === 'polish'"
        @click="runAssist('polish')"
      >
        润色
      </el-button>
      <el-button
        class="ai-action"
        size="small"
        :loading="loadingAction === 'reply'"
        @click="runAssist('reply')"
      >
        友善回复
      </el-button>
      <el-button
        class="ai-action"
        size="small"
        plain
        :loading="loadingAction === 'check'"
        @click="runAssist('check')"
      >
        风险提示
      </el-button>
    </div>

    <div v-if="tip" :class="['ai-tip', riskLevel]">{{ tip }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AiService from '@/utils/AiService'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  articleId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update'])

const loadingAction = ref('')
const tip = ref('')
const riskLevel = ref('')

const runAssist = async (action) => {
  loadingAction.value = action
  tip.value = ''
  riskLevel.value = ''

  const result = await AiService.commentAssist({
    action,
    content: props.content,
    articleId: props.articleId,
  })

  if (action === 'check') {
    riskLevel.value = result.riskLevel || 'low'
    tip.value = result.suggestion || '已完成检查'
  } else {
    emit('update', result.content || '')
    tip.value = result.fromFallback
      ? `已使用本地建议${result.fallbackReason ? `：${result.fallbackReason}` : ''}`
      : '已应用 AI 建议'
  }

  loadingAction.value = ''
}
</script>

<style lang="scss" scoped>
.ai-comment-assistant {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 70%);
  box-sizing: border-box;
  .ai-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-right: 2px;
    white-space: nowrap;
  }
  .ai-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 22px;
    border-radius: 4px;
    background: #2563eb;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0;
    box-shadow: 0 6px 14px rgba(37, 99, 235, 0.18);
  }
  .ai-title {
    color: #1f2937;
    font-size: 13px;
    font-weight: 600;
  }
  .ai-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    .ai-action {
      margin-left: 0;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.86);
    }
  }
  .ai-tip {
    flex: 1;
    min-width: 180px;
    color: #475569;
    font-size: 12px;
    line-height: 18px;
  }
  .low {
    color: #15803d;
  }
  .medium {
    color: #b45309;
  }
  .high {
    color: #b91c1c;
  }
}
</style>
