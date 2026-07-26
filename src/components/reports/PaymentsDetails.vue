<template>
  <v-dialog @after-leave="closeModal" max-width="1400">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 d-flex align-center justify-space-between">
        <v-row>
          <v-col>
            <span> مدفوعات الطالب: ( {{ toPreview.student?.fullName }} ) </span>
          </v-col>
          <v-col> الصف: {{ toPreview.grade.name }} </v-col>
          <v-col> المجموعة: {{ toPreview.group.name }} </v-col>
        </v-row>
      </v-card-title>
      <v-divider class="my-2"></v-divider>
      <v-card-text>
        <v-row>
          <v-col>
            <v-select
              :id="Math.random()"
              v-model="options.type"
              :items="typess"
              item-title="title"
              item-value="value"
              label="نوع العملية"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col>
            <v-select
              :id="Math.random()"
              v-model="options.status"
              :items="statuses"
              item-title="title"
              item-value="value"
              label="حالة الدفع"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col>
            <v-date-input
              :id="Math.random()"
              v-model="options.fromDate"
              label="من تاريخ"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>

          <v-col>
            <v-date-input
              :id="Math.random()"
              v-model="options.toDate"
              label="إلى تاريخ"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
        <!-- items Table -->
        <v-card class="flex-grow-1 payment-details">
          <v-data-table-server
            :headers="headers"
            :items="details.docs"
            :loading="loading"
            item-value="_id"
            class="elevation-0 h-100"
            style="height: 60vh"
          >
            <template #item.type="{ item }">
              <span>{{ item.type == 'Book' ? 'مذكرة' : 'اشتراك شهري' }}</span>
            </template>
            <template #item.status="{ item }">
              <v-chip label density="compact" :color="item.status == 'Paid' ? 'success' : 'red'">{{
                item.status == 'Paid' ? 'تم الدفع' : 'لم يتم الدفع'
              }}</v-chip>
            </template>

            <template #item.paymentDate="{ item }">
              {{ item.paymentDate ? moment(item.paymentDate).format('YYYY/MM/DD') : '...' }}
            </template>

            <template #item.attended="{ item }">
              <v-chip :color="item.attended ? 'success' : 'red'" size="small" label>
                {{ item.attended ? 'حاضر' : 'غائب' }}
              </v-chip>
            </template>
            <template #item.payNow="{ item, index }">
              <v-btn
                color="primary"
                v-if="item.status != 'Paid'"
                density="compact"
                elevation="1"
                @click="openConfirmDialog(item, item.itemId ? 'Book' : 'Subscription', index)"
                >دفع الان</v-btn
              >
              <span v-else>...</span>
            </template>
            <template #bottom> </template>
          </v-data-table-server>
        </v-card>
      </v-container>
    </v-card>
    <v-dialog v-model="confirmationDialog" max-width="500">
      <v-card class="card text-center pt-3 pb-7 px-4">
        <div class="text-center mb-2">
          <v-icon size="70" class="global_icon" color="orange">mdi-alert</v-icon>
        </div>
        <h3 :style="`white-space: nowrap; font-size: 22px; color: orange`" class="mb-2">
          {{ confimationTitle }}
        </h3>
        <p style="font-size: 19px; color: rgb(138, 138, 138)" class="my-1">
          {{ confimationMsg }}
        </p>
        <div class="text-center d-flex justify-center align-center" style="gap: 10px">
          <v-btn
            class="mt-5"
            width="100"
            color="orange-darken-2"
            style="height: 44px; text-transform: capitalize; font-size: 16px; letter-spacing: 0px"
            elevation="0"
            :loading="payLoading"
            @click="payNow"
            >تاكيد الدفع</v-btn
          >
          <v-btn
            class="mt-5"
            width="100"
            color="red"
            @click="confirmationDialog = false"
            style="height: 44px; text-transform: capitalize; font-size: 16px; letter-spacing: 0px"
            elevation="0"
            >الغاء</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import reportService from '@/services/report.js'
import paymentService from '@/services/payment.js'
import moment from 'moment'
import { useMainStore } from '@/stores'

const details = ref({})
const itemToPay = ref({})
const options = ref({
  limit: 5000,
  type: null,
  status: null,
  fromDate: null,
  toDate: null,
})

const loading = ref(false)
const confirmationDialog = ref(false)
const confimationMsg = ref(null)
const confimationTitle = ref(null)

const { toPreview } = defineProps({
  toPreview: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['leave', 'refreshData'])

const typess = [
  {
    title: 'الكل',
    value: null,
  },
  {
    title: 'اشتراك',
    value: 'Subscription',
  },
  {
    title: 'مذكرة',
    value: 'Book',
  },
]

const statuses = [
  {
    title: 'الكل',
    value: null,
  },
  {
    title: 'مدفوع',
    value: 'Paid',
  },
  {
    title: 'غير مدفوع',
    value: 'Unpaid',
  },
]

const headers = [
  { title: 'نوع الدفع', key: 'type', sortable: false },
  { title: 'اسم الدفع', key: 'itemName', sortable: false },
  { title: 'قيمة الدفع', key: 'amount', sortable: false },
  { title: 'حالة الدفع', key: 'status', sortable: false },
  { title: 'ملاحظات الطالب', key: 'student.notes', sortable: false },
  { title: 'تاريخ الدفع', key: 'paymentDate', sortable: false },
  { title: 'العمليات', key: 'payNow', sortable: false },
]

// Watchers
watch(
  () => toPreview,
  (newVal) => {
    if (newVal?.student) {
      listItems()
    }
  },
  { deep: true },
)

watch(
  () => options.value,
  () => {
    if (toPreview?.student) {
      listItems()
    }
  },
  { deep: true },
)

// Methods
const closeModal = () => {
  emits('leave')
}

const listItems = async () => {
  loading.value = true
  reportService
    .getStudentPaymentsDetails({
      ...options.value,
      studentId: toPreview.student?._id,
    })
    .then(({ data }) => {
      details.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

const openConfirmDialog = (item, type, index) => {
  itemToPay.value = {
    index,
    type,
    student: item.student._id,
    grade: item.grade._id,
    group: item.group._id,
    amount: item.amount,
    book: item.itemId,
    month: item.month,
    year: item.year,
  }
  confimationTitle.value = `دفع ${item.itemName}`
  confimationMsg.value = `هل انت متاكد من دفع ${item.itemName}?`
  confirmationDialog.value = true
}

const payNow = async () => {
  paymentService
    .create(itemToPay.value)
    .then(({ data }) => {
      listItems()
      useMainStore().callResponse(true, data.message, 1)
      confirmationDialog.value = false
      emits('refreshData')
    })
    .catch((err) => {
      console.log(err)
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
}
</script>
