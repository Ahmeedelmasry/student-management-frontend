<template>
  <v-dialog @after-leave="closeModal" max-width="1200">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 font-weight-bold">
        تسليم ( {{ item.name }} ) للطلاب
      </v-card-title>
      <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
        <v-row class="mb-4 align-center flex-grow-0">
          <v-col cols="12" md="6" class="pt-0">
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
          <v-col cols="12" md="6" class="pt-0">
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
        </v-row>

        <!-- items Table -->
        <v-card class="flex-grow-1">
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
            <template #bottom></template>
          </v-data-table-server>
        </v-card>
      </v-container>
      <v-card-actions>
        <v-spacer />

        <v-btn color="red" :disabled="saveLoading" @click="closeModal"> اغلاق </v-btn>
        <v-btn
          color="primary"
          :loading="saveLoading"
          :disabled="!selectedRows.length"
          @click="saveData"
        >
          تاكيد التسليم
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
import moment from 'moment'

const items = ref([])
const groups = ref([])
const selectedRows = ref([])

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
]

const options = ref({
  groupIds: [],
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

const saveData = async () => {
  await bookAssignService
    .bulkAssignStudents(item._id, selectedRows.value)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => (saveLoading.value = false))
}
</script>
