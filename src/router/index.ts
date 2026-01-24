import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../presentation/views/HomeView.vue';
import ParcoursListView from '@/presentation/views/ParcoursListView.vue'
import UEListView from "@/presentation/views/UEListView.vue";
import EtudiantListView from "@/presentation/views/EtudiantListView.vue"; 


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
      {
          path: '/etudiant',
          name: 'etudiant',
          component: EtudiantListView
      },
      {
          path: "/UE/:id/gestion",
          name: "ue-gestion",
          component: () => import("@/presentation/views/UEGestionView.vue"),
      }

  ] 
});

export default router;
