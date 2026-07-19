<template>
  <v-dialog @after-leave="closeModal" max-width="1200">
    <v-card class="pa-4 px-2">
      <v-card-title class="text-h6 font-weight-bold">
        تسجيل درجات الطلاب لامتحان: ( {{ selectedExam.name }} )
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
              <v-checkbox
                v-model="item.isAbsent"
                hide-details
                :ripple="false"
                density="compact"
                color="primary"
                @update:model-value="
                  (val) => {
                    if (val) item.score = 0
                  }
                "
              />
            </template>
            <template #item.maxScore="{ item }">
              <strong>{{ selectedExam.maxScore }}</strong>
            </template>
            <template #item.score="{ item }">
              <v-text-field
                type="number"
                :id="Math.random()"
                v-model="item.score"
                variant="outlined"
                density="compact"
                hide-details
                max-width="200px"
              />
            </template>
            <template #item.notes="{ item }">
              <v-text-field
                :id="Math.random()"
                v-model="item.notes"
                variant="outlined"
                density="compact"
                hide-details
              />
            </template>

            <template #bottom></template>
          </v-data-table-server>
        </v-card>
      </v-container>
      <v-card-actions>
        <v-spacer />

        <v-btn color="red" :disabled="saveLoading" @click="closeModal"> الغاء </v-btn>
        <v-btn
          color="primary"
          :loading="saveLoading"
          :disabled="isDataValid"
          @click="saveResults"
          v-if="items.length"
        >
          حفظ الدرجات
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import examService from '@/services/exam.js'
import { useMainStore } from '@/stores'

const items = ref([])

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
  { title: 'الطالب', key: 'fullName', sortable: false },
  { title: 'المجموعة', key: 'group.name', sortable: false },
  { title: 'غائب', key: 'isAbsent', width: '10%', sortable: false },
  { title: 'درجة الطالب', key: 'score', width: '20%', sortable: false },
  { title: 'الدرجة النهائية', key: 'maxScore', width: '15%', sortable: false },
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

// Methods
const closeModal = () => {
  emits('leave')
}

const listItems = async () => {
  loading.value = true

  examService
    .getExamStudents(selectedExam._id, {
      groupIds: options.value.groupIds.join(','),
    })
    .then(({ data }) => {
      items.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

const saveResults = async () => {
  saveLoading.value = true

  const body = {
    examId: selectedExam._id,
    results: items.value.map((item) => ({
      student: item._id || item,
      grade: item.grade._id || item.grade,
      group: item.group._id || item.group,
      score: Number(item.score) || 0,
      isAbsent: !!item.isAbsent,
      notes: item.notes || '',
    })),
  }

  await examService
    .saveExamResults(body)
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
