<template>
  <div class="ai-post-assistant">
    <div class="ai-mark">AI</div>

    <div class="ai-head">
      <div>
        <!-- <div class="ai-eyebrow">智能创作</div> -->
        <div class="ai-title">AI 写作助手</div>
        <div class="ai-desc">标题、摘要、正文润色和结构续写都可以一键应用。</div>
      </div>
      <el-tooltip v-if="fallbackTip" :content="fallbackReason || '后端 AI 未返回，已使用本地建议'">
        <el-tag type="info" size="small">本地建议</el-tag>
      </el-tooltip>
    </div>

    <div class="ai-actions">
      <el-button
        class="primary-action"
        size="small"
        type="primary"
        :loading="loadingAction === 'title'"
        @click="runAssist('title')"
      >
        生成标题
      </el-button>
      <el-button size="small" :loading="loadingAction === 'summary'" @click="runAssist('summary')">
        生成摘要
      </el-button>
      <el-button size="small" :loading="loadingAction === 'polish'" @click="runAssist('polish')">
        润色正文
      </el-button>
      <el-button size="small" :loading="loadingAction === 'continue'" @click="runAssist('continue')">
        续写结构
      </el-button>
    </div>

    <div class="ai-preview" v-if="previewText">
      <div class="preview-label">生成结果</div>
      <div class="preview-text">{{ previewText }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import AiService from '@/utils/AiService'

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
  editorType: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(['apply'])

const loadingAction = ref('')
const fallbackTip = ref(false)
const fallbackReason = ref('')
const previewText = ref('')

const currentContent = computed(() => {
  if (props.editorType == 1) {
    return props.formData.markdownContent || props.formData.content || ''
  }
  return props.formData.content || ''
})

const runAssist = async (action) => {
  loadingAction.value = action
  fallbackTip.value = false
  fallbackReason.value = ''
  previewText.value = ''

  const result = await AiService.postAssist({
    action,
    title: props.formData.title,
    summary: props.formData.summary,
    content: currentContent.value,
    editorType: props.editorType,
  })

  fallbackTip.value = !!result.fromFallback
  fallbackReason.value = result.fallbackReason || ''
  previewText.value =
    result.title || result.summary || AiService.stripHtml(result.content || result.markdownContent || '')
  emit('apply', result)
  loadingAction.value = ''
}
</script>

<style lang="scss" scoped>
.ai-post-assistant {
  position: relative;
  margin-bottom: 14px;
  padding: 14px;
  overflow: hidden;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 62%, #ecfdf5 100%);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
  .ai-mark {
    position: absolute;
    right: -12px;
    top: -12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    background: #2563eb;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0;
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
  }
  .ai-head {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-right: 26px;
  }
  .ai-eyebrow {
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }
  .ai-title {
    color: #111827;
    font-size: 18px;
    font-weight: 700;
    line-height: 26px;
  }
  .ai-desc {
    margin-top: 4px;
    color: #64748b;
    font-size: 12px;
    line-height: 18px;
  }
  .ai-actions {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin-top: 12px;
    .el-button {
      width: 100%;
      margin-left: 0;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.9);
    }
    .primary-action {
      background: #2563eb;
    }
  }
  .ai-preview {
    position: relative;
    z-index: 1;
    margin-top: 12px;
    padding: 10px;
    border: 1px solid #dbeafe;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.82);
    .preview-label {
      margin-bottom: 4px;
      color: #2563eb;
      font-size: 12px;
      font-weight: 600;
      line-height: 18px;
    }
    .preview-text {
      color: #374151;
      font-size: 13px;
      line-height: 21px;
      max-height: 88px;
      overflow: auto;
    }
  }
}
</style>
