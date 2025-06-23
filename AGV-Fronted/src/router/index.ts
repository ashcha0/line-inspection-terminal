import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'InitView',
      component: () => import('../views/InitView.vue'),
    },
    {
      path: '/tasks',
      name: 'TaskView',
      component: () => import('../views/TaskView.vue'),
    },
    {
      path: '/task/detail/:id',
      name: 'TaskDetailView',
      component: () => import('../views/TaskDetailView.vue'),
      props: true,
    },
    {
      path: '/task/execute/:id',
      name: 'TaskExecuteView',
      component: () => import('../views/TaskExecuteView.vue'),
      props: true,
    },
  ]
})

export default router
