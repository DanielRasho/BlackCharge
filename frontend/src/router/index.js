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
            path: BASE + '/sphere',
            name: 'Sphere',
            component: () => import('../views/Sphere.vue')
        }
    ]
})

export default router
