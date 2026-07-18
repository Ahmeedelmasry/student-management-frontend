<template>
  <div class="sign_in_page pa-0 my-5 pt-6 px-16" style="height: 94dvh !important">
    <v-container
      fluid
      style="box-shadow: rgba(0, 0, 0, 0.15) 0px 0.5rem 1rem; border-radius: 10px; overflow: hidden"
      class="py-0 h-100 pl-0 pr-10"
    >
      <v-row class="pa-0 h-100">
        <v-col cols="12" md="6">
          <SigninFields />
        </v-col>
        <v-col cols="12" md="6" class="pa-0 pe-0 pb-0 d-none d-md-block h-100">
          <SigninImg />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import SigninImg from '@/components/signin/Image.vue'
import SigninFields from '@/components/signin/Fields.vue'
</script>
