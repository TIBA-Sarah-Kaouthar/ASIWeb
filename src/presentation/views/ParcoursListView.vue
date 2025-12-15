<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import ParcoursForm from '@/presentation/components/forms/ParcoursForm.vue';
import CustomTable from '../components/tables/CustomTable.vue';
import { Parcours } from '@/domain/entities/Parcours';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const parcoursForm = ref<typeof ParcoursForm | null>(null);
const parcours = ref<Parcours[]>([]);
const formatterEdition = (parcours: Parcours) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};
const formatterSuppression = (parcours: Parcours) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};
const columns = [

  { field: 'EditionParcours', label: 'Edition', formatter: formatterEdition, onClick: (p: Parcours) => parcoursForm.value?.openForm(p), style: 'width: 32px;text-align:center;' },

  { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },

  { field: 'NomParcours', label: 'Intitulé', formatter: null, onClick: null, style: null },

  { field: 'AnneeFormation', label: 'Année', formatter: null, onClick: null, style: null },

  { field: 'DeleteParcours', label: 'Suppression', formatter: formatterSuppression, onClick: () => { }, style: 'width: 32px;text-align:center;' },

];
onMounted(() => {

  ParcoursDAO.getInstance().list().then((data) => {

    parcours.value = data;

  });

});
</script>

<template>

  <div class="container-fluid">

    <div class="card mt-5">

      <div class="card-header">

        <div class="card-title">

          <h4>Liste des parcours</h4>

        </div>

        <CustomButton :color="BootstrapButtonEnum.info" @click="() => parcoursForm?.openForm()">

          Ajouter un parcours

        </CustomButton>

      </div>

      <div class="card-body">

        <CustomTable idAttribute="ID" :columns="columns" :data="parcours" />

      </div>

    </div>

  </div>

  <ParcoursForm ref="parcoursForm" :parcours="null" />

</template> 