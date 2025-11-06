<template>
  <div class="contaniner-body search-body" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
    <div class="search-panel" :style="{ 'padding-top': startSearch ? '0px' : searchHeight + 'px' }">
      <el-form :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
        <!--input输入-->
        <el-form-item prop="">
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

const articleListInfo = ref({})
const search = async () => {
  loading.value = true
  let params = {
    keyword: formData.value.keyword,
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
  if (formData.value.keyword == '') articleListInfo.value = {}
}
</script>

<style lang="scss">
.search-body {
  background: #fff;
  padding: 10px;
  min-height: calc(100vh - 210px);
  .search-panel {
    display: flex;
    justify-content: center;
    .el-input {
      width: 700px;
    }
  }
}
</style>
