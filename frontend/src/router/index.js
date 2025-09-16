import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '../views/Register.vue'
import Login from '../views/Login.vue'
import Appointment from '../views/Appointment.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import axios from 'axios';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/register',
      name: '/register',
      component: Register
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: Appointment
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminDashboard,
      meta: { requiresAuth: true, requiresAdminn: true }
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth && !token) {
    next('/login');
  } else if (requiresAuth && requiresAdmin && token) {
    try {
      const response = await axios.get('http://localhost:3000/api/me', {
        headers: {
          'x-auth-token': token
        }
      });
      const userRole = response.data.user.role;

      if (userRole === 'admin') {
        next();
      } else {
        next('/');
      }
    } catch (error) {
      console.error('Erro na guarda de navegação:', error);
      next('/login');
    }
  } else {
    next();
  }
});

export default router
