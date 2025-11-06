import { update } from 'js-md5'
import { defineStore } from 'pinia'

export const useAllDataStore = defineStore('allData', {
  // 定义 state
  state: () => ({
    //用户信息
    loginUserInfo: null,
    //是否展示登录框弹窗
    showLogin: false,
    //板块信息
    boardList: [],
    //当前一级板块
    activePBoardId: 0,
    //当前二级板块
    activeBoardId: 0,
    //消息数量
    messageCntInfo: {},
    //系统设置
    sysSetting: {},
  }),

  // 定义 getters
  getters: {
    getLoginUserInfo: (state) => state.loginUserInfo,
    getBoardList: (state) => state.boardList,
    getSubBoardList: (state) => (boardId) => {
      let board = state.boardList.find((item) => {
        return item.boardId == boardId
      })
      return board ? board.children : []
    },
    getActivePBoardId: (state) => state.activePBoardId,
    getActiveBopardId: (state) => state.activeBoardId,
    getMessageCntInfo: (state) => state.messageCntInfo, 
  },

  // 定义 actions
  actions: {
    updateLoginUserInfo(value) {
      this.loginUserInfo = value
    },
    updateshowLogin(value) {
      this.showLogin = value
    },
    saveBoardList(value) {
      this.boardList = value
    },
    setActivePBoardId(value) {
      this.activePBoardId = value
    },
    setActiveBoardId(value) {
      this.activeBoardId = value
    },
    updateMessageCntInfo(value) {
      this.messageCntInfo = value
    },
    readMessage(value) {
      this.messageCntInfo.total -= this.messageCntInfo[value]
      this.messageCntInfo[value] = 0  
    },
    saveSysSetting(value) {
      this.sysSetting = value
    },
  },
})

