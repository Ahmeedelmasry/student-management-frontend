<template>
  <v-container style="direction: rtl" fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <h2 class="text-h4 font-weight-bold text-grey-darken-3">
          <v-icon color="primary" class="me-2">mdi-chart-bar</v-icon> لوحة التحكم والتقارير الذكية
        </h2>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card border elevation="1" class="pa-4 bg-blue-lighten-5 text-right">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-subtitle-2 text-grey-darken-2 font-weight-bold"
                >إجمالي الطلاب المسجلين</span
              >
              <h3 class="text-h3 font-weight-bold text-blue-darken-3 mt-1">1,250</h3>
            </div>
            <v-icon color="blue-darken-2" size="48">mdi-account-group</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card border elevation="1" class="pa-4 bg-teal-lighten-5 text-right">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-subtitle-2 text-grey-darken-2 font-weight-bold"
                >نسبة الالتزام والحضور</span
              >
              <h3 class="text-h3 font-weight-bold text-teal-darken-3 mt-1">94%</h3>
            </div>
            <v-icon color="teal-darken-2" size="48">mdi-calendar-check</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card border elevation="1" class="pa-4 bg-green-lighten-5 text-right">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-subtitle-2 text-grey-darken-2 font-weight-bold"
                >تحصيلات الشهر الحالي</span
              >
              <h3 class="text-h3 font-weight-bold text-green-darken-3 mt-1">
                45,000 <span class="text-caption">ج.م</span>
              </h3>
            </div>
            <v-icon color="green-darken-2" size="48">mdi-cash-multiple</v-icon>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card border elevation="1" class="pa-4 bg-red-lighten-5 text-right">
          <div class="d-flex justify-space-between align-center">
            <div>
              <span class="text-subtitle-2 text-grey-darken-2 font-weight-bold"
                >حالات الإنذار والمتابعة</span
              >
              <h3 class="text-h3 font-weight-bold text-red-darken-3 mt-1">12</h3>
            </div>
            <v-icon color="red-darken-2" size="48">mdi-alert-octagon</v-icon>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="7">
        <v-card border class="pa-4">
          <v-card-title class="text-subtitle-1 font-weight-bold text-grey-darken-3 px-0 mb-2">
            📈 متوسط درجات الطلاب في الامتحانات الشاملة (المنحنى العام)
          </v-card-title>
          <apexchart
            type="line"
            height="300"
            :options="lineChartOptions"
            :series="lineChartSeries"
          ></apexchart>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card border class="pa-4">
          <v-card-title class="text-subtitle-1 font-weight-bold text-grey-darken-3 px-0 mb-2">
            📊 مقارنة الإيرادات المحصلة شهرياً
          </v-card-title>
          <apexchart
            type="bar"
            height="300"
            :options="barChartOptions"
            :series="barChartSeries"
          ></apexchart>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card border>
          <v-card-title
            class="bg-amber-lighten-5 text-amber-darken-4 font-weight-bold text-subtitle-1 d-flex align-center"
          >
            <v-icon class="me-2">mdi-trophy</v-icon> لوحة شرف أوائل الطلاب (آخر امتحان شامل)
          </v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-right font-weight-bold">اسم الطالب</th>
                <th class="text-center font-weight-bold">الصف / المجموعة</th>
                <th class="text-center font-weight-bold">الدرجة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in topStudents" :key="student.id">
                <td class="text-right font-weight-medium text-blue-darken-3">{{ student.name }}</td>
                <td class="text-center text-caption">
                  {{ student.grade }} <br />
                  ({{ student.group }})
                </td>
                <td class="text-center">
                  <v-chip color="amber-darken-3" variant="flat" size="small" font-weight-bold
                    >{{ student.score }} / 20</v-chip
                  >
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card border>
          <v-card-title
            class="bg-red-lighten-5 text-red-darken-4 font-weight-bold text-subtitle-1 d-flex align-center"
          >
            <v-icon class="me-2">mdi-account-alert</v-icon> إنذار غياب متكرر (غائب حِصتين متتاليتين)
          </v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-right font-weight-bold">اسم الطالب</th>
                <th class="text-center font-weight-bold">رقم ولي الأمر</th>
                <th class="text-center font-weight-bold">حالة المتابعة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in absentStudents" :key="student.id">
                <td class="text-right font-weight-medium text-red-darken-2">{{ student.name }}</td>
                <td class="text-center font-mono">{{ student.phone }}</td>
                <td class="text-center">
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="x-small"
                    prepend-icon="mdi-phone-outgoing"
                    @click="callParent(student)"
                  >
                    اتصال الآن
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
// استيراد ApexCharts المتوافق مع Vue 3
import apexchart from 'vue3-apexcharts'

// --- بيانات الرسم البياني الأول: منحنى أداء الامتحانات ---
const lineChartSeries = ref([{ name: 'متوسط درجات الطلاب', data: [12, 14, 13, 16.5, 15, 18] }])
const lineChartOptions = ref({
  chart: { id: 'exams-line', fontFamily: 'Cairo, sans-serif', toolbar: { show: false } },
  colors: ['#1976D2'],
  stroke: { curve: 'smooth', width: 4 },
  xaxis: {
    categories: [
      'امتحان 1',
      'امتحان 2',
      'امتحان 3',
      'امتحان 4',
      'امتحان الشامل',
      'امتحان المراجعة',
    ],
  },
  grid: { borderColor: '#e7e7e7', row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
})

// --- بيانات الرسم البياني الثاني: مقارنة الإيرادات شهرياً ---
const barChartSeries = ref([{ name: 'الإيرادات بالجنيه', data: [25000, 32000, 29000, 45000] }])
const barChartOptions = ref({
  chart: { id: 'revenue-bar', fontFamily: 'Cairo, sans-serif', toolbar: { show: false } },
  colors: ['#4CAF50'],
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%', distributed: false } },
  xaxis: { categories: ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير'] },
})

// --- داتا جدول لوحة الشرف (الأوائل) ---
const topStudents = ref([
  { id: 1, name: 'محمد صبري عبد الحميد', grade: 'الصف الأول ثانوي', group: '9 صباحاً', score: 20 },
  { id: 2, name: 'رانيا أحمد الحسيني', grade: 'الصف الأول ثانوي', group: '9 صباحاً', score: 19.5 },
  { id: 3, name: 'عبد الله محمود كريم', grade: 'الصف الثاني ثانوي', group: '10 صباحاً', score: 19 },
])

// --- داتا جدول إنذار الغياب المتكرر ---
const absentStudents = ref([
  {
    id: 101,
    name: 'حازم مصطفى نور الدين',
    phone: '01012345678',
    grade: 'الصف الأول ثانوي',
    group: '9 صباحاً',
  },
  {
    id: 102,
    name: 'ميادة رأفت البدري',
    phone: '01298765432',
    grade: 'الصف الثاني ثانوي',
    group: '10 صباحاً',
  },
])

const callParent = (student) => {
  alert(`جاري محاكاة الاتصال بولي أمر الطالب: ${student.name} على الرقم: ${student.phone}`)
}
</script>

<style scoped>
/* خط متناسق مع التشارطات العربي */
:deep(.apexcharts-canvas) {
  direction: ltr !important; /* التشارطات من اليسار لليمين برمجياً لضبط المحاور */
}
.font-mono {
  font-family: monospace;
}
</style>
