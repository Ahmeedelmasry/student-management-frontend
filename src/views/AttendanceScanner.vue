<template>
  <v-container class="fill-height justify-center" style="direction: rtl">
    <v-card width="100%" class="pa-6 text-center" elevation="4" rounded="lg">
      <v-icon size="64" color="primary" class="mb-4">mdi-barcode-scan</v-icon>
      <v-card-title class="text-h5 font-weight-bold justify-center"
        >سیستم تسجيل الحضور الذكي 🛡️</v-card-title
      >
      <v-card-subtitle class="mb-6">يرجى تمرير باركود الطالب أمام السكنر</v-card-subtitle>

      <v-text-field
        :id="Math.random()"
        ref="barcodeInput"
        v-model="barcodeText"
        @keyup.enter="handleBarcodeScan"
        label="اضغط هنا وجرب اسحب بالباركود..."
        variant="outlined"
        prepend-inner-icon="mdi-qrcode"
        color="primary"
        auto-focus
        clearable
        hide-details
        class="mb-4"
      ></v-text-field>

      <v-btn prepend-icon="mdi-target" color="secondary" variant="text" @click="focusInput">
        إعادة تركيز السكنر
      </v-btn>

      <v-expand-transition>
        <v-alert
          :type="scanResult?.status"
          variant="tonal"
          class="mt-6 text-right"
          border="start"
          elevation="2"
          v-if="scanResult?.status != 'error' && scanResult?.message"
        >
          <template #title>
            <div class="text-h6 font-weight-bold">{{ scanResult?.message }}</div>
          </template>
          <v-table class="mt-10 attendence-table" v-if="scanResult?.status == 'success'">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الصف</th>
                <th>المجموعة</th>
                <th>رقم الهاتف</th>
                <th>هاتف ولي الامر</th>
                <th>مذكرات غير مدفوعة</th>
                <th>شهور غير مدفوعة</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ scanResult?.student?.name }}</td>
                <td>{{ scanResult?.student?.gradeName }}</td>
                <td>{{ scanResult?.student?.groupName }}</td>
                <td>{{ scanResult?.student?.studentPhone }}</td>
                <td>{{ scanResult?.student?.parentPhone }}</td>
                <td style="width: 200px">
                  <div class="d-flex flex-wrap ga-2 py-1">
                    <v-chip
                      label
                      density="compact"
                      v-for="note in scanResult?.student?.unpaidNotes || []"
                      :key="note.id"
                      color="red"
                      class="font-weight-bold"
                    >
                      <span>{{ note.title }}</span>
                      &nbsp; : &nbsp;
                      <span>{{ note.price }} جـ</span>
                    </v-chip>
                  </div>
                </td>
                <td style="width: 200px">
                  <div class="d-flex flex-wrap ga-2 py-1">
                    <v-chip
                      label
                      density="compact"
                      v-for="month in scanResult?.student?.unpaidMonths || []"
                      :key="month.id"
                      color="red"
                      class="font-weight-bold"
                    >
                      <span>{{ month.title }}</span>
                      &nbsp; : &nbsp;
                      <span>{{ month.monthlyPrice }} جـ</span>
                    </v-chip>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-alert>
      </v-expand-transition>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import studentService from '@/services/student' // استدعاء السيرفس التي أنشأناها
import { useMainStore } from '@/stores'

const barcodeText = ref('')
const barcodeInput = ref(null)
const scanResult = ref(null)

// دالة التركيز على حقل الإدخال
const focusInput = () => {
  if (barcodeInput.value) barcodeInput.value.focus()
}

// معالجة مسح الباركود
const handleBarcodeScan = async () => {
  const code = barcodeText.value.trim()
  if (!code) return

  try {
    // الاتصال بالـ Backend باستخدام السيرفس
    const response = await studentService.scanAttendance(code)
    const student = response.data

    // عرض بيانات الطالب بنجاح
    scanResult.value = {
      status: 'success',
      message: 'تم تسجيل الحضور بنجاح',
      ...student,
    }
  } catch (error) {
    // معالجة الخطأ إذا لم يتم العثور على الطالب أو خطأ في السيرفر
    scanResult.value = {
      status: 'error',
      message: '',
    }
    useMainStorere().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
  }

  // تنظيف الحقل والعودة للتركيز عليه
  barcodeText.value = ''
  focusInput()
}

onMounted(() => {
  focusInput()
})
</script>

<style lang="scss">
.attendence-table {
  th {
    font-weight: 900;
  }
  td {
    font-weight: 700;
  }
}
</style>
