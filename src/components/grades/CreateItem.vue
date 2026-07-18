<template>
  <v-dialog width="500" @after-leave="closeModal">
    <v-card class="pa-4">
      <v-card-title class="text-h6">
        {{ toUpdate._id ? 'تعديل بيانات الصف' : 'انشاء صف جديد' }}
      </v-card-title>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
:id="Math.random()"
              density="compact"
              v-model="item.name"
              label="اسم الصف الدراسي"
              variant="outlined"
              :error-messages="v$.name.$errors.map((e) => e.$message)"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="px-5">
        <v-spacer />

        <v-btn color="grey" variant="text" @click="closeModal"> إلغاء </v-btn>

        <v-btn
          color="primary"
          :loading="loading"
          @click="toUpdate._id ? updateItem() : createItem()"
        >
          حفظ التعديلات
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import gradeService from '@/services/grade.js'
import { useMainStore } from '@/stores'

// Props
const { toUpdate } = defineProps({
  toUpdate: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emits = defineEmits('leave', 'refreshTableData')

// Watchers
watch(
  () => toUpdate,
  (newVal) => {
    if (newVal._id) {
      for (const val of Object.entries(item.value)) {
        item.value[val[0]] = toUpdate[val[0]]
      }
    }
  },
)

const item = ref({
  name: null,
})

const loading = ref(false)

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage('هذا الحقل مطلوب', required),
    },
  }
})

const v$ = useVuelidate(rules, item)

// Methods
const closeModal = () => {
  item.value = {
    name: null,
  }
  emits('leave')
  setTimeout(() => {
    v$.value.$reset()
  }, 100)
}

const createItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true

  gradeService
    .create(item.value)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      emits('refreshTableData')
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => {
      loading.value = false
    })
}

const updateItem = async () => {
  if (!(await v$.value.$validate())) return

  loading.value = true
  const body = { ...item.value }

  if (!item.password) delete body.password

  await gradeService
    .update(body, toUpdate._id)
    .then(({ data }) => {
      useMainStore().callResponse(true, data.message, 1)
      emits('refreshTableData')
      closeModal()
    })
    .catch((err) => {
      useMainStore().callResponse(true, err.response?.data?.message || 'حدث خطأ ما', 2)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>
