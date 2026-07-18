<template>
  <v-dialog width="700" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات المستخدم' : 'انشاء مستخدم جديد' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
:id="Math.random()"
              density="compact"
              v-model="item.fullName"
              label="الاسم بالكامل"
              variant="outlined"
              :error-messages="v$.fullName.$errors.map((e) => e.$message)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
:id="Math.random()"
              density="compact"
              v-model="item.userName"
              label="اسم تسجيل الدخول"
              variant="outlined"
              :error-messages="v$.userName.$errors.map((e) => e.$message)"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
:id="Math.random()"
              :type="showPassword ? 'text' : 'password'"
              density="compact"
              v-model="item.password"
              label="كلمة المرور"
              variant="outlined"
              :error-messages="toUpdate._id ? '' : v$.password.$errors.map((e) => e.$message)"
            >
              <template #append-inner>
                <v-icon @click="showPassword = !showPassword"
                  >mdi-{{ showPassword ? 'eye-off' : 'eye' }}</v-icon
                >
              </template>
            </v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select
:id="Math.random()"
              density="compact"
              v-model="item.isAdmin"
              label="نوع المستخدم"
              variant="outlined"
              :error-messages="v$.isAdmin.$errors.map((e) => e.$message)"
              :items="userTypes"
            >
            </v-select>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-5">
        <v-spacer />

        <v-btn color="grey" variant="text" @click="closeModal"> إلغاء </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          @click="toUpdate._id ? updateItem() : createItem()"
        >
          حفظ التعديلات
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import adminService from '@/services/admin.js'
import { useMainStore } from '@/stores'

// Props
const { toUpdate } = defineProps({
  toUpdate: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emits = defineEmits('leave', 'refreshTableData')

// Watchers
watch(
  () => toUpdate,
  (newVal) => {
    if (newVal._id) {
      for (const val of Object.entries(item.value)) {
        item.value[val[0]] = toUpdate[val[0]]
      }
    }
  },
)

// Data
const userTypes = ref([
  {
    title: 'محرر',
    value: false,
  },
  {
    title: 'مسؤول',
    value: true,
  },
])

const item = ref({
  fullName: null,
  userName: null,
  password: null,
  isAdmin: false,
})

const loading = ref(false)

const rules = computed(() => {
  return {
    fullName: {
      required: helpers.withMessage('هذا الحقل مطلوب', required),
    },
    userName: {
      required: helpers.withMessage('هذا الحقل مطلوب', required),
    },
    password: {
      required: helpers.withMessage('هذا الحقل مطلوب', required),
    },
    isAdmin: {
      required: helpers.withMessage('هذا الحقل مطلوب', required),
    },
  }
})

const v$ = useVuelidate(rules, item)

// Methods
const closeModal = () => {
  item.value = {
    fullName: null,
    userName: null,
    password: null,
    isAdmin: false,
  }
  emits('leave')
  setTimeout(() => {
    v$.value.$reset()
  }, 100)
}

const createItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true

  adminService
    .create(item.value)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      emits('refreshTableData')
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => {
      loading.value = false
    })
}

const updateItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true
  const body = { ...item.value }

  if (!item.password) delete body.password

  await adminService
    .update(body, toUpdate._id)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      emits('refreshTableData')
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
