<template>
  <v-dialog width="800" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات المجموعة' : 'انشاء مجموعة جديدة' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
:id="Math.random()"
              v-model="item.name"
              label="اسم المجموعة"
              variant="outlined"
              density="compact"
              :error-messages="v$.name.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
:id="Math.random()"
              v-model="item.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف الدراسي"
              variant="outlined"
              density="compact"
              :error-messages="v$.grade.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
:id="Math.random()"
              v-model="item.startTime"
              type="time"
              label="وقت البداية"
              variant="outlined"
              density="compact"
              :error-messages="v$.startTime.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
:id="Math.random()"
              v-model="item.endTime"
              type="time"
              label="وقت النهاية"
              variant="outlined"
              density="compact"
              :error-messages="v$.endTime.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
:id="Math.random()"
              v-model="item.days"
              :items="weekDays"
              multiple
              chips
              closable-chips
              label="أيام المجموعة"
              variant="outlined"
              density="compact"
              :error-messages="v$.days.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="6">
            <v-text-field
:id="Math.random()"
              v-model.number="item.monthlyPrice"
              type="number"
              min="0"
              label="الاشتراك الشهري"
              variant="outlined"
              density="compact"
              :error-messages="v$.monthlyPrice.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="6">
            <v-date-input
:id="Math.random()"
              v-model="item.startDate"
              label="تاريخ البداية"
              variant="outlined"
              density="compact"
              :error-messages="v$.startDate.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="6">
            <v-date-input
:id="Math.random()"
              v-model="item.endDate"
              label="تاريخ النهاية"
              variant="outlined"
              density="compact"
              :error-messages="v$.endDate.$errors.map((e) => e.$message)"
            />
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
import { computed, onMounted, ref, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import groupService from '@/services/group.js'
import gradeService from '@/services/grade.js'
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

const item = ref({
  name: null,
  grade: null,
  days: [],
  startTime: null,
  endTime: null,
  monthlyPrice: null,
  startDate: null,
  endDate: null,
  notes: '',
  isActive: true,
})

const grades = ref([])

const weekDays = [
  { title: 'السبت', value: 'Saturday' },
  { title: 'الأحد', value: 'Sunday' },
  { title: 'الإثنين', value: 'Monday' },
  { title: 'الثلاثاء', value: 'Tuesday' },
  { title: 'الأربعاء', value: 'Wednesday' },
  { title: 'الخميس', value: 'Thursday' },
  { title: 'الجمعة', value: 'Friday' },
]

const loading = ref(false)

const rules = computed(() => ({
  name: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  grade: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  days: {
    required: helpers.withMessage('اختر يوم واحد على الأقل', required),
  },

  startTime: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  endTime: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  monthlyPrice: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  startDate: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  endDate: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },
}))

const v$ = useVuelidate(rules, item)

// Methods
const closeModal = () => {
  item.value = {
    name: null,
    grade: null,
    days: [],
    startTime: null,
    endTime: null,
    monthlyPrice: null,
    startDate: null,
    endDate: null,
    notes: '',
    isActive: true,
  }
  emits('leave')
  setTimeout(() => {
    v$.value.$reset()
  }, 100)
}

const createItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true

  groupService
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

  await groupService
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

const getGrades = () => {
  gradeService
    .list({ limit: 1000 })
    .then(({ data }) => {
      grades.value = data.docs
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
}

onMounted(() => {
  getGrades()
})
</script>
