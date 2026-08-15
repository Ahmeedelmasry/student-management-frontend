<template>
  <v-dialog @after-leave="closeModal" max-width="1400">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 font-weight-bold">
        <span> تسليم ( {{ item.name }} ) للطلاب</span>
        <v-btn icon="mdi-printer" size="small" v-print="printObj" class="mr-2"></v-btn>
      </v-card-title>
      <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
        <v-row class="mb-4 align-center flex-grow-0">
          <v-col class="pt-0">
            <v-text-field
              :id="Math.random()"
              v-model="options.searchWord"
              label="بحث"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              chips
              clearable
              :disabled="!item?._id"
            />
          </v-col>
          <v-col class="pt-0">
            <v-autocomplete
              :id="Math.random()"
              v-model="options.groupIds"
              :items="getRelatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعات"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              chips
              clearable
              :disabled="!item?._id"
            />
          </v-col>
          <v-col class="pt-0">
            <v-select
              :id="Math.random()"
              v-model="options.paymentStatus"
              :items="paymentStatuses"
              label="حالة الدفع"
              variant="outlined"
              density="compact"
              hide-details
              :disabled="!item?._id"
            />
          </v-col>
        </v-row>

        <!-- items Table -->
        <v-card class="flex-grow-1" id="printable-table">
          <div class="print-title font-weight-bold mb-4 justify-space-between">
            <div>حالة دفع الطلاب للمذكرة {{ item.name }}</div>
            <div class="mt-1 text-grey" style="font-size: 12px; direction: ltr">
              {{ moment(new Date()).format('YYYY-MM-DD h:m a') }}
            </div>
          </div>
          <v-data-table-server
            :headers="headers"
            :items="items"
            :loading="loading"
            item-value="_id"
            class="elevation-0 h-100"
            style="height: 60vh"
            v-model="selectedRows"
            show-select
          >
            <template #item.registrationDate="{ item }">
              {{ moment(item.registrationDate).format('YYYY/MM/DD') }}
            </template>
            <template #item.paymentDate="{ item }">
              <span v-if="item.paymentDate">{{
                moment(item.paymentDate).format('YYYY/MM/DD')
              }}</span>
              <span v-else>...</span>
            </template>

            <template #item.isPaid="{ item }">
              <v-chip
                label
                density="compact"
                :color="item.isPaid ? 'success' : 'red'"
                class="font-weight-bold"
                >{{ (item.isPaid && 'نعم') || 'لا' }}</v-chip
              >
            </template>
            <template #bottom></template>
          </v-data-table-server>
        </v-card>
      </v-container>
      <v-card-actions>
        <v-spacer />

        <!-- <v-btn color="red" :disabled="saveLoading" @click="closeModal"> اغلاق </v-btn> -->

        <v-btn
          :loading="saveLoading"
          :disabled="!selectedRows.length"
          @click="payOnly"
          class="bg-blue text-white"
        >
          دفع فقط
        </v-btn>
        <v-btn
          :loading="saveLoading"
          :disabled="!selectedRows.length"
          @click="saveData"
          class="bg-blue text-white"
        >
          تسليم فقط
        </v-btn>
        <v-btn
          :loading="saveLoading"
          :disabled="!selectedRows.length"
          @click="saveData(true)"
          class="bg-primary text-white"
        >
          دفع وتسليم
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useMainStore } from '@/stores'
import groupService from '@/services/group'
import bookAssignService from '@/services/bookAssign'
import paymentService from '@/services/payment'
import moment from 'moment'

const items = ref([])
const groups = ref([])
const selectedRows = ref([])

// Print
const printObj = ref({
  id: 'printable-table',
  popTitle: ' -',
  extraCss:
    'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
})

const loading = ref(false)
const saveLoading = ref(false)

const { item } = defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['leave'])

const headers = [
  { title: 'الطالب', key: 'fullName', sortable: false },
  { title: 'باركود', key: 'barcode', sortable: false },
  { title: 'الصف', key: 'grade.name', sortable: false },
  { title: 'المجموعة', key: 'group.name', sortable: false },
  { title: 'رقم الهاتف', key: 'studentPhone', sortable: false },
  { title: 'رقم ولي الامر', key: 'parentPhone', sortable: false },
  { title: 'تاريخ التسجيل', key: 'registrationDate', sortable: false },
  { title: 'تم الدفع', key: 'isPaid', sortable: false },
  { title: 'تاريخ الدفع', key: 'paymentDate', sortable: false },
]

const paymentStatuses = ref([
  {
    title: 'الكل',
    value: null,
  },
  {
    title: 'تم الدفع',
    value: 'paid',
  },
  {
    title: 'لم يتم الدفع',
    value: 'unpaid',
  },
])

const options = ref({
  groupIds: [],
  paymentStatus: null,
  searchWord: '',
})

// Watchers
watch(
  () => item,
  (newVal) => {
    if (newVal?._id) {
      listItems()
      listAllGroups()
    }
  },
  { deep: true },
)

watch(
  () => options.value,
  () => {
    if (item._id) {
      listItems()
    }
  },
  { deep: true },
)

// Computed
const getRelatedGroups = computed(() => {
  const items = groups.value.filter((e) => e.grade?._id == item.grade?.id)
  return items
})

// Methods
const closeModal = () => {
  item._id = null
  emits('leave')
}

const listItems = async () => {
  loading.value = true
  bookAssignService
    .getUnassignedStudents(item._id, { ...options.value, limit: 10000 })
    .then(({ data }) => {
      items.value = data.docs
      console.log(data)
    })
    .finally(() => {
      loading.value = false
    })
}

const listAllGroups = async () => {
  loading.value = true
  groupService
    .list({ limit: 1000 })
    .then(({ data }) => {
      groups.value = data.docs
      options.value.groupIds = data.docs
        .filter((e) => e.grade?._id == item.grade?.id)
        .map((e) => e._id)
    })
    .finally(() => {
      loading.value = false
    })
}

const saveData = async (pay = false) => {
  await bookAssignService
    .bulkAssignStudents(item._id, selectedRows.value, { payNow: pay })
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => (saveLoading.value = false))
}

const payOnly = async () => {
  const bodyItems = []
  selectedRows.value.forEach((studentId) => {
    const student = items.value.find((e) => e._id == studentId)
    if (student) {
      const paymentBody = {
        student: student._id,
        group: student.group._id,
        grade: student.grade._id,
        type: 'Book',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        book: item._id,
        paymentMethod: 'Cash',
        amount: item.price,
      }
      bodyItems.push(paymentBody)
    }
  })

  if (bodyItems.length) {
    await paymentService
      .bulkBookPay({
        rows: bodyItems,
      })
      .then(({ data }) => {
        useMainStore().callResponse(true, data.message, 1)
        closeModal()
      })
      .catch((err) => {
        useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
      })
      .finally(() => (saveLoading.value = false))
  }
}
</script>

<style lang="scss">
@media print {
  #printable-table {
    th:first-child,
    td:first-child {
      display: none;
    }
    th:last-child,
    td:last-child {
      display: table-cell !important;
    }
  }
}
</style>
