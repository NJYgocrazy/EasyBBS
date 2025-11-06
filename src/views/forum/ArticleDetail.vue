<template>
  <div
    class="container-body article-detail-body"
    :style="{ width: proxy.globalInfo.bodyWidth + 'px' }"
    v-if="Object.keys(articleInfo).length > 0"
  >
    <!-- 板块导航 -->
    <div class="board-info">
      <router-link :to="`/forum/${articleInfo.pBoardId}`" class="a-link">
        {{ articleInfo.pBoardName }}
      </router-link>
      <span class="iconfont icon-right"></span>

      <router-link
        class="a-link"
        :to="`/fourm/${articleInfo.pBoardId}${articleInfo.boardId ? '/' + articleInfo.boardId : ''}`"
      >
        {{ articleInfo.boardId ? articleInfo.boardName : '全部' }}
      </router-link>
      <span class="iconfont icon-right"></span>

      <span>{{ articleInfo.title }}</span>
    </div>
    <!-- 文章详情 -->
    <div class="detail-container" :style="{ width: proxy.globalInfo.bodyWidth - 300 + 'px' }">
      <div class="article-detail">
        <div class="title">
          {{ articleInfo.title }}
          <span v-if="articleInfo.status == 0" class="tag tag-no-audit">待审核</span>
        </div>
        <div class="user-info">
          <Avatar :userId="articleInfo.userId" :width="50" :addLink="false" />
          <div class="user-info-detail">
            <router-link :to="`/user/${articleInfo.userId}`" class="nick-name">{{
              articleInfo.nickName
            }}</router-link>
            <div class="time-info">
              <span>{{ articleInfo.postTime }}</span>
              <span class="address">&nbsp;-&nbsp;{{ articleInfo.userIpAddress }}</span>
              <span class="iconfont icon-eye-solid">
                {{ articleInfo.readCount == 0 ? '阅读' : articleInfo.readCount }}
              </span>
              <router-link
                v-if="articleInfo.userId == currentUser.userId"
                :to="`/editPost/${articleInfo.articleId}`"
                class="a-link"
              >
                <span class="iconfont icon-edit">编辑</span>
              </router-link>
            </div>
          </div>
        </div>
        <div class="detail" id="detail" v-html="articleInfo.content"></div>
      </div>
      <!-- 附件 -->
      <div class="attachment-panel" v-if="attachment" id="view-attachment">
        <div class="title">附件</div>
        <div class="attachment-info">
          <span class="iconfont icon-zip item"></span>
          <div class="file-name item">{{ attachment.fileName }}</div>
          <div class="size item">{{ proxy.Utils.sizeToStr(attachment.fileSize) }}</div>
          <div>
            需要<span class="intergal">{{ attachment.integral }}</span
            >积分
          </div>
          <div class="download-count item">已下载{{ attachment.downloadCount }}次</div>
          <div class="download-btn item">
            <el-button type="primary" size="small" @click="downloadAttachment(attachment.fileId)"
              >下载</el-button
            >
          </div>
        </div>
      </div>
      <!-- 评论 -->
      <div class="comment-panel" id="view-comment" v-if="showCommnet && articleInfo.status == 1">
        <CommentList
          v-if="articleInfo.articleId"
          :articleId="articleInfo.articleId"
          :articleUserId="articleInfo.userId"
          @updateCommentCount="updateCommentCount"
        ></CommentList>
      </div>
    </div>
    <!-- 目录 -->
    <div class="top-panel">
      <div class="top-container">
        <div class="top-title">目录</div>
        <div class="toc-list">
          <template v-if="tocArray.length == 0">
            <div class="no-toc">未解析到目录</div>
          </template>
          <template v-else>
            <div v-for="toc in tocArray">
              <span
                :class="['toc-item', toc.id == anchorId ? 'active' : '']"
                @click="gotoAnchor(toc.id)"
                :style="{ 'padding-left': toc.level * 15 + 'px' }"
                >{{ toc.title }}</span
              >
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
  <!-- 左侧快捷操作 -->
  <div class="quick-panel" :style="{ left: quickPanelLeft + 'px' }">
    <!-- 点赞 -->
    <el-badge
      :value="articleInfo.goodCount"
      type="info"
      :hidden="!articleInfo.goodCount > 0"
      @click="goToPosition('view-good')"
    >
      <div class="quick-item" @click="doLikeHandler">
        <span :class="['iconfont icon-good', haveLike ? 'have-like' : '']"></span>
      </div>
    </el-badge>
    <!-- 评论 -->
    <el-badge
      :value="articleInfo.commentCount"
      type="info"
      :hidden="!articleInfo.commentCount > 0"
      v-if="showCommnet"
    >
      <div class="quick-item" @click="goToPosition('view-comment')" v-if="showCommnet">
        <span class="iconfont icon-comment"></span>
      </div>
    </el-badge>
    <!-- 附件 -->
    <div class="quick-item" @click="goToPosition('view-attachment')">
      <span class="iconfont icon-attachment"></span>
    </div>
    <!-- 图片预览 -->
    <imageViewer ref="imageViewerRef" :imageList="previewImageList"></imageViewer>
  </div>
