<template>
  <v-dialog width="700" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات المذكرة' : 'انشاء مذكرة جديدة' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.name"
              label="اسم المذكرة"
              variant="outlined"
              density="compact"
              :error-messages="v$.name.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model="item.code"
              label="كود المذكرة"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              :id="Math.random()"
              v-model="item.type"
              :items="bookTypes"
              label="النوع"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model.number="item.price"
              type="number"
              label="سعر المذكرة"
              variant="outlined"
              density="compact"
              :error-messages="v$.price.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12">
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

          <v-col cols="12">
            <v-textarea
              v-model="item.description"
              rows="3"
              auto-grow
              label="وصف المذكرة"
              :id="Math.random()"
              variant="outlined"
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
import { computed, ref, watch, onMounted } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'

import bookService from '@/services/book'
import gradeService from '@/services/grade'

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

// Data
const grades = ref([])
const bookTypes = ref([
  {
    title: 'مذكرة',
    value: 'Book',
  },
  {
    title: 'مراجعة',
    value: 'Revision',
  },
  {
    title: 'بوكليت',
    value: 'Booklet',
  },
])

const item = ref({
  name: null,
  grade: null,
  price: null,
  type: 'Book',
  code: null,
  description: '',
  isActive: true,
})

const loading = ref(false)

const rules = computed(() => ({
  name: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },

  grade: {
    required: helpers.withMessage('اختر الصف', required),
  },

  price: {
    required: helpers.withMessage('ادخل السعر', required),
  },
}))

const v$ = useVuelidate(rules, item)

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

// Methods
const closeModal = () => {
  item.value = {
    name: null,
    grade: null,
    price: null,
    code: null,
    type: 'Book',
    description: '',
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

  bookService
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

  await bookService
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

const getGrades = async () => {
  const { data } = await gradeService.list({
    limit: 1000,
  })

  grades.value = data.docs
}

onMounted(() => {
  getGrades()
})
</script>
