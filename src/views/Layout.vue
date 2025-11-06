<template>
  <div class="header" v-if="showHeader">
    <div class="header-content" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
      <router-link to="/" class="logo">
        <span v-for="item in logoInfo" :style="{ color: item.color }">
          {{ item.letter }}
        </span>
      </router-link>

      <!-- 板块信息 -->
      <div class="menu-panel">
        <span :class="['menu-item', activePBoardId == 0 ? 'active' : '']" @click="backToHome"
          >首页</span
        >
        <template v-for="board in boardList">
          <el-popover
            placement="bottom-start"
            :width="300"
            trigger="hover"
            v-if="board.children.length > 0"
          >
            <template #reference>
              <span
                :class="['menu-item', board.boardId == activePBoardId ? 'active' : '']"
                @click="boardClickHandler(board)"
                >{{ board.boardName }}</span
              >
            </template>
            <!-- 二级板块 -->
            <div class="sub-board-list">
              <span
                :class="['sub-board', subBoard.boardId == activeBoardId ? 'active' : '']"
                v-for="subBoard in board.children"
                @click="subBoardClickHandler(subBoard)"
              >
                {{ subBoard.boardName }}</span
              >
            </div>
          </el-popover>
          <span
            :class="['menu-item', board.boardId == activePBoardId ? 'active' : '']"
            v-else
            @click="boardClickHandler(board)"
            >{{ board.boardName }}</span
          >
        </template>
      </div>

      <!-- 登录注册用户信息 -->
      <div class="user-info-panel">
        <el-button type="primary" class="op-btn" @click="newPost">
          发帖<span class="iconfont icon-add"></span>
        </el-button>
        <el-button type="primary" class="op-btn" @click="goSearch">
          搜索<span class="iconfont icon-search"></span>
        </el-button>
        <!-- 用户登录后 -->
        <template v-if="userInfo.userId">
          <div class="message-info">
            <el-dropdown>
              <el-badge
                :value="messageCntInfo.total"
                class="item"
                :hidden="messageCntInfo.total == null || messageCntInfo.total == 0"
              >
                <div class="iconfont icon-message"></div>
              </el-badge>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="gotoMessage('reply')" class="message-item">
                    <span class="text">回复我的</span>
                    <span class="count-tag" v-if="messageCntInfo.reply != 0">{{
                      messageCntInfo.reply > 99 ? '99+' : messageCntInfo.reply
                    }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="gotoMessage('likePost')" class="message-item">
                    <span class="text">赞了我的文章</span>
                    <span class="count-tag" v-if="messageCntInfo.likePost != 0">{{
                      messageCntInfo.likePost > 99 ? '99+' : messageCntInfo.likePost
                    }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="gotoMessage('downloadAttachment')" class="message-item">
                    <span class="text">下载了我的附件</span>
                    <span class="count-tag" v-if="messageCntInfo.downloadAttachment != 0">{{
                      messageCntInfo.downloadAttachment > 99
                        ? '99+'
                        : messageCntInfo.downloadAttachment
                    }}</span>
                  </el-dropdown-item>
                  <el-dropdown-item @click="gotoMessage('likeComment')" class="message-item">
                    <span class="text">赞了我的评论</span>
                    <span class="count-tag" v-if="messageCntInfo.likeComment != 0">{{
                      messageCntInfo.likeComment > 99 ? '99+' : messageCntInfo.likeComment
                    }}</span>
                  </el-dropdown-item>

                  <el-dropdown-item @click="gotoMessage('sys')" class="message-item">
                    <span class="text">系统消息</span>
                    <span class="count-tag" v-if="messageCntInfo.sys != 0">{{
                      messageCntInfo.sys > 99 ? '99+' : messageCntInfo.sys
                    }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="user-info">
            <el-dropdown>
              <avatar :userId="userInfo.userId" :width="50" :addLink="false"></avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="gotoUcenter(userInfo.userId)"
                    >我的主页</el-dropdown-item
                  >
                  <el-dropdown-item @click="logout">退出</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
        <div v-else>
          <el-button-group :style="{ 'margin-left': '5px' }">
            <el-button type="primary" plain @click="loginAndRegister(1)">登录</el-button>
            <el-button type="primary" plain @click="loginAndRegister(0)">注册</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
  </div>

  <div class="body-content">
    <router-view />
  </div>

  <div class="footer" v-if="showFooter">
    <div class="footer-content" :style="{ width: proxy.globalInfo.bodyWidth + 'px' }">
      <el-row>
        <el-col :span="6" class="item">
          <div class="logo">
            <div class="logo-letter">
              <span v-for="item in logoInfo" :style="{ color: item.color }">
                {{ item.letter }}
              </span>
            </div>
            <div class="info">一个多功能编程社区</div>
          </div>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">网站相关</div>
          <div>
            <a href="#" class="a-link" style="display: block">网站制度</a>
            <a href="#" class="a-link" style="display: block">发帖须知</a>
            <a href="#" class="a-link" style="display: block">常见问题</a>
          </div>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">友情链接</div>
          <a href="https://github.com/NJYgocrazy" class="a-link">wait for you</a>
        </el-col>
        <el-col :span="6" class="item">
          <div class="title">关注我</div>
          <a href="https://github.com/NJYgocrazy" class="a-link">follow NJY</a>
        </el-col>
      </el-row>
    </div>
  </div>
  <!-- 登录注册 -->
  <LoginAndRegister ref="LoginAndRegisterRef" />
  <!-- 回到顶部 -->
   <el-backtop :right="100" :bottom="100"></el-backtop>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
import LoginAndRegister from './LoginAndRegister.vue'
import { log } from 'hexo/dist/plugins/helper/debug'
import Avatar from '@/components/Avatar.vue'
import { useAllDataStore } from '@/store/index'
import { url } from 'hexo/dist/hexo/default_config'
const router = useRouter()
const route = useRoute()

const state = useAllDataStore()

const api = {
  getUserInfo: '/getUserInfo',
  loadBoard: '/board/loadBoard',
  loadMessageCnt: '/ucenter/getMessageCount',
  logout: '/logout',
  loadSysSetting: '/getSysSetting'
}

const logoInfo = ref([
  {
    letter: 'E',
    color: '#3285FF',
  },
  {
    letter: 'a',
    color: '#FB3624',
  },
  {
    letter: 's',
    color: '#FFBA02',
  },
  {
    letter: 'y',
    color: '#3285FF',
  },
  {
    letter: 'b',
    color: '#25B24E',
  },
  {
    letter: 'b',
    color: '#FD3224',
  },
  {
    letter: 's',
    color: '#FFBA02',
  },
])

const showHeader = ref(true)

//获取滚动条的高度
const getScrollTop = () => {
  let scrollTop =
    document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop
  return scrollTop
}

const initScroll = () => {
  let initScrollTop = getScrollTop()
  let scrollType = 0
  window.addEventListener('scroll', () => {
    let nowscrollTop = getScrollTop()
    if (nowscrollTop > initScrollTop) {
      scrollType = 1
    } else {
      scrollType = 0
    }
    initScrollTop = nowscrollTop
    if (scrollType == 1 && nowscrollTop > 100) {
      showHeader.value = false
      // console.log("我隐藏了")
    } else {
      showHeader.value = true
      // console.log("我显示了")
    }
  })
}

const LoginAndRegisterRef = ref()
const loginAndRegister = (type) => {
  LoginAndRegisterRef.value.showPanel(type)
  LoginAndRegisterRef.value.type = type
}

const getUserInfo = async () => {
  let res = await proxy.Request({
    url: api.getUserInfo,
  })

  // 无论成功与否都更新状态
  if (res && res.code == 200) {
    state.updateLoginUserInfo(res.data)
  } else {
    // 明确设置为未登录状态
    state.updateLoginUserInfo(null)
  }

  // state.updateLoginUserInfo(res)
}

//获取板块信息
const boardList = ref([])
const loadBoard = async () => {
  let res = await proxy.Request({
    url: api.loadBoard,
  })
  if (!res) return
  boardList.value = res.data
  state.saveBoardList(res.data)
}

loadBoard()

// console.log(boardList)

onMounted(() => {
  initScroll()
  getUserInfo()
  loadSysSetting()
})

const userInfo = ref({})
//监听登录用户信息
watch(
  () => state.loginUserInfo, // 直接监听 store state
  (newVal, oldVal) => {
    if (newVal != undefined && newVal != null) {
      userInfo.value = newVal
    } else {
      userInfo.value = {}
      // console.log("我退出登录了")
      // state.updateLoginUserInfo(null)
    }
  },
  { immediate: true, deep: true },
)

//监听是否展示登录框
watch(
  () => state.showLogin,
  (newVal, oldVal) => {
    if (newVal) {
      loginAndRegister(1)
    }
  },
)

//板块点击
const boardClickHandler = (board) => {
  router.push(`/forum/${board.boardId}`)
}

const subBoardClickHandler = (subBoard) => {
  router.push(`/forum/${subBoard.pBoardId}/${subBoard.boardId}`)
}

const backToHome = () => {
  router.push(`/`)
}

//当前选中的板块
const activePBoardId = ref(0)

watch(
  () => state.activePBoardId,
  (newVal, oldVal) => {
    activePBoardId.value = newVal
  },
  { immediate: true, deep: true },
)

const activeBoardId = ref(0)
watch(
  () => state.activeBoardId,
  (newVal, oldVal) => {
    activeBoardId.value = newVal
  },
  { immediate: true, deep: true },
)

const newPost = () => {
  if (!state.loginUserInfo) loginAndRegister(1)
  else router.push('/newPost')
}

const gotoUcenter = (id) => {
  router.push(`/user/${id}`)
}
//消息相关
const gotoMessage = (type) => {
  router.push(`/user/message/${type}`)
}

const messageCntInfo = ref({})
const loadMessageCnt = async () => {
  let res = await proxy.Request({
    url: api.loadMessageCnt,
  })
  if (!res) return
  // console.log("获取")

  messageCntInfo.value = res.data
  state.updateMessageCntInfo(res.data)
}

watch(
  () => state.loginUserInfo,
  (newVal, oldVal) => {
    if (newVal) loadMessageCnt()
  },
  { immediate: true, deep: true },
)
//退出
const logout = () => {
  proxy.Confirm('确定要退出吗？', async () => {
    let res = await proxy.Request({
      url: api.logout,
    })
    if (!res) return
    state.updateLoginUserInfo(null)
  })
}

watch(
  () => state.messageCntInfo,
  (newVal, oldVal) => {
    messageCntInfo.value = newVal || {}
  },
  { immediate: true, deep: true },
)

//获取系统配置

const loadSysSetting = async () => {
  let res = await proxy.Request({
    url: api.loadSysSetting,
  })
  if (!res) return;
  state.saveSysSetting(res.data)
}

const goSearch = () => {
  router.push('/search')
}

const showFooter = ref(true)

watch(() => route.path, (newVal, oldVal) => {
  if (newVal.indexOf("newPost") != -1 || newVal.indexOf("editPost") != -1) showFooter.value = false;
  else showFooter.value = true;
}, { immediate: true, deep: true });

</script>

<style lang="scss" scoped>
.header {
  top: 0px;
  width: 100%;
  position: fixed;
  box-shadow: 0 2px 6px 0 #ddd;
  height: 60px;
  z-index: 1000;
  background: #fff;
  .header-content {
    margin: 0px auto;
    align-items: center;
    height: 60px;
    display: flex;
    align-items: center;
    .logo {
      display: block;
      margin-right: 5px;
      text-decoration: none;
      font-size: 35px;
      font-weight: bold;
    }
    .menu-panel {
      flex: 1;
    }
    .user-info-panel {
      width: 300px;
      display: flex;
      align-items: center;
      .op-btn {
        .iconfont {
          margin-left: 5px;
        }
      }
      .op-btn:last-child {
        margin-left: 5px;
      }
      .message-info {
        margin-left: 5px;
        margin-right: 25px;
        cursor: pointer;
        .icon-message {
          font-size: 25px;
          color: rgb(147, 147, 147);
          margin-left: 20px;
          margin-right: 5px;
        }
      }
    }
    .menu-panel {
      display: flex;
      .menu-item {
        margin-left: 20px;
        cursor: pointer;
      }
      .active {
        color: var(--link);
      }
    }
  }
}

.sub-board-list {
  display: flex;
  flex-wrap: wrap;
  .sub-board {
    padding: 0px 10px;
    border-radius: 20px;
    margin-right: 10px;
    background: #f0eeee;
    border: 1px solid #ddd;
    color: rgb(88, 87, 87);
    margin-top: 10px;
    cursor: pointer;
  }
  .sub-board:hover {
    color: var(--link);
  }
  .active {
    background: var(--link);
    color: #fff;
  }
  .active:hover {
    color: #fff;
  }
}

.body-content {
  margin-top: 60px;
  position: relative;
  min-height: calc(100vh - 210px);
}

.message-item {
  display: flex;
  justify-content: space-around;
  .text {
    flex: 1;
  }
  .count-tag {
    width: 20px;
    display: block;
    background-color: #f56c6c;
    border-radius: 50%;
    font-size: 13px;
    text-align: center;
    color: #fff;
    margin-left: 10px;
  }
}

.footer {
  background: #e9e9e9;
  height: 140px;
  margin-top: 10px;
  .footer-content {
    margin: 0px auto;
    padding-top: 10px;
    .item{
      text-align: left;
      .title{
        font-size: 18px;
        margin-bottom: 10px;
      }
    
    }
    .logo{
      .logo-letter{
        font-size:30px;
      }
      .info{
        margin-top: 10px;
        color: rgb(93,91,91);
        font-weight: bold;
        font-size: 20px;
      }
    }
  }
}
</style>
