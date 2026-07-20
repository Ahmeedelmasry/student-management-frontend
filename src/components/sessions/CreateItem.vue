<template>
  <v-dialog width="1000" @after-leave="closeModal">
    <v-card class="pa-4" min-height="70vh">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات المحاضرة' : 'انشاء محاضرة جديدة' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.title"
              label="اسم المحاضرة"
              variant="outlined"
              density="compact"
              :error-messages="v$.title.$errors.map((e) => e.$message)"
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
              @update:model-value="item.group = null"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.group"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعات"
              variant="outlined"
              density="compact"
              :error-messages="v$.group.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <VueDatePicker
              v-model="item.sessionDate"
              :enable-time-picker="false"
              auto-apply
              :locale="ar"
              :disabled="!item.group"
              style="direction: ltr"
              :filters="filters"
              placeholder="تاريخ الحصة"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="item.notes"
              label="ملاحظات"
              variant="outlined"
              rows="3"
              auto-grow
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
import gradeService from '@/services/grade.js'
import { useMainStore } from '@/stores'
import sessionService from '@/services/session'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { ar } from 'date-fns/locale'

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

      if (newVal.grade) {
        item.value.grade = newVal.grade._id
      }

      if (newVal.group) {
        item.value.group = newVal.group._id
      }
    }
  },
)

const item = ref({
  title: '',
  grade: null,
  sessionDate: null,
  group: null,
  notes: '',
  isActive: true,
})

const weekDays = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const grades = ref([])

const loading = ref(false)

const rules = computed(() => ({
  title: {
    required: helpers.withMessage('ادخل اسم الامتحان', required),
  },

  grade: {
    required: helpers.withMessage('اختر الصف', required),
  },

  group: {
    required: helpers.withMessage('اختر الصف', required),
  },
}))

const v$ = useVuelidate(rules, item)

const relatedGroups = computed(() => {
  const gradeId = item.value.grade
  if (gradeId) {
    return grades.value.find((e) => e._id == gradeId)?.groups || []
  }
  return []
})

const allowedDays = computed(() => {
  if (!item.value.group) return []

  const group = relatedGroups.value.find((e) => e._id == item.value.group)

  return group?.days || []
})

const disabledWeekDays = computed(() => {
  if (!allowedDays.value.length) return []

  const allowed = allowedDays.value.map((e) => weekDays[e])

  return [0, 1, 2, 3, 4, 5, 6].filter((e) => !allowed.includes(e))
})

const filters = computed(() => ({
  weekDays: disabledWeekDays.value,
}))

// Methods
const closeModal = () => {
  item.value = {
    title: '',
    grade: null,
    sessionDate: null,
    group: null,
    notes: '',
    isActive: true,
  }
  emits('leave')
  setTimeout(() => {
    v$.value.$reset()
  }, 100)
}

const getGrades = async () => {
  const { data } = await gradeService.list({
    limit: 1000,
  })

  grades.value = data.docs
}

const createItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true

  sessionService
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

  await sessionService
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

onMounted(() => {
  getGrades()
})
</script>
