import { storeToRefs } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: {
      title: 'تسجيل الدخول',
    },
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardReports.vue'),
    meta: {
      title: 'لوحة التحكم والتقارير الذكية',
    },
  },

  {
    path: '/scan-attendance',
    name: 'ScanAttendance',
    component: () => import('@/views/AttendanceScanner.vue'),
    meta: {
      title: 'تسجيل الحضور',
    },
  },
  {
    path: '/admins',
    name: 'Admins',
    component: () => import('@/views/AdminsManagement.vue'),
    meta: {
      title: 'المسؤولين',
    },
  },
  {
    path: '/students',
    name: 'Students',
    component: () => import('@/views/StudentsManagement.vue'),
    meta: {
      title: 'الطلاب',
    },
  },
  {
    path: '/sessions',
    name: 'Sessions',
    component: () => import('@/views/SessionsManagement.vue'),
    meta: {
      title: 'المحاضرات',
    },
  },
  {
    path: '/grades',
    name: 'Grades',
    component: () => import('@/views/GradesManagement.vue'),
    meta: {
      title: 'الصفوف الدراسية',
    },
  },
  {
    path: '/groups',
    name: 'Groups',
    component: () => import('@/views/GroupsManagement.vue'),
    meta: {
      title: 'المجموعات',
    },
  },
  {
    path: '/payments',
    name: 'Payments',
    component: () => import('@/views/PaymentsManagement.vue'),
    meta: {
      title: 'الماليات',
    },
  },
  {
    path: '/books',
    name: 'Books',
    component: () => import('@/views/BooksManagement.vue'),
    meta: {
      title: 'المذكرات',
    },
  },
  {
    path: '/exams',
    name: 'Exams',
    component: () => import('@/views/ExamsManagement.vue'),
    meta: {
      title: 'الامتحانات',
    },
  },
  {
    path: '/reports/attendance-report',
    name: 'AttendanceReport',
    component: () => import('@/views/reports/AttendanceReport.vue'),
    meta: {
      title: 'التقارير - تقرير الحضور',
    },
  },
    {
    path: '/reports/payment-report',
    name: 'PaymentReport',
    component: () => import('@/views/reports/PaymentReport.vue'),
    meta: {
      title: 'التقارير - تقرير المدفوعات',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title
  const logger = $cookie.get('logger')
  const { token } = storeToRefs(useAuthStore())
  if (!logger) {
    if (to.name != 'Login') {
      return next({ name: 'Login' })
    }
  } else {
    if (!token.value) {
      token.value = logger
      useAuthStore().decodeToken(token.value)
    }
    if (to.name == 'Login') {
      return next({ name: 'Dashboard' })
    }
  }
  return next()
})

export default router
