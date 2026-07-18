<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-account-multiple-plus</v-icon>
          ادارة الماليات
        </h2>
      </v-col>
      <v-col cols="6" class="text-end">
        <v-btn color="primary" @click="editDialog = true">تسجيل دفع جديد</v-btn>
      </v-col>
    </v-row>

    <!-- items Table -->
    <v-card class="mb-4 pa-4">
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            hide-details
            :id="Math.random()"
            v-model="options.searchWord"
            label="بحث"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-autocomplete
            hide-details
            :id="Math.random()"
            v-model="options.grade"
            :items="grades"
            item-title="name"
            item-value="_id"
            label="الصف"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="options.group = null"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-autocomplete
            hide-details
            :id="Math.random()"
            v-model="options.group"
            :items="relatedGroups"
            item-title="name"
            item-value="_id"
            label="المجموعة"
            variant="outlined"
            density="compact"
            clearable
            :disabled="!options.grade"
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            hide-details
            :id="Math.random()"
            v-model="options.type"
            :items="paymentTypes"
            label="نوع الدفع"
            variant="outlined"
            density="compact"
            @update:model-value="((options.year = null), (options.month = null))"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-autocomplete
            hide-details
            :id="Math.random()"
            v-model="options.paymentMethod"
            :items="paymentMethods"
            label="طريقة الدفع"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2" v-if="options.type == 'Subscription'">
          <v-autocomplete
            hide-details
            :id="Math.random()"
            v-model="options.month"
            :items="months"
            label="الشهر"
            variant="outlined"
            density="compact"
            clearable
          />
        </v-col>

        <v-col cols="12" md="2" v-if="options.type == 'Subscription'">
          <v-text-field
            hide-details
            :id="Math.random()"
            v-model.number="options.year"
            type="number"
            label="السنة (2026)"
            variant="outlined"
            density="compact"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-date-input
            :id="Math.random()"
            v-model="options.fromDate"
            label="من تاريخ"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-date-input
            :id="Math.random()"
            v-model="options.toDate"
            label="إلى تاريخ"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

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
        <template #item.createdAt="{ item }">
          {{ moment(item.createdAt).format('YYYY/MM/DD') }}
        </template>

        <template #item.book="{ item }">
          {{ item.book?.name || '...' }}
        </template>
        <template #item.paymentDate="{ item }">
          {{ moment(item.paymentDate).format('YYYY/MM/DD') }}
        </template>

        <template #item.type="{ item }">
          <v-chip size="small" :color="item.type == 'Subscription' ? 'primary' : 'success'">
            {{ item.type == 'Subscription' ? 'اشتراك' : 'مذكرة' }}
          </v-chip>
        </template>

        <template #item.amount="{ item }"> {{ item.amount }} ج.م </template>

        <template #item.actions="{ item }">
          <v-btn size="small" variant="text">
            <v-icon>mdi-dots-vertical</v-icon>
            <v-menu activator="parent">
              <v-list elevation="1">
                <v-list-item
                  title="تعديل"
                  append-icon="mdi-pencil"
                  @click="openEditDialog(item)"
                ></v-list-item>
                <v-list-item
                  title="حذف"
                  append-icon="mdi-delete"
                  @click="openDeleteDialog(item)"
                  v-if="item._id != loggerData._id"
                ></v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>
    <CreateItem
      v-model="editDialog"
      @leave="((editDialog = false), (toUpdate = {}))"
      :toUpdate="toUpdate"
      @refreshTableData="listItems"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import paymentService from '@/services/payment.js'
import moment from 'moment'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth'
import CreateItem from '@/components/payments/CreateItem.vue'
import gradeService from '@/services/grade.js'

const { regetData } = storeToRefs(useMainStore())
const { loggerData } = storeToRefs(useAuthStore())

const items = ref([])

const loading = ref(false)

const options = ref({
  searchWord: '',

  grade: null,
  group: null,

  type: 'Subscription',
  paymentMethod: null,

  month: null,
  year: null,

  fromDate: null,
  toDate: null,

  page: 1,
  limit: 10,
})

const grades = ref([])

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

const totalItems = ref(0)

const editDialog = ref(false)
const toDelete = ref(null)
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
    title: 'النوع',
    key: 'type',
  },

  {
    title: 'اسم المذكرة',
    key: 'book',
  },
  {
    title: 'المبلغ',
    key: 'amount',
  },

  {
    title: 'طريقة الدفع',
    key: 'paymentMethod',
  },
  {
    title: 'تاريخ الدفع',
    key: 'paymentDate',
  },
  {
    title: 'تاريخ الانشاء',
    key: 'createdAt',
  },
  {
    title: 'العمليات',
    key: 'actions',
    sortable: false,
  },
]

const toUpdate = ref({})

// Watchers
watch(
  () => regetData.value,
  (newVal) => {
    if (newVal) {
      listItems()
    }
  },
)

watch(
  () => options.value,
  () => {
    listItems()
  },
  { deep: true },
)

const listItems = async () => {
  await paymentService
    .list({ ...options.value })
    .then(({ data }) => {
      items.value = data.docs
      totalItems.value = data.totalDocs
    })
    .catch((err) => console.log(err))
}

const openEditDialog = (item) => {
  toUpdate.value = { ...item }

  editDialog.value = true
}

const openDeleteDialog = (item) => {
  useMainStore().handleErr('alert', 'حذف الدفع', `هل انت متاكد من حذف هذا الدفع?`, {
    ...item,
    url: 'payments',
  })
  toDelete.value = item
}

const listGrades = async () => {
  await gradeService
    .list({ limit: 10000 })
    .then(({ data }) => {
      grades.value = data.docs
    })
    .catch((err) => console.log(err))
}

const relatedGroups = computed(() => {
  const gradeId = options.value.grade
  if (gradeId) {
    return grades.value.find((e) => e._id == gradeId)?.groups || []
  }
  return []
})

onMounted(async () => {
  listItems()
  listGrades()
})
</script>
