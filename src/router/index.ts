import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../presentation/views/HomeView.vue';
import ParcoursListView from '@/presentation/views/ParcoursListView.vue'
import UEListView from "@/presentation/views/UEListView.vue"; 


const router = createRouter({ 
  history: createWebHistory(import.meta.env.BASE_URL), 
  routes: [ 
    { 
      path: '/', 
      name: 'home', 
      component: HomeView 
    }, 
    { 
      path: '/parcours', 
      name: 'parcours', 
      component: ParcoursListView 
    },
    {
        path: '/ue', 
        name: 'ue',
        component: UEListView
    },
  ] 
});

export default router;
