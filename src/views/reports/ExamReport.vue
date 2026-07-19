<template>
  <v-container style="direction: rtl" fluid class="d-flex flex-column h-100">
    <v-row class="align-center flex-grow-0">
      <v-col cols="6">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-account-multiple-plus</v-icon>
          تقرير الامتحانات
        </h2>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col>
            <v-autocomplete
              :id="Math.random()"
              v-model="options.examId"
              :items="exams"
              item-title="name"
              item-value="_id"
              label="الامتحان"
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
              :disabled="!options.examId"
            />
          </v-col>

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
            <v-text-field
              :id="Math.random()"
              v-model.number="options.score"
              label="الدرجة"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col>
            <v-select
              :id="Math.random()"
              v-model="options.scoreOperator"
              :items="scoreOptions"
              item-title="title"
              item-value="value"
              label="المقارنة"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>

          <v-col v-if="options.scoreOperator === 'between'">
            <v-text-field
              :id="Math.random()"
              v-model.number="options.scoreTo"
              label="إلى درجة"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- items Table -->
    <v-card class="flex-grow-1">
      <!-- Summary Cards -->
      <v-row class="pb-0 pt-2 my-0 px-2">
        <v-col cols="12" class="pb-0">
          <v-alert v-if="exam._id" color="primary" variant="tonal" class="mb-4">
            <div class="d-flex justify-space-between flex-wrap">
              <div>
                <strong>الامتحان: {{ exam.name }}</strong>
              </div>

              <div>
                <strong>الصف: {{ exam.grade.name }}</strong>
              </div>

              <div>
                <strong>الدرجة النهائية: {{ exam.maxScore }}</strong>
              </div>

              <div>
                <strong>المدة: {{ exam.duration }} دقيقة</strong>
              </div>
            </div>
          </v-alert>
        </v-col>
      </v-row>
      <v-row class="pb-5 pt-0 px-2 mt-0" v-if="items.length">
        <v-col>
          <v-card color="primary" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>عدد الطلاب</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.totalStudents }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col>
          <v-card color="green" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>تم التصحيح</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.correctedStudents }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col>
          <v-card color="orange" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>لم يتم التصحيح</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.notCorrectedStudents }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col>
          <v-card color="red" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>الغياب</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.absentStudents }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col>
          <v-card color="error" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>عدد الراسبين</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.failedCount }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col>
          <v-card color="teal" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>عدد الناجحين</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.successCount }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <!-- <v-col >
          <v-card color="teal" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>متوسط الدرجات</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{ summary.averageScore }} / {{ exam.maxScore }}
              </div>
            </v-card-title>
          </v-card>
        </v-col>

        <v-col >
          <v-card color="purple" variant="tonal" class="font-weight-bold">
            <v-card-title class="text-center pt-4" style="font-size: 18px">
              <div>نسبة النجاح</div>

              <div class="font-weight-bold" style="font-size: 18px">
                {{
                  summary.correctedStudents
                    ? Math.round((summary.successCount / summary.correctedStudents) * 100)
                    : 0
                }}%
              </div>
            </v-card-title>
          </v-card>
        </v-col> -->
      </v-row>

      <v-data-table-server
        :headers="headers"
        :items="items"
        :loading="loading"
        item-value="_id"
        class="elevation-0"
        v-model:page="options.page"
        v-model:items-per-page="options.limit"
        :items-length="totalItems"
      >
        <template #item.percentage="{ item }">
          <v-chip label :color="item.examStatus.color" class="font-weight-bold">
            {{ item.percentage }}%
          </v-chip>
        </template>

        <template #item.notes="{ item }">
          {{ item.notes || '—' }}
        </template>

        <template #item.rank="{ item }">
          <v-chip label v-if="item.rank" color="primary" size="small" class="font-weight-bold">
            {{ item.rank }}
          </v-chip>

          <span v-else>--</span>
        </template>

        <template #item.score="{ item }">
          <v-chip color="blue" variant="tonal" size="small" class="font-weight-bold" label>
            {{ item.score }} / {{ item.maxScore }}
          </v-chip>
        </template>

        <template #item.examStatus="{ item }">
          <v-chip label :color="item.examStatus.color" size="small" class="font-weight-bold">
            {{ item.examStatus.title }}
          </v-chip>
        </template>

        <template #item.correctedAt="{ item }">
          {{ item.correctedAt ? moment(item.correctedAt).format('YYYY/MM/DD') : '...' }}
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
import examService from '@/services/exam'
import moment from 'moment'
import AttendanceDetails from '@/components/reports/AttendanceDetails.vue'

const items = ref([])
const exams = ref([])

const loading = ref(false)
const toPreview = ref({})
const previewDetailsDialog = ref(false)

const options = ref({
  examId: null,
  searchWord: '',
  group: null,
  score: null,
  scoreOperator: 'eq',
  scoreTo: null,
  page: 1,
  limit: 10,
})

const summary = ref({
  totalStudents: 0,
  correctedStudents: 0,
  absentStudents: 0,
  notCorrectedStudents: 0,
  averageScore: 0,
  successCount: 0,
  failedCount: 0,
})

const exam = ref({
  maxScore: 0,
})

const totalItems = ref(0)

const scoreOptions = ref([
  {
    title: 'يساوي',
    value: 'eq',
  },
  {
    title: 'اكبر من',
    value: 'gt',
  },
  {
    title: 'اصغر من',
    value: 'lt',
  },
  {
    title: 'بين رقمين',
    value: 'between',
  },
])

const headers = [
  {
    title: 'الترتيب',
    key: 'rank',
  },
  {
    title: 'الطالب',
    key: 'student.fullName',
  },
  {
    title: 'الباركود',
    key: 'student.barcode',
  },
  {
    title: 'رقم الطالب',
    key: 'student.studentPhone',
  },
  {
    title: 'رقم ولي الأمر',
    key: 'student.parentPhone',
  },
  {
    title: 'المجموعة',
    key: 'group.name',
  },
  {
    title: 'الدرجة',
    key: 'score',
  },
  {
    title: 'النسبة',
    key: 'percentage',
  },
  {
    title: 'الحالة',
    key: 'examStatus',
  },
  {
    title: 'تاريخ التصحيح',
    key: 'correctedAt',
  },
  {
    title: 'ملاحظات',
    key: 'notes',
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
  (newVal) => {
    if (newVal.examId) {
      listItems()
    } else {
      items.value = []
    }
  },
  { deep: true },
)

const relatedGroups = computed(() => {
  if (!options.value.examId) return []

  return exams.value.find((e) => e._id == options.value.examId)?.groups || []
})

const listItems = async () => {
  loading.value = true

  await reportService
    .getExamsReport(options.value.examId, { ...options.value })
    .then(({ data }) => {
      items.value = data.docs
      totalItems.value = data.totalDocs
      summary.value = data.summary
      exam.value = data.exam
    })
    .catch((err) => console.log(err))

  loading.value = false
}

const getExams = async () => {
  await examService
    .list({ limit: 10000 })
    .then(({ data }) => {
      exams.value = data.docs
    })
    .catch((err) => console.log(err))
}

onMounted(async () => {
  getExams()
})
</script>
