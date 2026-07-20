<template>
  <v-dialog width="800" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              :id="Math.random()"
              v-model="item.fullName"
              label="اسم الطالب"
              variant="outlined"
              density="compact"
              :error-messages="v$.fullName.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.studentPhone"
              label="رقم الطالب"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.parentPhone"
              label="رقم ولي الأمر"
              variant="outlined"
              density="compact"
              :error-messages="v$.parentPhone.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.barcode"
              label="الباركود"
              variant="outlined"
              density="compact"
              :error-messages="v$.barcode.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف"
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
              label="المجموعة"
              variant="outlined"
              density="compact"
              :disabled="!item.grade"
              :error-messages="v$.group.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-date-input
              :id="Math.random()"
              v-model="item.registrationDate"
              label="تاريخ التسجيل"
              variant="outlined"
              density="compact"
              :error-messages="v$.registrationDate.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="item.notes"
              label="ملاحظات"
              rows="3"
              variant="outlined"
              density="compact"
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
import studentService from '@/services/student'
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
  fullName: null,
  studentPhone: '',
  parentPhone: '',
  barcode: '',
  grade: null,
  group: null,
  registrationDate: new Date(),
  notes: '',
  isActive: true,
})

const grades = ref([])

const loading = ref(false)

const rules = computed(() => ({
  fullName: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  parentPhone: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  barcode: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  grade: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  group: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  registrationDate: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
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

// Methods
const closeModal = () => {
  item.value = {
    fullName: null,
    studentPhone: '',
    parentPhone: '',
    barcode: '',
    grade: null,
    group: null,
    registrationDate: new Date(),
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

  studentService
    .create({
      ...item.value,
      registrationDate: new Date(item.value.registrationDate).setHours(23, 59, 0),
    })
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
  const body = {
    ...item.value,
    registrationDate: new Date(item.value.registrationDate).setHours(23, 59, 0),
  }

  if (!item.password) delete body.password

  await studentService
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
