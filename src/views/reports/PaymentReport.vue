<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-account-multiple-plus</v-icon>
          تقرير المدفوعات
        </h2>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              :id="Math.random()"
              v-model="options.searchWord"
              label="بحث"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col>
            <v-autocomplete
              :id="Math.random()"
              v-model="options.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف"
              density="compact"
              variant="outlined"
              hide-details
              clearable
              @update:model-value="options.group = null"
            />
          </v-col>

          <v-col>
            <v-autocomplete
              :id="Math.random()"
              v-model="options.group"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعة"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>

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
              clearable
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
              clearable
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
    </v-card>

    <!-- items Table -->
    <v-card class="flex-grow-1">
      <v-data-table-server
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="_id"
        class="elevation-0 h-100"
        v-model:page="options.page"
        v-model:items-per-page="options.limit"
        :items-length="totalItems"
      >
        <template #item.status="{ item }">
          <v-chip :color="item.status == 'Paid' ? 'green' : 'red'" size="small" label>
            {{ item.status == 'Paid' ? 'مدفوع' : 'غير مدفوع' }}
          </v-chip>
        </template>

        <template #item.type="{ item }">
          <v-chip size="small" label :color="item.type == 'Book' ? 'blue' : 'purple'">
            {{ item.type == 'Book' ? 'مذكرة' : 'اشتراك' }}
          </v-chip>
        </template>

        <template #item.amount="{ item }"> {{ item.amount }} ج.م </template>

        <template #item.paymentDate="{ item }">
          {{ item.paymentDate ? moment(item.paymentDate).format('YYYY/MM/DD') : '...' }}
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <v-list elevation="1">
                <v-list-item
                  title="عرض التفاصيل"
                  append-icon="mdi-eye"
                  @click="((toPreview = item), (previewDetailsDialog = true))"
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <AttendanceDetails
      v-model="previewDetailsDialog"
      @leave="((previewDetailsDialog = false), (toPreview = {}))"
      :toPreview="toPreview"
      @refreshTableData="listItems"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import reportService from '@/services/report'
import gradeService from '@/services/grade'
import moment from 'moment'
import AttendanceDetails from '@/components/reports/AttendanceDetails.vue'

const items = ref([])
const grades = ref([])

const loading = ref(false)
const toPreview = ref({})
const previewDetailsDialog = ref(false)

const options = ref({
  searchWord: '',
  grade: null,
  group: null,
  type: null,
  status: null,
  fromDate: null,
  toDate: null,

  page: 1,
  limit: 10,
})

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
    title: 'مدفوع',
    value: 'Paid',
  },
  {
    title: 'غير مدفوع',
    value: 'Unpaid',
  },
]

const totalItems = ref(0)

const headers = [
  {
    title: 'الطالب',
    key: 'student.fullName',
  },
  {
    title: 'الباركود',
    key: 'student.barcode',
  },
  {
    title: 'الصف',
    key: 'grade.name',
  },
  {
    title: 'المجموعة',
    key: 'group.name',
  },
  {
    title: 'نوع العملية',
    key: 'type',
  },
  {
    title: 'شهر / مذكرة',
    key: 'itemName',
  },
  {
    title: 'القيمة',
    key: 'amount',
  },
  {
    title: 'الحالة',
    key: 'status',
  },
  {
    title: 'تاريخ الدفع',
    key: 'paymentDate',
  },
  {
    title: 'الوصف',
    key: 'description',
  },
  {
    title: 'العمليات',
    key: 'actions',
    sortable: false,
  },
]

// Watchers
watch(
  () => options.value,
  () => {
    listItems()
  },
  { deep: true },
)

const relatedGroups = computed(() => {
  const gradeId = options.value.grade
  if (gradeId) {
    return grades.value.find((e) => e._id == gradeId)?.groups || []
  }
  return []
})

const listItems = async () => {
  await reportService
    .getPaymentsReport({ ...options.value })
    .then(({ data }) => {
      console.log(data)
      items.value = data.docs
      totalItems.value = data.totalDocs
    })
    .catch((err) => console.log(err))
}

const getGrades = async () => {
  await gradeService
    .list({ limit: 1000 })
    .then(({ data }) => {
      grades.value = data.docs
    })
    .catch((err) => console.log(err))
}

onMounted(async () => {
  listItems()
  getGrades()
})
</script>