</template>

<script setup>
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

import { ref, watch, getCurrentInstance, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import Avatar from '@/components/Avatar.vue'
import { useAllDataStore } from '@/store'

import CommentList from './CommentList.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()
const store = useAllDataStore()

const api = {
  getArticleDetail: '/forum/getArticleDetail',
  doLike: '/forum/doLike',
  getUserDownloadInfo: '/forum/getUserDownloadInfo',
  attachmentDownload: '/api/forum/attachmentDownload',
}

const currentUser = ref({})

const articleInfo = ref({})
const attachment = ref({})

const haveLike = ref(false)

const getArticleDetail = async (articleId) => {
  let res = await proxy.Request({
    url: api.getArticleDetail,
    params: {
      articleId: articleId,
    },
  })
  if (!res) return
  articleInfo.value = res.data.forumArticle

  // console.log('in articledetail')
  // console.log(articleInfo.value.userId)

  attachment.value = res.data.attachment
  haveLike.value = res.haveLike

  store.setActivePBoardId(res.data.forumArticle.pBoardId)
  store.setActiveBoardId(res.data.forumArticle.boardId)

  //图片预览
  imagePreview()

  //代码高亮
  highlightCode()

  //生成目录
  makeToc()
}

watch(
  () => store.getLoginUserInfo,
  (newVal, oldVal) => {
    currentUser.value = newVal || {}
  },
  { immediate: true, deep: true },
)

onMounted(() => {
  getArticleDetail(route.params.articleId)
  // currentUser.value = store.getLoginUserInfo
})

//快捷栏操作

//样式自定义
const quickPanelLeft = (window.innerWidth - proxy.globalInfo.bodyWidth) / 2 - 90
//点赞
const doLikeHandler = async () => {
  // if(store.getLoginUserInfo == null){
  //   store.updateshowLogin(false)
  //   return;
  // }
  let res = await proxy.Request({
    url: api.doLike,
    params: {
      articleId: articleInfo.value.articleId,
    },
  })
  if (!res) return

  haveLike.value = !haveLike.value
  let goodCount = 1
  if (!haveLike.value) {
    goodCount = -1
  }
  articleInfo.value.goodCount = articleInfo.value.goodCount + goodCount
}
//跳转位置
const goToPosition = (id) => {
  document.querySelector('#' + id).scrollIntoView({ behavior: 'smooth' })
}

//下载附件
const downloadDo = (fileId) => {
  document.location.href = api.attachmentDownload + '?fileId=' + fileId
  attachment.value.downloadCount += 1 // 修正变量名一致性
}
const downloadAttachment = async (fileId) => {
  if (!store.getLoginUserInfo) {
    store.updateshowLogin(true)
    return
  }

  let res = await proxy.Request({
    url: api.getUserDownloadInfo,
    params: {
      fileId: fileId,
    },
  })
  if (!res) {
    return
  }
  //判断用户是否已经下载过
  if (res.data.haveDownload) {
    debugger
    downloadDo(fileId)
    return
  }

  //判断积分是否足够
  if (
    res.data.userIntegral < attachment.value.integral &&
    currentUser.value.userId != articleInfo.userId
  ) {
    console.log('积分不足')
    proxy.Message.warning('积分不足，无法下载该附件')
    return
  }

  // console.log('可以')
  proxy.Confirm(
    `你还有${res.data.userIntegral}积分，当前下载会扣除${attachment.value.integral}积分，是否继续？`,
    () => {
      downloadDo(fileId)
    },
  )
}

// 文章图片预览
const imageViewerRef = ref(null)
const previewImageList = ref([])
const imagePreview = () => {
  nextTick(() => {
    const imageNodeList = document.querySelector('#detail').querySelectorAll('img')
    const imageList = []
    imageNodeList.forEach((item, index) => {
      const src = item.getAttribute('src')
      imageList.push(src)
      item.addEventListener('click', () => {
        imageViewerRef.value.show(index)
      })
    })
    previewImageList.value = imageList
  })
}

//代码高亮
const highlightCode = () => {
  nextTick(() => {
    let blocks = document.querySelectorAll('pre code')
    blocks.forEach((item) => {
      hljs.highlightBlock(item)
    })
  })
}

//更新评论数量
const updateCommentCount = (totalCount) => {
  articleInfo.value.commentCount = totalCount
}

//获取目录
const tocArray = ref([])
const makeToc = () => {
  nextTick(() => {
    const tocTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']

    //获取所有标题
    const contentDom = document.querySelector('#detail')
    const childNodes = contentDom.childNodes

    let index = 0
    childNodes.forEach((item) => {
      let tagName = item.tagName

      if (tagName == undefined || !tocTags.includes(tagName.toUpperCase())) return true

      index++

      let id = 'toc' + index
      item.setAttribute('id', id)
      tocArray.value.push({
        id: id,
        title: item.innerText,
        level: Number.parseInt(tagName.substring(1)),
        offsetTop: item.offsetTop,
      })
    })
  })
}

const anchorId = ref(null)
const gotoAnchor = (domId) => {
  const dom = document.querySelector('#' + domId)
  dom.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const listenerScroll = () => {
  let currentScrollTop = getScrollTop()
  tocArray.value.some((item, index) => {
    if (
      (index < tocArray.value.length - 1 &&
        currentScrollTop >= tocArray.value[index].offsetTop &&
        currentScrollTop < tocArray.value[index + 1].offsetTop) ||
      (index == tocArray.value.length - 1 && currentScrollTop >= tocArray.value[index].offsetTop)
    ) {
      anchorId.value = item.id
      return true
    }
  })
}
//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
  return scrollTop
}

onMounted(() => {
  window.addEventListener('scroll', listenerScroll, false)
})

onUnmounted(() => {
  window.removeEventListener('scroll', listenerScroll, false)
})

const showCommnet = ref(true)

watch(() => store.sysSetting, (newVal, oldVal) => {
  console.log("我是")
  console.log(newVal)
  if (newVal) showCommnet.value = newVal.commentOpen
  console.log(showCommnet)
}, { immediate: true, deep: true });

</script>

<style lang="scss">
.article-detail-body {
  position: relative;
  .board-info {
    line-height: 40px;
    .iconfont {
      margin: 0px 10px;
    }
  }
  .detail-container {
    .article-detail {
      background: #fff;
      padding: 15px;
      .title {
        font-weight: bold;
      }
      .user-info {
        margin-top: 15px;
        display: flex;
        padding-bottom: 10px;
        border-bottom: 1px solid #ddd;
        .user-info-detail {
          margin-left: 10px;
        }
        .nick-name {
          text-decoration: none;
          color: #4e5969;
          font-size: 15px;
        }
        .nick-name:hover {
          color: var(--link);
        }
        .time-info {
          margin-top: 5px;
          font-size: 13px;
          color: var(--text2);
          .iconfont {
            margin-left: 10px;
          }
          .iconfony::before {
            padding-right: 3px;
          }
        }
      }
      .detail {
        letter-spacing: 2px;
        line-height: 22px;
        img {
          max-width: 80%;
          cursor: pointer;
        }
        a {
          text-decoration: none;
          color: var(--link);
        }
      }
    }
    .attachment-panel {
      background: #ddd;
      margin-top: 20px;
      padding: 20px;
      .title {
        font-size: 18px;
      }
      .attachment-info {
        display: flex;
        align-items: center;
        color: #9f9f9f;
        margin-top: 10px;
        .item {
          margin-right: 10px;
        }
        .iconfont {
          font-size: 20px;
          color: #6ca1f7;
        }
        .file-name {
          color: #6ca1f7;
        }
        .intergal {
          color: red;
          padding: 0px 5px;
        }
      }
    }
    .comment-panel {
      margin-top: 20px;
      background: #fff;
      padding: 20px;
    }
  }
}
.quick-panel {
  position: fixed;
  width: 50px;
  top: 150px;
  text-align: center;
  .quick-item {
    display: flex;
    width: 50px;
    height: 50px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: #fff;
    margin-bottom: 30px;
    .iconfont {
      font-size: 22px;
      color: var(--text2);
    }
    .have-like {
      color: red;
    }
  }
}

.top-panel {
  position: absolute;
  top: 40px;
  right: 0px;
  width: 285px;
  .top-container {
    width: 285px;
    position: fixed;
    // height: 500px;
    background: white;
    .toc-title {
      border-bottom: 1px solid #ddd;
      padding: 10px;
    }
    .toc-list {
      max-height: calc(100vh - 200px);
      overflow: auto;
      padding: 5px;
      .no-toc {
        text-align: center;
        color: #5f5d5d;
        line-height: 40px;
        font-size: 13px;
      }
      .toc-item {
        cursor: pointer;
        display: block;
        line-height: 35px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        color: #555666;
        border-radius: 3px;
        font-size: 14px;
        border-left: 2px solid #fff;
      }
      .toc-item:hover {
        background: #ece9e9;
      }
      .active {
        background: #ece9e9;
        border-left: 2px solid #6ca1f7;
        border-radius: 0px 3px 3px 0px;
      }
    }
  }
}
</style>
