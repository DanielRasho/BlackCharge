import { createRouter, createWebHistory } from 'vue-router'
import Empty from '../views/Empty.vue'

const BASE = '/PhetALaTortrix'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Empty
        },
        {
            path: '/empty',
            name: 'Empty',
            component: Empty
        },
        {
            path: BASE + '/cone',
            name: 'Cone',
            component: () => import('../views/Cone.vue')
        },
        {
            path: BASE + '/trunk',
            name: 'ConeTrunk',
            component: () => import('../views/ConeTrunk.vue')
        },
        {
            path: BASE + '/hemispher',
            name: 'Hemisphere',
            component: () => import('../views/Hemisphere.vue')
        }
    ]
})

export default router
