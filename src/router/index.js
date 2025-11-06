import { createRouter, createWebHistory } from 'vue-router'
import { useAllDataStore } from '@/store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: '/',
          name: '所有文章',
          component: () => import('@/views/forum/ArticleList.vue'),
        },
        {
          path: '/forum/:pBoardId',
          name: '一级板块',
          component: () => import('@/views/forum/ArticleList.vue'),
        },
        {
          path: '/forum/:pBoardId/:boardId/',
          name: '二级板块',
          component: () => import('@/views/forum/ArticleList.vue'),
        },
        {
          path: '/post/:articleId/',
          name: '文章详情',
          component: () => import('@/views/forum/ArticleDetail.vue'),
        },
        {
          path: '/newPost',
          name: '发布文章',
          component: () => import('@/views/forum/EditPost.vue'),
        },
        {
          path: '/editPost/:articleId',
          name: '编辑文章',
          component: () => import('@/views/forum/EditPost.vue'),
        },
        {
          path: '/user/:userId',
          name: '用户主页',
          component: ()=> import('@/views/ucenter/Ucenter.vue')
        },
        {
          path: 'user/message/:type',
          name: '用户消息',
          component: ()=> import('@/views/ucenter/MessageList.vue')
        }, {
          path: '/search',
          name: "搜索",
          component: ()=> import('@/views/Search.vue')
        }
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "错误页",
      component: () => import('@/views/Error.vue'),
    }
  ],
})

router.beforeEach((to, from, next) => {
  if (to.path.indexOf("/user") != -1) {
    const store = useAllDataStore()
    store.setActivePBoardId(-1)
  }
  next()
})

export default router
