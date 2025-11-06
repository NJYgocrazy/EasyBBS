<template>
  <div class="container-body message-center" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
    <div class="user-banner">
      <router-link :to="'/'" class="a-link">首页</router-link>
      <span class="iconfont icon-right"></span>
      <span>个人中心</span>
    </div>
    <div class="message-panel">
      <div class="tab-list">
        <el-tabs :model-value="activeTabName" @tabChange="changeTab">
          <el-tab-pane name="reply">
            <template #label>
              <div class="tag-item">
                <span class="text">回复我的</span>
                <span class="count-tag" v-if="messageCntInfo.reply != 0">{{
                  messageCntInfo.reply > 99 ? '99+' : messageCntInfo.reply
                }}</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likePost">
            <template #label>
              <div class="tag-item">
                <span class="text">赞了我的文章</span>
                <span class="count-tag" v-if="messageCntInfo.likePost != 0">{{
                  messageCntInfo.likePost > 99 ? '99+' : messageCntInfo.likePost
                }}</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="downloadAttachment">
            <template #label>
              <div class="tag-item">
                <span class="text">下载了我的附件</span>
                <span class="count-tag" v-if="messageCntInfo.downloadAttachment != 0">{{
                  messageCntInfo.downloadAttachment > 99 ? '99+' : messageCntInfo.downloadAttachment
                }}</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="likeComment">
            <template #label>
              <div class="tag-item">
                <span class="text">赞了我的评论</span>
                <span class="count-tag" v-if="messageCntInfo.likeComment != 0">{{
                  messageCntInfo.likeComment > 99 ? '99+' : messageCntInfo.likeComment
                }}</span>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane name="sys">
            <template #label>
              <div class="tag-item">
                <span class="text">系统消息</span>
                <span class="count-tag" v-if="messageCntInfo.sys != 0">{{
                  messageCntInfo.sys > 99 ? '99+' : messageCntInfo.sys
                }}</span>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
        <router-link :to="`/user/${userId}`" class="a-link go-ucenter"
          >&lt;&lt;个人中心</router-link
        >
      </div>

      <div class="message-list">
        <DataList
          :loading="loading"
          :dataSource="messageListInfo"
          @loadData="loadMessageList"
          noDataMsg="暂无相关文章"
        >
          <template #default="{ data }">
            <!-- 系统消息 -->
            <div class="message-item" v-if="data.messageType == 0">
              <div class="message-content">
                <span v-html="data.messageContent"></span>
                <span class="create-time">{{ data.createTime }}</span>
              </div>
            </div>
            <!-- 回复我的 -->
            <div class="message-item" v-if="data.messageType == 1">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  对我的文章【<router-link :to="`/post/${data.articleId}`" class="a-link">{{ data.articleTitle }}</router-link>】发表了评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的评论 -->
             <div class="message-item" v-if="data.messageType == 3">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在文章【<router-link :to="`/post/${data.articleId}`" class="a-link">{{ data.articleTitle }}</router-link>】中赞了我的评论
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
            <!-- 赞了我的文章 -->
             <div class="message-item" v-if="data.messageType == 2">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  赞了我的文章【<router-link :to="`/post/${data.articleId}`" class="a-link">{{ data.articleTitle }}</router-link>】
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
              </div>
            </div>
            <!-- 下载了我的附件 -->
             <div class="message-item" v-if="data.messageType == 4">
              <Avatar :userId="data.sendUserId" :width="50"></Avatar>
              <div class="message-content">
                <div>
                  <router-link class="a-link" :to="`/user/${data.sendUserId}`"
                    >@{{ data.sendNickName }}</router-link
                  >
                  在我的文章【<router-link :to="`/post/${data.articleId}`" class="a-link">{{ data.articleTitle }}</router-link>】中下载了我的附件
                  <span class="create-time">{{ data.createTime }}</span>
                </div>
                <div class="reply-content" v-html="data.messageContent"></div>
              </div>
            </div>
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
import message from '@/utils/Message'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const api = {
  loadMessageList: '/ucenter/loadMessageList',
}

const store = useAllDataStore()

const activeTabName = ref('reply')

const messageCntInfo = ref({})
const changeTab = (type) => {
  router.push(`/user/message/${type}`)
}

const loading = ref(false)

const messageListInfo = ref({})
const loadMessageList = async () => {
  loading.value = true
  let params = {
    pageNo: messageListInfo.value.pageNo,
    code: activeTabName.value,
  }

  let res = await proxy.Request({
    url: api.loadMessageList,
    params: params,
    showLoading: false,
  })

  loading.value = false

  if (!res) return
  messageListInfo.value = res.data
  store.readMessage(activeTabName.value)
}

watch(
  () => route.params.type,
  (newVal, oldVal) => {
    if (newVal) {
      activeTabName.value = newVal
      loadMessageList()
    }
  },
  { immediate: true, deep: true },
)

const userId = ref(null)

watch(
  () => store.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal) userId.value = newVal.userId
  },
  { immediate: true, deep: true },
)

watch(
  () => store.messageCntInfo,
  (newVal, oldVal) => {
    messageCntInfo.value = newVal || {}
  },
  { immediate: true, deep: true },
)
</script>

<style lang="scss" scoped>
.message-center {
  .user-banner {
    color: #9ba7b9;
    line-height: 35px;
    .icon-right {
      padding: 0px 5px;
    }
  }
  .message-panel {
    background: #fff;
    padding: 10px;
    margin-top: 5px;
    .tab-list {
      position: relative;
      .tag-item {
        position: relative;
        padding: 0px 10px;
        .count-tag {
          position: absolute;
          right: -12px;
          height: 15px;
          line-height: 15px;
          min-width: 20px;
          display: inline-block;
          background-color: #f56c6c;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          color: #fff;
          margin-left: 10px;
        }
      }
      .go-ucenter {
        position: absolute;
        top: 5px;
        right: 10px;
        font-size: 14px;
      }
    }
    .message-list {
      .message-item {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        font-size: 14px;
        border-bottom: 1px solid #ddd;
        padding: 10px;
        .message-content {
          margin-left: 5px;
          .create-time {
            color: #9ba7b9;
            margin-left: 10px;
          }
          .reply-content {
            border-left: 2px solod #11a8f4;
            padding: 5px;
            margin-top: 5px;
          }
        }
      }
    }
  }
}
</style>
