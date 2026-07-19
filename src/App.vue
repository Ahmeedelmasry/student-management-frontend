<template>
  <v-app>
    <v-snackbar
      v-model="snackbar"
      vertical
      :color="callColor == 1 ? 'green' : 'red'"
      location="right bottom"
      :timeout="5000"
      style="direction: rtl"
    >
      <div class="pb-2" style="font-size: 20px; font-weight: 500">
        {{ callColor == 1 ? 'عملية ناجحة' : 'حدث خطأ ما' }}
      </div>

      <p style="font-size: 17px" class="mt-4">{{ callMsg }}</p>

      <template v-slot:actions>
        <v-btn
          :color="callColor == 1 ? 'green' : 'red'"
          variant="elevated"
          @click="snackbar = false"
        >
          اغلاق
        </v-btn>
      </template>
    </v-snackbar>

    <v-app-bar color="primary" elevation="2" v-if="$route.name != 'Login'">
      <v-app-bar-title class="font-weight-bold text-right" style="direction: rtl">
        لوحة تحكم المعلم الذكية 🎓
      </v-app-bar-title>
    </v-app-bar>

    <v-navigation-drawer
      location="right"
      permanent
      elevation="1"
      v-if="$route.name != 'Login'"
      width="300"
    >
      <v-list density="compact" nav class="text-right" style="direction: rtl">
        <v-list-item
          prepend-icon="mdi-barcode-scan"
          title="الصفحة الرئيسية"
          to="/"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account"
          title="تسجيل الحضور"
          :to="{ name: 'ScanAttendance' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account-multiple-plus"
          title="إدارة الطلاب"
          to="/students"
          :to="{ name: 'Students' }"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-account"
          title="المسؤولين"
          :to="{ name: 'Admins' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cash-register"
          title="الصفوف الدراسية"
          :to="{ name: 'Grades' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cash-register"
          title="المجموعات الدراسية"
          :to="{ name: 'Groups' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cash-register"
          title="ادارة المحاضرات"
          :to="{ name: 'Sessions' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-cash-register"
          title="ادارة الماليات"
          :to="{ name: 'Payments' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-book"
          title="ادارة المذكرات"
          :to="{ name: 'Books' }"
          color="primary"
        ></v-list-item>
        <v-list-item
          prepend-icon="mdi-book"
          title="ادارة الامتحانات"
          :to="{ name: 'Exams' }"
          color="primary"
        ></v-list-item>

        <v-list-group value="reports">
          <template #activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-account-group" title="التقارير" />
          </template>
          <v-list-item title="تقرير الحضور" :to="{ name: 'AttendanceReport' }" color="primary">
            <template #prepend>
              <v-icon size="8">mdi-circle</v-icon>
            </template>
          </v-list-item>
          <v-list-item title="تقرير المدفوعات" :to="{ name: 'PaymentReport' }" color="primary">
            <template #prepend>
              <v-icon size="8">mdi-circle</v-icon>
            </template>
          </v-list-item>
          <v-list-item title="تقرير الامتحانات" :to="{ name: 'ExamReport' }" color="primary">
            <template #prepend>
              <v-icon size="8">mdi-circle</v-icon>
            </template>
          </v-list-item>
        </v-list-group>

        <v-list-item
          prepend-icon="mdi-logout"
          title="تسجيل خروج"
          class="text-red"
          @click="logout"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <DeleteWarning />

    <v-main class="bg-grey-lighten-4">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth/auth'
import { useMainStore } from '@/stores/index.js'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DeleteWarning from '@/components/Delete/index.vue'

// Init Stores
const authModule = useAuthStore()
const mainModule = useMainStore()

// Init Router
const router = useRouter()

// Data
const { loggerData, token } = storeToRefs(authModule)
const { callMsg, callSuccess, callColor } = storeToRefs(mainModule)
const snackbar = ref(false)

// Watchers
watch(
  () => callSuccess.value,
  (newVal) => {
    if (newVal) {
      if (snackbar.value) {
        snackbar.value = false
      }
      setTimeout(() => {
        snackbar.value = true
      }, 200)
    }
  },
)

watch(
  () => snackbar.value,
  (newVal) => {
    if (!newVal) {
      mainModule.resetSnackbar()
    }
  },
)

// Methods
const logout = () => {
  $cookie.set('logger', undefined, new Date(Date.now()))
  setTimeout(() => {
    router.push({ name: 'Login' })
    setTimeout(() => {
      loggerData.value = {}
      token.value = null
    }, 400)
  }, 300)
}
</script>
