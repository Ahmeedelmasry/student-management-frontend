<template>
  <v-dialog width="700" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات الامتحان' : 'انشاء امتحان جديد' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.name"
              label="اسم الامتحان"
              variant="outlined"
              density="compact"
              :error-messages="v$.name.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              v-model="item.status"
              :items="statuses"
              label="الحالة"
              variant="outlined"
              density="compact"
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

          <v-col cols="12" md="6">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.groups"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              multiple
              chips
              closable-chips
              label="المجموعات"
              variant="outlined"
              density="compact"
              :error-messages="v$.groups.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model.number="item.maxScore"
              type="number"
              label="الدرجة النهائية"
              variant="outlined"
              density="compact"
              :error-messages="v$.maxScore.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              type="number"
              v-model.number="item.duration"
              label="مدة الامتحان (بالدقايق)"
              variant="outlined"
              density="compact"
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
import studentService from '@/services/student.js'
import { useMainStore } from '@/stores'
import bookService from '@/services/book.js'
import examService from '@/services/exam'

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

      if (newVal.groups) {
        item.value.groups = newVal.groups.map((g) => g._id || g)
      }
    }
  },
)

const item = ref({
  name: '',
  grade: null,
  groups: [],
  maxScore: null,
  duration: null,
  notes: '',
  status: 'Published',
  isActive: true,
})

const statuses = [
  {
    title: 'مسودة',
    value: 'Draft',
  },
  {
    title: 'منشور',
    value: 'Published',
  },
  {
    title: 'منتهي',
    value: 'Finished',
  },
]

const students = ref([])
const books = ref([])

const grades = ref([])

const loading = ref(false)

const rules = computed(() => ({
  name: {
    required: helpers.withMessage('ادخل اسم الامتحان', required),
  },

  grade: {
    required: helpers.withMessage('اختر الصف', required),
  },

  groups: {
    required: helpers.withMessage('اختر مجموعة واحدة على الأقل', (value) => value?.length > 0),
  },

  maxScore: {
    required: helpers.withMessage('ادخل الدرجة النهائية', required),
  },

  duration: {
    required: helpers.withMessage('ادخل مدة الامتحان', required),
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
    name: '',
    grade: null,
    groups: [],
    maxScore: null,
    duration: null,
    notes: '',
    status: 'Published',
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

  examService
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

  await examService
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

const listStudents = async () => {
  await studentService
    .list({ limit: 10000 })
    .then(({ data }) => {
      students.value = data.docs
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
}

const getBooks = () => {
  bookService
    .list({
      limit: 1000,
    })
    .then(({ data }) => {
      books.value = data.docs
    })
}

onMounted(() => {
  getGrades()
})
</script>
