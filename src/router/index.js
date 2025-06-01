import {createRouter, createWebHistory} from "vue-router";
import HomeView from "@/views/HomeView.vue";
import EmbedView from "@/views/EmbedView.vue";
import ExtractView from "@/views/ExtractView.vue";


const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL), // SSR App
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/embed',
            name: 'embed',
            component: EmbedView
        },{
            path: '/extract',
            name: 'extract',
            component: ExtractView
        }
    ]
})

export default router;