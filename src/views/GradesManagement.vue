<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-auto">
          <v-icon class="text-auto me-2">mdi-school</v-icon>
          ادارة الصفوف الدراسية
        </h2>
      </v-col>
      <v-col cols="6" class="text-end d-flex align-center ga-2 justify-end">
        <v-btn icon="mdi-printer" size="small" v-print="printObj"></v-btn>
        <v-btn color="primary" @click="editDialog = true">انشاء صف دراسي جديد</v-btn>
      </v-col>
    </v-row>

    <!-- items Table -->
    <v-card class="flex-grow-1" id="printable">
      <div class="print-title font-weight-bold mb-4 justify-space-between">
        <div>الصفوف الدراسية</div>
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
        <template #item.isAdmin="{ item }">
          <v-chip :color="item.isAdmin ? 'primary' : 'grey'" size="small">
            {{ item.isAdmin ? 'مسؤول' : 'محرر' }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          {{ moment(item.createdAt).format('YYYY/MM/DD') }}
        </template>

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
    <CreateItemDialog
      v-model="editDialog"
      @leave="((editDialog = false), (toUpdate = {}))"
      :toUpdate="toUpdate"
      @refreshTableData="listItems"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import gradeService from '@/services/grade.js'
import moment from 'moment'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth'
import CreateItemDialog from '@/components/grades/CreateItem.vue'

const { regetData } = storeToRefs(useMainStore())
const { loggerData } = storeToRefs(useAuthStore())

const items = ref([])
const perPage = ref([10, 50, 100, 1000, 2000])

const loading = ref(false)

// Print
const printObj = ref({
  id: 'printable',
  popTitle: ' -',
  extraCss:
    'https://cdn.bootcdn.net/ajax/libs/animate.css/4.1.1/animate.compat.css, https://cdn.bootcdn.net/ajax/libs/hover.css/2.3.1/css/hover-min.css',
  extraHead: '<meta http-equiv="Content-Language"content="zh-cn"/>',
})

const options = ref({
  searchWord: '',
  grade: null,
  group: null,
  page: 1,
  limit: 10,
})
const totalItems = ref(0)

const editDialog = ref(false)
const toDelete = ref(null)
const headers = [
  {
    title: 'الاسم',
    key: 'name',
  },
  {
    title: 'تاريخ الإنشاء',
    key: 'createdAt',
  },
  {
    title: 'العمليات',
    key: 'actions',
    sortable: false,
    width: 80,
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
  await gradeService
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
  useMainStore().handleErr('alert', 'حذف الصف الدراسي', `هل انت متاكد من حذف هذا الصف الدراسي?`, {
    ...item,
    url: 'grades',
  })
  toDelete.value = item
}

onMounted(async () => {
  listItems()
})
</script>
