import { createWebHashHistory, createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      component: () => import('./views/login'),
    },
    {
      path: '/',
      component: () => import('./views/home')
    }
  ],
})
