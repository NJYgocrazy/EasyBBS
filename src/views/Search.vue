<template>
  <div class="contaniner-body search-body" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
    <div class="search-panel" :style="{ 'padding-top': startSearch ? '0px' : searchHeight + 'px' }">
      <el-form :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
        <!--input输入-->
        <el-form-item prop="keyword">
          <el-input
            size="large"
            clearable
            placeholder="请输入你想要查找的关键词"
            v-model.trim="formData.keyword"
            @keyup.enter="search"
            @focus="startSearchHandler"
            @change="changeInput"
          >
            <template #suffix>
              <span
                class="iconfont icon-search"
                @click="search"
                @blur="formData.keyword = $event.target.value.trim()"
              ></span>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <div class="ai-search-panel" v-if="startSearch">
        <div class="ai-search-actions">
          <el-button size="small" type="primary" plain :loading="aiSearching" @click="loadAiSearch">
            AI 理解搜索意图
          </el-button>
          <span v-if="aiIntent">{{ aiIntent }}</span>
        </div>
        <div class="ai-keywords" v-if="aiKeywords.length">
          <el-tag
            v-for="item in aiKeywords"
            :key="item"
            size="small"
            effect="plain"
            @click="useAiKeyword(item)"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>
    </div>

    <div class="ariticle-list">
      <DataList
        :loading="loading"
        :dataSource="articleListInfo"
        @loadData="search"
        noDataMsg="暂无帖子，快去发帖吧~"
      >
        <template #default="{ data }">
          <ArticleListItem
            :data="data"
            :showComment="showCommnet"
            :showHtmlTitle="true"
          ></ArticleListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import ArticleListItem from '@/views/forum/ArticleListItem.vue'
import { useAllDataStore } from '@/store'
import { ref, watch, getCurrentInstance, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import message from '@/utils/Message'
import AiService from '@/utils/AiService'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const store = useAllDataStore()

const formData = ref({})
const formDataRef = ref()
const rules = {
  keyword: [
    { required: true, message: '请输入关键字' },
    { min: 3, message: '关键字太少，至少三个字' },
  ],
}

const api = {
  search: '/forum/search',
}

const searchHeight = (window.innerHeight - 60 - 140 - 60) / 2

const loading = ref(false)
const aiSearching = ref(false)
const aiIntent = ref('')
const aiKeywords = ref([])

const articleListInfo = ref({})
const search = async () => {
  const keyword = (formData.value.keyword || '').trim()
  formData.value.keyword = keyword

  if (!keyword) {
    proxy.Message.warning('请输入关键词')
    return
  }

  if (keyword.length < 3) {
    proxy.Message.warning('关键词太短，至少三个字符')
    return
  }

  loading.value = true
  let params = {
    keyword,
  }

  let res = await proxy.Request({
    url: api.search,
    params: params,
    showLoading: false,
  })

  loading.value = false

  if (!res) {
    return
  }

  let list = res.data.list
  list.forEach((element) => {
    element.title = element.title.replace(
      params.keyword,
      `<span style="color:red">${params.keyword}</span>`,
    )
  })

  articleListInfo.value = res.data
}

const startSearch = ref(false)
const startSearchHandler = () => {
  startSearch.value = true
}

const showCommnet = ref(true)

watch(
  () => store.sysSetting,
  (newVal, oldVal) => {
    if (newVal) showCommnet.value = newVal.commnetOpen
  },
  { immediate: true, deep: true },
)

const changeInput = () => {
  aiIntent.value = ''
  aiKeywords.value = []
  if (formData.value.keyword == '') articleListInfo.value = {}
}

const loadAiSearch = async () => {
  if (!formData.value.keyword) {
    proxy.Message.warning('请先输入关键词')
    return
  }

  aiSearching.value = true
  const result = await AiService.searchAssist({
    keyword: formData.value.keyword,
  })
  aiIntent.value = result.intent || ''
  aiKeywords.value = result.keywords || []
  aiSearching.value = false
}

const useAiKeyword = (keyword) => {
  formData.value.keyword = keyword
  search()
}
</script>

<style lang="scss">
.search-body {
  background: #fff;
  padding: 10px;
  min-height: calc(100vh - 210px);
  .search-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .el-input {
      width: 700px;
    }
    .ai-search-panel {
      width: 700px;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #dbeafe;
      border-radius: 6px;
      background: #f8fbff;
      .ai-search-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #4b5563;
        font-size: 13px;
      }
      .ai-keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
        .el-tag {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
