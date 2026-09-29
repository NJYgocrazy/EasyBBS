<template>
  <div class="ai-article-insight">
    <div class="ai-orbit">AI</div>
    <div class="ai-insight-head">
      <div>
        <div class="eyebrow">AI 阅读助手</div>
        <div class="title">智能提纲</div>
      </div>
      <el-button
        class="generate-btn"
        size="small"
        type="primary"
        :loading="loading"
        @click="loadSummary"
      >
        {{ summary ? '刷新' : '生成' }}
      </el-button>
    </div>

    <div class="empty-state" v-if="!summary && !loading">
      一键提炼文章主旨、重点和讨论方向。
    </div>
    <div class="summary" v-if="summary">{{ summary }}</div>
    <div class="points" v-if="keyPoints.length">
      <div class="point" v-for="item in keyPoints" :key="item">{{ item }}</div>
    </div>
    <div class="fallback" v-if="fromFallback">
      已使用本地建议
      <span v-if="fallbackReason">：{{ fallbackReason }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AiService from '@/utils/AiService'

const props = defineProps({
  articleInfo: {
    type: Object,
    default: () => ({}),
  },
})

const loading = ref(false)
const summary = ref('')
const keyPoints = ref([])
const fromFallback = ref(false)
const fallbackReason = ref('')

const loadSummary = async () => {
  loading.value = true
  const result = await AiService.articleSummary({
    articleId: props.articleInfo.articleId,
    title: props.articleInfo.title,
    content: props.articleInfo.content,
  })
  summary.value = result.summary || ''
  keyPoints.value = result.keyPoints || []
  fromFallback.value = !!result.fromFallback
  fallbackReason.value = result.fallbackReason || ''
  loading.value = false
}
</script>

<style lang="scss" scoped>
.ai-article-insight {
  position: relative;
  margin-bottom: 12px;
  padding: 14px;
  overflow: hidden;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 58%, #ecfdf5 100%);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
  .ai-orbit {
    position: absolute;
    right: -12px;
    top: -12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #2563eb;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0;
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.24);
  }
  .ai-insight-head {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .eyebrow {
    color: #2563eb;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
  }
  .title {
    color: #111827;
    font-size: 18px;
    font-weight: 700;
    line-height: 26px;
  }
  .generate-btn {
    min-width: 58px;
    border-radius: 4px;
  }
  .empty-state,
  .summary {
    position: relative;
    z-index: 1;
    margin-top: 12px;
    color: #374151;
    font-size: 13px;
    line-height: 22px;
  }
  .empty-state {
    color: #6b7280;
  }
  .points {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
    .point {
      padding: 7px 9px;
      border: 1px solid #dbeafe;
      border-radius: 5px;
      background: rgba(255, 255, 255, 0.78);
      color: #1f2937;
      font-size: 12px;
      line-height: 18px;
    }
  }
  .fallback {
    position: relative;
    z-index: 1;
    margin-top: 10px;
    color: #64748b;
    font-size: 12px;
    line-height: 18px;
  }
}
</style>
