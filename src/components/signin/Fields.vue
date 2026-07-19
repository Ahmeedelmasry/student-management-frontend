<template>
  <div
    class="login_fields w-100"
    :style="`display: flex;
      align-items: center;
      height: 100%;
      ${smAndDown ? 'min-height: 95dvh;' : ''}`"
  >
    <v-form class="w-100" @submit.prevent="signIn">
      <v-row>
        <v-col cols="12" class="ps-7 pe-10">
          <h2 style="font-weight: 700">تسجيل دخول</h2>
        </v-col>
        <v-col cols="12" class="pb-0">
          <div class="field_container">
            <div class="input_parent position-relative login_input">
              <v-text-field
:id="Math.random()"
                label="اسم المستخدم"
                rounded="lg"
                v-model="formData.userName"
                variant="outlined"
                :error="$v.userName.$error"
                :errorMessages="$v.userName.$errors[0]?.$message"
                prependInnerIcon="mdi-at"
              ></v-text-field>
            </div>
          </div>
        </v-col>
        <v-col cols="12">
          <div class="field_container">
            <div class="input_parent position-relative login_input">
              <v-text-field
:id="Math.random()"
                label="كلمة السر"
                rounded="lg"
                v-model="formData.password"
                variant="outlined"
                :type="showPassword ? 'text' : 'password'"
                :error="$v.password.$error"
                :errorMessages="$v.password.$errors[0]?.$message"
                prependInnerIcon="mdi-lock-outline"
                :appendInnerIcon="`mdi-${showPassword ? 'eye-off' : 'eye'}-outline`"
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>
            </div>
          </div>
        </v-col>
        <v-col cols="12" class="pt-0">
          <v-btn width="100%" color="orange-darken-2" height="45" :loading="loading" type="submit"
            >تسجيل دخول</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { ref } from 'vue'

// Validator
import useVuelidator from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.js'

// Init Store
const loginStore = useAuthStore()

// Init Router
const router = useRouter()

const { smAndDown } = useDisplay()

// Data
const formData = ref({
  userName: '',
  password: '',
})

const { loggerData, token } = storeToRefs(loginStore)

const roles = ref({
  userName: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },
  password: {
    required: helpers.withMessage('هذا الحقل مطلوب', required),
  },
})

const loading = ref(false)
const showPassword = ref(false)

// Methods
let $v = useVuelidator(roles, formData)

const signIn = async () => {
  const res = await $v.value.$validate()
  if (res) {
    loading.value = true
    const result = await loginStore.doLogin(formData.value)
    if (result) {
      $cookies.set('logger', token.value, loggerData.value.expFront)

      await router.push({ name: 'ScanAttendance' })
    }
    loading.value = false
  }
}
</script>
