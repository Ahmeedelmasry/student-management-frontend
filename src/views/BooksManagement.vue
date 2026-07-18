<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-account-multiple-plus</v-icon>
          ادارة المذكرات
        </h2>
      </v-col>
      <v-col cols="6" class="text-end">
        <v-btn color="primary" @click="editDialog = true">انشاء مذكرة جديدة</v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              hide-details
              :id="Math.random()"
              v-model="options.searchWord"
              label="بحث بالاسم او الكود"
              variant="outlined"
              density="compact"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
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
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              hide-details
              :id="Math.random()"
              v-model="options.type"
              :items="bookTypes"
              label="النوع"
              variant="outlined"
              density="compact"
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
        <template #item.type="{ item }">
          {{
            {
              Book: 'مذكرة',
              Revision: 'مراجعة',
              Booklet: 'بوكليت',
            }[item.type]
          }}
        </template>

        <template #item.price="{ item }"> {{ item.price }} ج.م </template>

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

import bookService from '@/services/book.js'
import gradeService from '@/services/grade.js'
import moment from 'moment'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth'
import CreateItemDialog from '@/components/books/CreateItem.vue'

const { regetData } = storeToRefs(useMainStore())
const { loggerData } = storeToRefs(useAuthStore())

const items = ref([])

const loading = ref(false)

const options = ref({
  searchWord: '',
  grade: null,
  type: null,
  isActive: null,
  page: 1,
  limit: 10,
})

const grades = ref([])

const bookTypes = [
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
]

const totalItems = ref(0)

const editDialog = ref(false)
const toDelete = ref(null)
const headers = [
  {
    title: 'الاسم',
    key: 'name',
  },
  {
    title: 'كود المذكرة',
    key: 'code',
  },
  {
    title: 'الصف',
    key: 'grade.name',
  },
  {
    title: 'النوع',
    key: 'type',
  },
  {
    title: 'السعر',
    key: 'price',
  },
  {
    title: 'تاريخ الإنشاء',
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

const getGrades = () => {
  gradeService
    .list({
      limit: 1000,
    })
    .then(({ data }) => {
      grades.value = data.docs
    })
}

const listItems = async () => {
  await bookService
    .list({ ...options.value })
    .then(({ data }) => {
      items.value = data.docs
    })
    .catch((err) => console.log(err))
}

const openEditDialog = (item) => {
  toUpdate.value = { ...item }

  editDialog.value = true
}

const openDeleteDialog = (item) => {
  useMainStore().handleErr('alert', 'حذف المذكرة', `هل انت متاكد من حذف هذا المذكرة?`, {
    ...item,
    url: 'books',
  })
  toDelete.value = item
}

onMounted(async () => {
  listItems()
  getGrades()
})
</script>
