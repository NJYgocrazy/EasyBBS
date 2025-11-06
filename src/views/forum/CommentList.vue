<template>
  <div class="comment-body">
    <div class="comment-title">
      <div class="title">评论<span class="count">{{ commentListInfo.totalCount}}</span></div>
      <div class="tab">
        <span @click="orderChange(0)" :class="['tab-item',orderType == 0 ? 'active' : '']">热榜</span>
        <el-divider direction="vertical" />
        <span @click="orderChange(1)" :class="['tab-item',orderType == 1 ? 'active' : '']">最新</span>
      </div>
    </div>
    <!-- 发送评论 -->
    <div class="comment-form-panel">
     <PostComment
     :articleId="articleId"
     :avatarWidth="50"
     :userId ="currentUserInfo.userId" 
     :showInsertImg="currentUserInfo.userId != null"
     :pCommentId="0"
     @postCommentFinish = "postCommentFinish"
     ></PostComment>
    </div>
    <div class="comment-list">
      <DataList :dataSource="commentListInfo" :loading="loading" @loadData="loadComment" noDataMsg = "暂无评论，快来一起讨论吧！">
        <template #default="{ data }">
          <CommentListItem 
          :articleId="articleId"
          :commentData="data" 
          :articleUserId="articleUserId"
          :currentUserId="currentUserInfo.userId"
          @postCommentFinish="postCommentFinish"
          @reloadData="loadComment"
          ></CommentListItem>
        </template>
      </DataList>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useAllDataStore } from '@/store'
import CommentListItem from './CommentListItem.vue'
import PostComment from './PostComment.vue'
const { proxy } = getCurrentInstance()

const router = useRouter()
const route = useRoute()
const store = useAllDataStore()

const api = {
  loadComment: '/comment/loadComment',
  postCommnet: '/comment/postComment',
  doLike: '/comment/doLike',
  changeTopType: '/comment/changeTopType',
}

const props = defineProps({
  articleId: {
    type: String,
  },
  articleUserId: {
    type: String,
  },
})

const orderType = ref(0)

const orderChange = (type) => {
  orderType.value = type;
  loadComment()
}


//评论列表
const commentListInfo = ref({})

const loading = ref(null)

const loadComment = async () => {
  let params = {
    pageNo: commentListInfo.value.pageNo,
    articleId: props.articleId,
    orderType: orderType.value,
  }
  loading.value = true
  let res = await proxy.Request({
    url: api.loadComment,
    params,
    showLoading: false
  })

  loading.value = false

  if (!res) {
    return
  }

  commentListInfo.value = res.data
}

loadComment()

//隐藏所有回复框
const handleAllReplyHandler = () => {
  commentListInfo.value.list.forEach(element => {
    element.showReply = false;
  })
}


const emit = defineEmits(['updateCommentCount'])
const postCommentFinish = (resdata) => {
  commentListInfo.value.list.unshift(resdata)
  const totalCount = commentListInfo.value.totalCount + 1;
  commentListInfo.value.totalCount = totalCount
  emit("updateCommentCount",totalCount)
}

//当前用户信息
const currentUserInfo = ref({})

watch(
  () => store.loginUserInfo,
  (newVal, oldVal) => {
    currentUserInfo.value = newVal || {}
  },
  { immediate: true, deep: true },
)

console.log(currentUserInfo.value)

//选择图片
const selectImg = () => {}
</script>

<style lang="scss" scoped>
.comment-body {
  .comment-title {
    display: flex;
    align-items: center;
  }
  .title {
    font-size: 20px;
    .count {
      font-size: 14px;
      padding: 0px 10px;
    }
  }
  .tab{
    .tab-item{
      cursor: pointer;
    }
    .active {
      color: var(--link)
    }
  }
  .comment-form-panel {
    margin-top: 20px;
    
  }
}
</style>
