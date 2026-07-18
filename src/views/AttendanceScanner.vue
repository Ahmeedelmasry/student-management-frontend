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
                    <div
                      v-for="(note, i) in scanResult?.student?.unpaidNotes || []"
                      :key="note.id"
                      class="d-flex align-center ga-2 justify-space-between w-100 py-1"
                    >
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

                      <v-btn
                        density="compact"
                        flat
                        color="primary"
                        style="font-size: 12px"
                        @click="openConfirmDialog(note, 'Book', i)"
                        >دفع</v-btn
                      >
                    </div>
                  </div>
                </td>
                <td style="width: 200px">
                  <div class="d-flex flex-wrap ga-2 py-1">
                    <div
                      v-for="(month, i) in scanResult?.student?.unpaidMonths || []"
                      :key="month.id"
                      class="d-flex align-center ga-2 justify-space-between w-100 py-1"
                    >
                      <v-chip label density="compact" color="red" class="font-weight-bold">
                        <span>{{ month.title }}</span>
                        &nbsp; : &nbsp;
                        <span>{{ month.monthlyPrice }} جـ</span>
                      </v-chip>
                      <v-btn
                        density="compact"
                        flat
                        color="primary"
                        style="font-size: 12px"
                        @click="openConfirmDialog(month, 'Subscription', i)"
                        >دفع</v-btn
                      >
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-alert>
      </v-expand-transition>
    </v-card>
    <v-dialog v-model="confirmationDialog" max-width="500">
      <v-card class="card text-center pt-3 pb-7 px-4">
        <div class="text-center mb-2">
          <v-icon size="70" class="global_icon" color="orange">mdi-alert</v-icon>
        </div>
        <h3 :style="`white-space: nowrap; font-size: 22px; color: orange`" class="mb-2">
          {{ confimationTitle }}
        </h3>
        <p style="font-size: 19px; color: rgb(138, 138, 138)" class="my-1">
          {{ confimationMsg }}
        </p>
        <div class="text-center d-flex justify-center align-center" style="gap: 10px">
          <v-btn
            class="mt-5"
            width="100"
            color="orange-darken-2"
            style="height: 44px; text-transform: capitalize; font-size: 16px; letter-spacing: 0px"
            elevation="0"
            :loading="payLoading"
            @click="payNow"
            >تاكيد الدفع</v-btn
          >
          <v-btn
            class="mt-5"
            width="100"
            color="red"
            @click="confirmationDialog = false"
            style="height: 44px; text-transform: capitalize; font-size: 16px; letter-spacing: 0px"
            elevation="0"
            >الغاء</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import studentService from '@/services/student'
import paymentService from '@/services/payment'
import { useMainStore } from '@/stores/index.js'

const barcodeText = ref('')
const confimationMsg = ref('')
const confimationTitle = ref('')
const barcodeInput = ref(null)
const payLoading = ref(false)
const confirmationDialog = ref(false)
const scanResult = ref(null)
const itemToPay = ref(null)

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

const openConfirmDialog = (item, type, index) => {
  console.log(item)
  itemToPay.value = {
    ...item,
    index,
    type,
    student: scanResult.value.student._id,
    group: scanResult.value.student.groupId,
    grade: scanResult.value.student.gradeId,
    amount: type == 'Book' ? item.price : item.monthlyPrice,
    book: type == 'Book' ? item.id : null,
  }
  confimationTitle.value = `دفع ${type == 'Book' ? 'مذكرة' : 'شهر'} ${item.title}`
  confimationMsg.value = `هل انت متاكد من دفع ${type == 'Book' ? '' : 'شهر'}  ${item.title}?`
  confirmationDialog.value = true
}

const payNow = async () => {
  payLoading.value = true
  paymentService
    .create(itemToPay.value)
    .then(({ data }) => {
      if (itemToPay.value.type == 'Book') {
        scanResult.value.student.unpaidNotes.splice(itemToPay.value.index, 1)
      } else {
        scanResult.value.student.unpaidMonths.splice(itemToPay.value.index, 1)
      }
      useMainStore().callResponse(true, data.message, 1)
      confirmationDialog.value = false
    })
    .catch((err) => {
      console.log(err)
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => {
      payLoading.value = false
    })
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
