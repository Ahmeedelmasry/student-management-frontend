<template>
  <v-dialog @after-leave="closeModal" max-width="1200">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 font-weight-bold">
        عرض نتائج الطلاب لامتحان: ( {{ selectedExam.name }} )
      </v-card-title>
      <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
        <v-row class="mb-4 align-center flex-grow-0">
          <v-col cols="12" class="pt-0">
            <v-autocomplete
              :id="Math.random()"
              v-model="options.groupIds"
              :items="selectedExam?.groups || []"
              item-title="name"
              item-value="_id"
              label="المجموعات الخاصة بالامتحان"
              variant="outlined"
              density="compact"
              hide-details
              multiple
              chips
              clearable
              :disabled="!selectedExam?._id"
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
            v-model:page="options.page"
            v-model:items-per-page="options.limit"
            style="height: 60vh"
          >
            <template #item.isAbsent="{ item }">
              <v-chip label class="font-weight-bold" :color="item.isAbsent ? 'red' : 'primary'">
                {{ item.isAbsent ? 'نعم' : 'لا' }}
              </v-chip>
            </template>
            <template #item.scorePercentage="{ item }">
              <v-chip
                label
                :color="getPercentageColor(item.score, item.exam?.maxScore)"
                size="small"
                variant="flat"
              >
                {{ getPercentage(item.score, item.exam?.maxScore) }}%
              </v-chip>
            </template>
            <template #item.maxScore="{ item }">
              <strong>{{ selectedExam.maxScore }}</strong>
            </template>
            <template #item.score="{ item }">
              <div v-if="!item.editMode" class="w-100 d-flex align-center justify-space-between">
                <span>{{ item.score }}</span>
                <v-icon color="primary" size="13" @click="item.editMode = true">mdi-pencil</v-icon>
              </div>
              <div v-else class="d-flex align-center ga-4">
                <v-text-field
                  type="number"
                  :id="Math.random()"
                  v-model.number="item.score"
                  variant="outlined"
                  density="compact"
                  hide-details
                  max-width="200px"
                />
                <v-icon color="red" size="13" @click="item.editMode = false">mdi-close</v-icon>
              </div>
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
          :disabled="isDataValid"
          @click="saveResults"
          v-if="items.length && showSaveBtn"
        >
          حفظ التعديلات
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import examService from '@/services/exam.js'
import { useMainStore } from '@/stores'
import { cloneDeep } from 'lodash'

const items = ref([])
const itemsClone = ref('')

const loading = ref(false)
const saveLoading = ref(false)

const { selectedExam } = defineProps({
  selectedExam: {
    type: Object,
    default: () => ({}),
  },
})

const emits = defineEmits(['leave'])

const headers = [
  { title: 'الطالب', key: 'student.fullName', sortable: false },
  { title: 'المجموعة', key: 'group.name', sortable: false },
  { title: 'الصف', key: 'grade.name', sortable: false },
  { title: 'غائب', key: 'isAbsent', width: '10%', sortable: false },
  { title: 'درجة الطالب', key: 'score', width: '20%', sortable: false },
  { title: 'الدرجة النهائية', key: 'exam.maxScore', width: '15%', sortable: false },
  { title: 'نسبة النجاح', key: 'scorePercentage', width: '15%', sortable: false },
  { title: 'ملاحظات', key: 'notes', sortable: false },
]

const options = ref({
  groupIds: [],
})

// Watchers
watch(
  () => selectedExam,
  (newVal) => {
    if (newVal?._id) {
      listItems()
    }
  },
  { deep: true },
)

watch(
  () => options.value,
  () => {
    listItems()
  },
  { deep: true },
)

// Computed
const isDataValid = computed(() => {
  const invalid = items.value.find(
    (e) => !e.isAbsent && (!e.score || e.score < 0 || e.score > selectedExam.maxScore),
  )

  if (invalid) {
    return true
  }
  return false
})

const showSaveBtn = computed(() => {
  const newItems = cloneDeep(items.value)
  newItems.forEach((e) => delete e.editMode)

  if (JSON.stringify(newItems) != JSON.stringify(itemsClone.value)) {
    return true
  }
  return false
})

// Methods
const getPercentage = (score, maxScore) => {
  if (!maxScore) return 0
  return Math.round((score / maxScore) * 100)
}

const getPercentageColor = (score, maxScore) => {
  const percent = getPercentage(score, maxScore)

  if (percent >= 90) return 'success'
  if (percent >= 75) return 'light-green'
  if (percent >= 60) return 'warning'
  if (percent >= 50) return 'orange'
  return 'red'
}

const closeModal = () => {
  emits('leave')
}

const listItems = async () => {
  loading.value = true
  examService
    .getExamResults(selectedExam._id)
    .then(({ data }) => {
      items.value = data.map((e) => ({ ...e, scoreClone: e.score }))
      itemsClone.value = cloneDeep(items.value)
    })
    .finally(() => {
      loading.value = false
    })
}

const saveResults = async () => {
  const itemsToUpdate = items.value.filter((e) => e.score != e.scoreClone)

  const body = {
    examId: selectedExam._id,
    results: itemsToUpdate.map((item) => ({
      _id: item._id,
      student: item._id || item,
      grade: item.grade._id || item.grade,
      group: item.group._id || item.group,
      score: Number(item.score) || 0,
      isAbsent: !!item.isAbsent,
      notes: item.notes || '',
    })),
  }

  saveLoading.value = true

  await examService
    .updateExamResults(body)
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
