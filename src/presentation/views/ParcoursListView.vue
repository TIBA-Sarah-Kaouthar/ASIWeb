<script setup lang="ts">
import { ref } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';

const parcoursForm = ref<typeof ParcoursForm | null>(null);
</script>

<template>
  <div class="container-fluid">
    <CustomButton :color="BootstrapButtonEnum.info" @click="() => parcoursForm?.openForm()">
      Ajouter un parcours
    </CustomButton>
    <ParcoursForm ref="parcoursForm" :parcours="null" />
  </div>
</template>