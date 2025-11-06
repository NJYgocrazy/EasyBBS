<template>
  <div
    class="container-body article-list-container"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
  >
    <!-- 二级板块 -->
    <div class="sub-board" v-if="pBoardId">
      <span :class="['board-item', boardId == 0 ? 'active' : '']">
        <router-link :to="`/forum/${pBoardId}`">全部</router-link>
      </span>
      <span
        v-for="item in subBoardList"
        :class="['board-item', item.boardId == boardId ? 'active' : '']"
      >
        <router-link :to="`/forum/${item.pBoardId}/${item.boardId}`">{{item.boardName}}</router-link>
      </span>
    </div>
    <div class="article-panel">
      <div class="top-tab">
        <div :class="['tab', orderType == 0 ? 'active' : '']" @click="changeOrderType(0)">热榜</div>
        <el-divider direction="vertical"></el-divider>
        <div :class="['tab', orderType == 1 ? 'active' : '']" @click="changeOrderType(1)">
          发布时间
        </div>
        <el-divider direction="vertical"></el-divider>
        <div :class="['tab', orderType == 2 ? 'active' : '']" @click="changeOrderType(2)">最新</div>
      </div>
      <div class="ariticle-list">
        <DataList
          :loading="loading"
          :dataSource="articleListInfo"
          @loadData="loadArticle"
          noDataMsg="暂无帖子，快去发帖吧~"
        >
          <template #default="{ data }">
            <ArticleListItem :data="data" :showComment="showCommnet"></ArticleListItem>
          </template>
        </DataList>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'

import { useAllDataStore } from '@/store'

import ArticleListItem from './ArticleListItem.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const state = useAllDataStore()

const api = {
  loadArticle: '/forum/loadArticle',
}

const loading = ref(false)

//一级板块
const pBoardId = ref(0)
//二级板块
const boardId = ref(0)

const orderType = ref(0)
const changeOrderType = (type) => {
  orderType.value = type
  loadArticle()
}
const articleListInfo = ref({})
const loadArticle = async () => {
  loading.value = true
  let params = {
    pageNo: articleListInfo.value.pageNo,
    // boardId: 0,
    orderType: orderType.value || 0,
    pBoardId: pBoardId.value || 0,
    boardId: boardId.value || 0,
  }

   // 如果都为0，可以不传递这些参数或者传递特殊值
  if (pBoardId.value == 0 && boardId.value == 0) {
    // 可以选择不传递板块参数，让后端返回所有文章
    delete params.pBoardId
    delete params.boardId
    // 或者传递特殊值
    // params.pBoardId = -1 // 后端需要支持这种特殊值
  }

  let res = await proxy.Request({
    url: api.loadArticle,
    params: params,
    showLoading: false,
  })

  loading.value = false

  if (!res) return
  articleListInfo.value = res.data
}

onMounted(() => {
  loadArticle()
})

//二级板块
const subBoardList = ref([])

const setSubBoard = () => {
  
  subBoardList.value = state.getSubBoardList(pBoardId.value)
 
}

//监听路由变化
watch(
  () => route.params,
  (newVal, oldVal) => {
    pBoardId.value = newVal.pBoardId || 0
    boardId.value = newVal.boardId || 0
    setSubBoard()
    loadArticle()
    state.setActivePBoardId(pBoardId.value)
    state.setActiveBoardId(boardId.value)
  },
  { immediate: true, deep: true },
)

//监听 板块变化
watch(
  () => state.boardList,
  (newVal, oldVal) => {
    setSubBoard()
  },
  { immediate: true, deep: true },
)

const showCommnet = ref(true)

watch(() => state.sysSetting, (newVal, oldVal) => {
  if(newVal) showCommnet.value = newVal.commnetOpen
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped>
.article-list-container {
  .sub-board {
    padding: 10px 0px 15px 0px;
    .board-item {
      background: #fff;
      border-radius: 15px;
      padding: 2px 10px;
      margin-right: 10px;
      color: #909090;
      cursor: pointer;
      font-size: 14px;
      a {
        text-decoration: none;
        color: #909090;
      }
    }
    .active {
      background: var(--link);
      a {
        color: #fff;
      }
    }
  }
  position: relative;
  .article-panel {
    background: #fff;
    .top-tab {
      display: flex;
      align-items: center;
      padding: 10px;
      font-size: 15px;
      border-bottom: 1px solid #ddd;
      // margin-top: 70px;
      .tab {
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
}
</style>
