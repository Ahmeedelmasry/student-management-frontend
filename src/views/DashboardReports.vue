<template>
  <v-container fluid class="pa-5" style="direction: rtl">
    <v-row class="mb-4 align-center">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold">
          <v-icon color="primary" class="me-2"> mdi-view-dashboard </v-icon>

          لوحة التحكم
        </h2>
      </v-col>
    </v-row>

    <!-- ========================= -->
    <!-- Filters -->
    <!-- ========================= -->

    <v-card class="mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="options.grade"
              :items="grades"
              item-title="name"
              item-value="_id"
              label="الصف"
              density="comfortable"
              variant="outlined"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="options.group"
              :items="relatedGroups"
              item-title="name"
              item-value="_id"
              label="المجموعة"
              density="comfortable"
              variant="outlined"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="options.exam"
              :items="relatedExams"
              item-title="name"
              item-value="_id"
              label="الامتحان"
              density="comfortable"
              variant="outlined"
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="options.period"
              :items="periods"
              item-title="title"
              item-value="value"
              label="الفترة"
              density="comfortable"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- ========================= -->
    <!-- Cards -->
    <!-- ========================= -->

    <v-row>
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-overline">عدد الطلاب</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalStudents }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="indigo">
          <v-card-text>
            <div class="text-overline">عدد المجموعات</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalGroups }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="green">
          <v-card-text>
            <div class="text-overline">الحصص</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalAttendanceSessions }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="orange">
          <v-card-text>
            <div class="text-overline">سجلات الحضور</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalAttendanceRecords }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="deep-purple">
          <v-card-text>
            <div class="text-overline">الامتحانات</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalExams }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="cyan">
          <v-card-text>
            <div class="text-overline">النتائج</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.totalExamResults }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="success">
          <v-card-text>
            <div class="text-overline">المدفوع</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.paidPaymentsAmount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card color="red">
          <v-card-text>
            <div class="text-overline">غير المدفوع</div>

            <div class="text-h3 font-weight-bold">
              {{ dashboard.cards.unpaidPaymentsAmount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <!-- ========================= -->
    <!-- Charts -->
    <!-- ========================= -->

    <v-row class="mt-4">
      <!-- Students Per Grade -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> الطلاب حسب الصف </v-card-title>

          <v-card-text>
            <apexchart
              height="350"
              type="bar"
              :options="studentsPerGradeOptions"
              :series="studentsPerGradeSeries"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Students Per Group -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> الطلاب حسب المجموعة </v-card-title>

          <v-card-text>
            <apexchart
              height="350"
              type="bar"
              :options="studentsPerGroupOptions"
              :series="studentsPerGroupSeries"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <!-- Attendance -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> إحصائيات الحضور </v-card-title>

          <v-card-text>
            <apexchart
              height="350"
              type="donut"
              :options="attendanceOptions"
              :series="attendanceSeries"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Exams -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> نتائج الامتحانات </v-card-title>

          <v-card-text>
            <apexchart type="donut" height="350" :options="examOptions" :series="examSeries" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ========================= -->
    <!-- Tables -->
    <!-- ========================= -->

    <v-row class="mt-4">
      <!-- Latest Students -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> أحدث الطلاب </v-card-title>

          <v-data-table
            :headers="latestStudentsHeaders"
            :items="dashboard.tables.latestStudents"
            density="compact"
            items-per-page="5"
          />
        </v-card>
      </v-col>

      <!-- Top Students -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> أوائل الطلاب </v-card-title>

          <v-data-table
            :headers="topStudentsHeaders"
            :items="dashboard.tables.topStudents"
            density="compact"
            items-per-page="5"
          >
            <template #item.average="{ item }">
              <v-chip color="success" size="small">
                {{ item.average }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Latest Payments -->

      <v-col cols="12">
        <v-card>
          <v-card-title class="font-weight-bold"> آخر المدفوعات </v-card-title>

          <v-data-table
            :headers="paymentsHeaders"
            :items="dashboard.tables.latestPayments"
            density="compact"
            items-per-page="5"
          />
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <!-- Today Sessions -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> حصص اليوم </v-card-title>

          <v-list>
            <div v-if="dashboard.tables.todaySessions.length">
              <v-list-item v-for="item in dashboard.tables.todaySessions" :key="item._id">
                <v-list-item-title>
                  {{ item.group.name }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ item.grade.name }}
                </v-list-item-subtitle>
              </v-list-item>
            </div>

            <v-alert v-else type="error" variant="tonal"> لم يتم انشاء حصص اليوم </v-alert>
          </v-list>
        </v-card>
      </v-col>

      <!-- Alerts -->

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="font-weight-bold"> التنبيهات </v-card-title>

          <v-list>
            <v-alert
              v-for="alert in dashboard.alerts"
              :key="alert.title"
              :type="alert.color"
              variant="tonal"
              class="mb-2"
            >
              {{ alert.title }}
            </v-alert>

            <v-alert v-if="dashboard.alerts.length === 0" type="success" variant="tonal">
              لا يوجد تنبيهات 🎉
            </v-alert>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment'

import reportService from '@/services/report'
import gradeService from '@/services/grade'
import examService from '@/services/exam'

/* ============================================
    Data
============================================ */

const loading = ref(false)

const dashboard = ref({
  cards: {},
  attendance: {},
  payments: {},
  exams: {},

  charts: {
    studentsPerGrade: [],
    studentsPerGroup: [],
    attendanceChart: [],
    examChart: [],
    paymentsByMonth: [],
  },

  tables: {
    latestPayments: [],
    latestStudents: [],
    topStudents: [],
    mostAbsentStudents: [],
    todaySessions: [],
  },

  alerts: [],
})

const grades = ref([])
const exams = ref([])

/* ============================================
    Filters
============================================ */

const options = ref({
  grade: null,
  group: null,
  exam: null,
  period: 'thisMonth',
})

const periods = [
  {
    title: 'اليوم',
    value: 'today',
  },
  {
    title: 'هذا الأسبوع',
    value: 'thisWeek',
  },
  {
    title: 'هذا الشهر',
    value: 'thisMonth',
  },
  {
    title: 'هذه السنة',
    value: 'thisYear',
  },
]

/* ============================================
    Computed
============================================ */

const relatedGroups = computed(() => {
  if (!options.value.grade) return []

  return grades.value.find((e) => e._id === options.value.grade)?.groups || []
})

const relatedExams = computed(() => {
  if (!options.value.grade) return exams.value

  return exams.value.filter((e) => e.grade._id === options.value.grade)
})

/* ============================================
    Table Headers
============================================ */

const latestStudentsHeaders = [
  {
    title: 'الطالب',
    key: 'fullName',
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
    title: 'تاريخ التسجيل',
    key: 'createdAt',
  },
]

const topStudentsHeaders = [
  {
    title: 'الطالب',
    key: 'name',
  },
  {
    title: 'الباركود',
    key: 'barcode',
  },
  {
    title: 'عدد الامتحانات',
    key: 'exams',
  },
  {
    title: 'المتوسط',
    key: 'average',
  },
]

const paymentsHeaders = [
  {
    title: 'الطالب',
    key: 'student.fullName',
  },
  {
    title: 'المبلغ',
    key: 'amount',
  },
  {
    title: 'النوع',
    key: 'type',
  },
  {
    title: 'التاريخ',
    key: 'paymentDate',
  },
]

/* ============================================
    Charts
============================================ */

const studentsPerGradeSeries = computed(() => [
  {
    name: 'عدد الطلاب',
    data: dashboard.value.charts.studentsPerGrade.map((e) => e.value),
  },
])

const studentsPerGradeOptions = computed(() => ({
  chart: {
    toolbar: {
      show: false,
    },
  },

  xaxis: {
    categories: dashboard.value.charts.studentsPerGrade.map((e) => e.label),
  },

  dataLabels: {
    enabled: true,
  },
}))

const studentsPerGroupSeries = computed(() => [
  {
    name: 'عدد الطلاب',
    data: dashboard.value.charts.studentsPerGroup.map((e) => e.value),
  },
])

const studentsPerGroupOptions = computed(() => ({
  chart: {
    toolbar: {
      show: false,
    },
  },

  xaxis: {
    categories: dashboard.value.charts.studentsPerGroup.map((e) => e.label),
  },

  dataLabels: {
    enabled: true,
  },
}))

/* ============================================
    Donut Charts
============================================ */

const attendanceSeries = computed(() => dashboard.value.charts.attendanceChart.map((e) => e.value))

const attendanceOptions = computed(() => ({
  labels: dashboard.value.charts.attendanceChart.map((e) => e.label),

  legend: {
    position: 'bottom',
  },

  chart: {
    toolbar: {
      show: false,
    },
  },

  dataLabels: {
    enabled: true,
  },
}))

const examSeries = computed(() => dashboard.value.charts.examChart.map((e) => e.value))

const examOptions = computed(() => ({
  chart: {
    type: 'donut',
    toolbar: {
      show: false,
    },
  },

  labels: dashboard.value.charts.examChart.map((e) => e.label),

  legend: {
    position: 'bottom',
  },

  dataLabels: {
    enabled: true,
  },

  stroke: {
    width: 1,
  },

  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
}))

/* ============================================
    API
============================================ */

const getDashboard = async () => {
  try {
    loading.value = true

    const { data } = await reportService.getDashboard({
      ...options.value,
    })

    dashboard.value = data
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const getGrades = async () => {
  try {
    const { data } = await gradeService.list({
      limit: 1000,
    })

    grades.value = data.docs
  } catch (err) {
    console.log(err)
  }
}

const getExams = async () => {
  try {
    const { data } = await examService.list({
      limit: 1000,
    })

    exams.value = data.docs
  } catch (err) {
    console.log(err)
  }
}

/* ============================================
    Watchers
============================================ */

watch(
  () => options.value.grade,
  () => {
    options.value.group = null
    options.value.exam = null
  },
)

watch(
  () => options.value,
  () => {
    getDashboard()
  },
  {
    deep: true,
  },
)

/* ============================================
    Formatters
============================================ */

const formatMoney = (value) => {
  return new Intl.NumberFormat('ar-EG').format(value || 0)
}

const formatDate = (value) => {
  if (!value) return '-'

  return moment(value).format('YYYY/MM/DD')
}

/* ============================================
    Mounted
============================================ */

onMounted(async () => {
  await Promise.all([getGrades(), getExams()])

  getDashboard()
})
</script>
