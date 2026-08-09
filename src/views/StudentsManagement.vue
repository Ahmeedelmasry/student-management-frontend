<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="mb-4 align-center flex-grow-0">
      <v-col cols="12" md="6" class="py-0">
        <h2 class="text-h4 font-weight-bold text-auto">
          <v-icon class="text-auto me-2">mdi-account-multiple</v-icon>
          ادارة الطلاب
        </h2>
      </v-col>
      <v-col cols="12" md="6" class="py-0 text-end">
        <v-btn color="primary" @click="editDialog = true"> تسجيل طالب جديد </v-btn>
      </v-col>
    </v-row>
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3" class="pt-0">
            <v-text-field
              :id="Math.random()"
              v-model="options.searchWord"
              label="بحث"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3" class="pt-0">
            <v-autocomplete
              :id="Math.random()"
              v-model="options.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="options.group = null"
            />
          </v-col>

          <v-col cols="12" md="3" class="pt-0">
            <v-autocomplete
              :id="Math.random()"
              v-model="options.group"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعة"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              :disabled="!options.grade"
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
        :items-per-page-options="perPage"
      >
        <template #item.createdAt="{ item }">
          {{ moment(item.createdAt).format('YYYY/MM/DD') }}
        </template>

        <template #item.registrationDate="{ item }">
          {{ moment(item.registrationDate).format('YYYY/MM/DD') }}
        </template>

        <template #item.barcode="{ item, index }">
          <div v-if="!item.editMode" class="d-flex justify-space-between align-center">
            <span>{{ item.barcode }}</span>
            <v-icon size="13" color="info" @click="editStudentBarcode(item, index)"
              >mdi-pencil</v-icon
            >
          </div>
          <div v-else class="d-flex justify-space-between align-center ga-2">
            <v-text-field
              :id="`student-barcode-${index}`"
              v-model="item.barcode"
              variant="outlined"
              density="compact"
              hide-details
              @keydown.enter.prevent="updateItem(item)"
              style="min-width: 150px"
            />

            <v-icon size="13" color="error" @click="item.editMode = !item.editMode"
              >mdi-close</v-icon
            >
            <v-icon size="13" color="primary" @click="updateItem(item)">mdi-content-save</v-icon>
          </div>
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
import { ref, onMounted, watch, computed } from 'vue'

import studentService from '@/services/student.js'
import gradeService from '@/services/grade.js'
import moment from 'moment'
import { useMainStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/auth'
import CreateItemDialog from '@/components/students/CreateItem.vue'

const { regetData } = storeToRefs(useMainStore())
const { loggerData } = storeToRefs(useAuthStore())

const items = ref([])
const grades = ref([])

const loading = ref(false)

const editDialog = ref(false)
const perPage = ref([10, 50, 100, 1000, 2000])
const toDelete = ref(null)
const headers = [
  {
    title: 'الاسم',
    key: 'fullName',
  },
  {
    title: 'الباركود',
    key: 'barcode',
  },
  {
    title: 'رقم الهاتف',
    key: 'studentPhone',
  },
  {
    title: 'رقم ولي الأمر',
    key: 'parentPhone',
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
    title: 'ملاحظات',
    key: 'notes',
  },
  {
    title: 'تاريخ التسجيل',
    key: 'registrationDate',
  },
  {
    title: 'تاريخ الانشاء',
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

const options = ref({
  searchWord: '',
  grade: null,
  group: null,
  page: 1,
  limit: 10,
})

const totalItems = ref(0)

const relatedGroups = computed(() => {
  const gradeId = options.value.grade
  if (gradeId) {
    return grades.value.find((e) => e._id == gradeId)?.groups || []
  }
  return []
})

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

// Methods
const updateItem = async (item) => {
  const body = {
    ...item,
    registrationDate: new Date(item.registrationDate).setHours(23, 59, 0),
  }

  await studentService
    .update(body, body._id)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      listItems()
      item.editMode = false
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
}

const editStudentBarcode = (item, index) => {
  item.editMode = !item.editMode
  setTimeout(() => {
    const field = document.querySelector(`#student-barcode-${index}`)
    if (field) {
      field.focus()
    }
  }, 100)
}

const listItems = async () => {
  loading.value = true

  studentService
    .list({
      ...options.value,
    })
    .then(({ data }) => {
      items.value = data.docs
      totalItems.value = data.totalDocs
    })
    .finally(() => {
      loading.value = false
    })
}

const getGrades = () => {
  gradeService
    .list({
      limit: 1000,
    })
    .then(({ data }) => {
      grades.value = data.docs
    })
}

const openEditDialog = (item) => {
  toUpdate.value = { ...item }

  editDialog.value = true
}

const openDeleteDialog = (item) => {
  useMainStore().handleErr('alert', 'حذف الطالب', `هل انت متاكد من حذف هذا الطالب?`, {
    ...item,
    url: 'students',
  })
  toDelete.value = item
}

onMounted(async () => {
  listItems()
  getGrades()
})
</script>
