<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="12" class="d-flex align-center justify-space-between ga-2">
        <h2 class="text-h4 font-weight-bold text-auto">
          <v-icon class="text-auto me-2">mdi-file-chart</v-icon>
          تقرير المدفوعات
        </h2>
        <v-btn icon="mdi-printer" size="small" v-print="printObj"></v-btn>
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
        </v-row>
      </v-card-text>
    </v-card>

    <!-- items Table -->
    <v-card class="flex-grow-1" id="printable">
      <div class="print-title font-weight-bold mb-4 justify-space-between">
        <div>تقرير المدفوعات</div>
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
        v-model:page="options.page"
        v-model:items-per-page="options.limit"
        :items-length="totalItems"
        :items-per-page-options="perPage"
      >
        <template #item.paidBooks="{ item }">
          <v-chip color="success" label density="compact" class="font-weight-bold">{{
            item.books?.paid?.length
          }}</v-chip>
        </template>
        <template #item.unpaidBooks="{ item }">
          <v-chip color="error" label density="compact" class="font-weight-bold">{{
            item.books?.unpaid?.length
          }}</v-chip>
        </template>
        <template #item.paidMonths="{ item }">
          <v-chip color="success" label density="compact" class="font-weight-bold">{{
            item.subscriptions?.paid?.length
          }}</v-chip>
        </template>
        <template #item.unpaidMonths="{ item }">
          <v-chip color="error" label density="compact" class="font-weight-bold">{{
            item.subscriptions?.unpaid?.length
          }}</v-chip>
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

    <PayementsDetails
      v-model="previewDetailsDialog"
      @leave="((previewDetailsDialog = false), (toPreview = {}))"
      :toPreview="toPreview"
      @refreshData="listItems"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import reportService from '@/services/report'
import gradeService from '@/services/grade'
import PayementsDetails from '@/components/reports/PaymentsDetails.vue'

const items = ref([])
const grades = ref([])

// Print
const printObj = ref({
  id: 'printable',
  popTitle: ' -',
  extraCss:
    'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
})

const loading = ref(false)
const toPreview = ref({})
const previewDetailsDialog = ref(false)

const options = ref({
  searchWord: '',
  grade: null,
  group: null,
  page: 1,
  limit: 10,
})

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
    title: 'مذكرات مدفوعة',
    key: 'paidBooks',
  },
  {
    title: 'مذكرات غير مدفوعة',
    key: 'unpaidBooks',
  },
  {
    title: 'اشتراكات مدفوعة',
    key: 'paidMonths',
  },
  {
    title: 'اشتراكات غير مدفوعة',
    key: 'unpaidMonths',
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
