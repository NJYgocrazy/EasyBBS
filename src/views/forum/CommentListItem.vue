<template>
  <div class="comment-item">
    <Avatar :userId="commentData.userId" :width="50"></Avatar>
    <div class="comment-info">
      <div class="nick-name">
        <span class="name" @click="gotoUcenter(sub.userId)">{{ commentData.nickName }}</span>
        <span v-if="commentData.userId == articleUserId" class="author">作者</span>
      </div>
      <div class="comment-content">
        <div>
          <span class="tag-topping" v-if="commentData.topType == 1">置顶</span>
          <span class="no-audit" v-if="commentData.status == 0">待审核</span>
          <span v-html="commentData.content"></span>
        </div>
        <CommentImage
        :style="{'margin-top': '10px'}"
          v-if="commentData.imgPath"
          :src="proxy.globalInfo.imageUrl + commentData.imgPath.replace('.', '_.')"
          :imgList="[proxy.globalInfo.imageUrl + commentData.imgPath]"
        ></CommentImage>
      </div>
      <div class="op-panel">
        <div class="time">
          <span>{{ commentData.postTime }}</span>
          <span class="address">&nbsp;.&nbsp;{{ commentData.userIpAddress }}</span>
        </div>
        <div
          :class="['iconfont icon-good', commentData.likeType == 1 ? 'active' : '']"
          @click="doLike(commentData)"
        >
          {{ commentData.goodCount > 0 ? commentData.goodCount : '点赞' }}
        </div>
        <div class="iconfont icon-comment" @click="showReplyPanel(commentData, 0)">回复</div>
        <el-dropdown v-if="articleUserId == currentUserId">
          <div class="iconfont icon-more"></div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="opTop(commentData)">
                {{ commentData.topType == 0 ? '设为置顶' : '取消置顶' }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="comment-sub-list" v-if="commentData.children">
        <div class="comment-sub-item" v-for="sub in commentData.children">
          <Avatar :userId="sub.userId" :width="30"></Avatar>
          <div class="comment-sub-info">
            <div class="nick-name">
              <span class="name" @click="gotoUcenter(sub.userId)">{{ sub.nickName }}</span>
              <span v-if="sub.userId == articleUserId" class="author">作者</span>
              <span class="reply-name">回复</span>
              <span class="a-link" @click="gotoUcenter(sub.replyUserId)"
                >@{{ sub.replyNickName }}</span
              >
              <span>：</span>
              <span class="sub-content" v-html="sub.content"></span>
            </div>
            <div class="op-panel">
              <div class="time">
                <span>{{ sub.postTime }}</span>
                <span class="address">&nbsp;.&nbsp;{{ sub.userIpAddress }}</span>
              </div>
              <div
                :class="['iconfont icon-good', sub.likeType == 1 ? 'active' : '']"
                @click="doLike(sub)"
              >
                {{ sub.goodCount > 0 ? sub.goodCount : '点赞' }}
              </div>
              <div class="iconfont icon-comment" @click="showReplyPanel(sub, 1)">回复</div>
            </div>
          </div>
        </div>
      </div>
      <div class="reply-info" v-if="commentData.showReply">
        <PostComment
          :placeholderInfo="placeholderInfo"
          :articleId="articleId"
          :avatarwidth="30"
          :userId="currentUserId"
          :showInsertImg="false"
          :pCommentId="pCommentId"
          :replyUserId="replyUserId"
          @postCommentFinish="postCommentFinish"
        >
        </PostComment>
      </div>
    </div>
  </div>
</template>

<script setup>
import CommentImage from './CommentImage.vue'
import Avatar from '@/components/Avatar.vue'
import PostComment from './PostComment.vue'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { archive } from 'hexo/dist/plugins/helper/is'
const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const api = {
  doLike: '/comment/doLike',
  changeTopType: '/comment/changeTopType',
}

const props = defineProps({
  articleId: {
    type: String,
  },
  commentData: {
    type: Object,
  },
  articleUserId: {
    type: String,
  },
  currentUserId: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['hiddenAllReply','reloadData'])
//显示评论框

const pCommentId = ref(0)

const replyUserId = ref(null)

const placeholderInfo = ref(null)

const showReplyPanel = (curData, type) => {
  const haveShow = props.commentData.showReply == undefined ? false : props.commentData.showReply

  emit('hiddenAllReply')

  props.commentData.showReply = !haveShow

  pCommentId.value = props.commentData.commentId

  replyUserId.value = curData.userId

  placeholderInfo.value = '回复@' + curData.nickName
}

const postCommentFinish = (resdata) => {
  //   const children = props.commentData.children ? props.commentData.children : []
  //     children.unshift(resdata)
  props.commentData.children = resdata
  placeholderInfo.value = undefined
}

const gotoUcenter = (userId) => {
  router.push(`/user/${userId}`)
}

const doLike = async (data) => {
  let res = await proxy.Request({
    url: api.doLike,
    params: {
      commentId: data.commentId,
    },
    showLoading: false,
  })

  if (!res) return

  data.goodCount = res.data.goodCount
  data.likeType = res.data.likeType
}

const opTop = async (data) => {
  let res = await proxy.Request({
    url: api.changeTopType,
    params: {
      commentId: data.commentId,
      topType: data.topType == 1 ? 0 : 1,
    },
    showLoading: false,
  })
  if (!res) return 
  emit("reloadData")
}



</script>

<style lang="scss">
.comment-item {
  display: flex;
  padding-top: 15px;
  .comment-info {
    flex: 1;
    margin-left: 10px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 15px;
    .nick-name {
      .name {
        font-size: 14px;
        color: var(--text2);
        margin-right: 10px;
        cursor: pointer;
      }
      .author {
        background: #ddd;
        color: var(--pink);
        font-size: 12px;
        border-radius: 2px;
        padding: 0px 3px;
      }
    }
    .comment-content {
      margin-top: 5px;
      font-size: 15px;
      line-height: 22px;
      .tag-topping{
        margin-right: 5px;
        color: var(--pink);
        border: 1px solid var(--pink);
        font-size: 12px;
        border-radius: 3px;
        padding: 0px 5px;
      }
      .no-audit{
        margin-right: 5px;
        font-size: 12px;
        border-radius: 3px;
        padding: 0px 5px;
        color: var(--text2);
        border: 1px solid var(--text2);
      }
    }
    .op-panel {
      display: flex;
      align-items: center;
      margin-top: 5px;
      font-size: 13px;
      color: var(--text2);
      .time {
        margin-right: 20px;
      }
      .iconfont {
        margin-right: 15px;
        font-size: 14px;
        color: var(--icon);
        cursor: pointer;
      }
      .iconfont::before {
        margin-right: 3px;
      }
      .active {
        color: var(--link);
      }
    }
    .comment-sub-list {
      margin-top: 10px;
      .comment-sub-item {
        display: flex;
        margin: 5px 0px;
        font-size: 14px;
        .comment-sub-info {
          margin-left: 5px;
          .nick-name {
            .reply-name {
              margin: 0px 5px;
            }
            .sub-content {
              font-size: 15px;
            }
          }
        }
      }
    }
    .reply-info {
      margin-top: 5px;
    }
  }
}
</style>
