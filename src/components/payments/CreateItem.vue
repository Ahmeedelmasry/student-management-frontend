<template>
  <v-dialog width="700" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات الدفع' : 'تسجيل دفع جديد' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.student"
              :items="students"
              item-title="fullName"
              item-value="_id"
              label="الطالب"
              variant="outlined"
              density="compact"
              :error-messages="v$.student.$errors.map((e) => e.$message)"
              @update:model-value="onStudentSelect"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              :id="Math.random()"
              v-model="item.type"
              :items="paymentTypes"
              label="نوع الدفع"
              variant="outlined"
              @update:model-value="onTypeSelect"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6" v-if="item.type == 'Subscription'">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.month"
              :items="months"
              label="الشهر"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6" v-if="item.type == 'Subscription'">
            <v-text-field
              :id="Math.random()"
              type="number"
              v-model.number="item.year"
              label="السنة"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" v-if="item.type == 'Book'">
            <v-autocomplete
              :id="Math.random()"
              v-model="item.book"
              :items="books"
              item-title="name"
              item-value="_id"
              label="المذكرة"
              variant="outlined"
              density="compact"
              @update:model-value="onBookSelect"
              :error-messages="v$.book.$errors.map((e) => e.$message)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              :id="Math.random()"
              v-model.number="item.amount"
              type="number"
              label="المبلغ"
              variant="outlined"
              density="compact"
              :error-messages="v$.amount.$errors.map((e) => e.$message)"
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              :id="Math.random()"
              v-model="item.paymentMethod"
              :items="paymentMethods"
              label="طريقة الدفع"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              :id="Math.random()"
              v-model="item.status"
              :items="statuses"
              label="الحالة"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-date-input
              :id="Math.random()"
              v-model="item.paymentDate"
              label="تاريخ الدفع"
              variant="outlined"
              density="compact"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="item.notes"
              label="ملاحظات"
              rows="3"
              variant="outlined"
              no-resize
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
import { required, helpers, requiredIf } from '@vuelidate/validators'
import paymentService from '@/services/payment.js'
import studentService from '@/services/student.js'
import { useMainStore } from '@/stores'
import bookService from '@/services/book.js'

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
  student: null,
  type: 'Subscription',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  book: null,
  amount: null,
  paymentMethod: 'Cash',
  paymentDate: new Date(),
  status: 'Paid',
  notes: '',
})

const students = ref([])
const books = ref([])

const paymentTypes = [
  {
    title: 'اشتراك',
    value: 'Subscription',
  },
  {
    title: 'مذكرة',
    value: 'Book',
  },
]

const paymentMethods = [
  {
    title: 'كاش',
    value: 'Cash',
  },
  {
    title: 'إنستا باي',
    value: 'Instapay',
  },
  {
    title: 'فودافون كاش',
    value: 'VodafoneCash',
  },
  {
    title: 'تحويل بنكي',
    value: 'Bank',
  },
]

const statuses = [
  {
    title: 'مدفوع',
    value: 'Paid',
  },
  {
    title: 'ملغي',
    value: 'Cancelled',
  },
  {
    title: 'مرتجع',
    value: 'Refunded',
  },
]

const months = [
  { title: 'يناير', value: 1 },
  { title: 'فبراير', value: 2 },
  { title: 'مارس', value: 3 },
  { title: 'إبريل', value: 4 },
  { title: 'مايو', value: 5 },
  { title: 'يونيو', value: 6 },
  { title: 'يوليو', value: 7 },
  { title: 'أغسطس', value: 8 },
  { title: 'سبتمبر', value: 9 },
  { title: 'أكتوبر', value: 10 },
  { title: 'نوفمبر', value: 11 },
  { title: 'ديسمبر', value: 12 },
]

const loading = ref(false)

const rules = computed(() => ({
  student: {
    required: helpers.withMessage('اختر الطالب', required),
  },

  amount: {
    required: helpers.withMessage('ادخل المبلغ', required),
  },

  paymentDate: {
    required: helpers.withMessage('ادخل التاريخ', required),
  },

  month: {
    required: helpers.withMessage(
      'اختر الشهر',
      (value) => item.value.type !== 'Subscription' || !!value,
    ),
  },

  book: {
    requiredIf: helpers.withMessage(
      'اختر الشهر',
      (value) => item.value.type !== 'Subscription' || !!value,
      requiredIf(item.value.type == 'Book'),
    ),
  },

  year: {
    required: helpers.withMessage(
      'ادخل السنة',
      (value) => item.value.type !== 'Subscription' || !!value,
    ),
  },

  book: {
    required: helpers.withMessage('اختر المذكرة', (value) => item.value.type !== 'Book' || !!value),
  },
}))

const v$ = useVuelidate(rules, item)

// Methods
const onStudentSelect = () => {
  const student = item.value.student
  if (!student) {
    item.value.amount = null
    item.value.group = null
    item.value.grade = null
    return
  }

  const exists = students.value.find((e) => e._id == student)
  if (exists) {
    item.value.group = exists.group._id
    item.value.grade = exists.grade._id
    if (item.value.type == 'Subscription') {
      item.value.amount = exists.group.monthlyPrice
    }
  }
}

const onTypeSelect = () => {
  item.value.book = null
}

const onBookSelect = (book) => {
  const exists = books.value.find((e) => e._id == book)
  if (exists) {
    if (item.value.type == 'Book') {
      item.value.amount = exists.price
    }
  }
}

const closeModal = () => {
  item.value = {
    student: null,
    type: 'Subscription',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    book: null,
    amount: null,
    paymentMethod: 'Cash',
    paymentDate: new Date(),
    status: 'Paid',
    notes: '',
  }
  emits('leave')
  setTimeout(() => {
    v$.value.$reset()
  }, 100)
}

const createItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true

  paymentService
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

  await paymentService
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
  listStudents()
  getBooks()
})
</script>
