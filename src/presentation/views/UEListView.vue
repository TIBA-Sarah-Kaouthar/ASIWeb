<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import UEForm from '@/presentation/components/forms/UEForm.vue';
import CustomTable from '@/presentation/components/tables/CustomTable.vue';
import { UE } from '@/domain/entities/UE';
import Swal from 'sweetalert2';
import { UEDAO } from '@/domain/daos/UEDAO';

const router = useRouter();
const UeForm = ref<typeof UEForm | null>(null);
const UE = ref<UE[]>([]);

const formatterEdition = (ue: UE) => {
  return '<i class="bi bi-pen-fill text-primary"></i>';
};

const formatterSuppression = (ue: UE) => {
  return '<i class="bi bi-trash-fill text-danger"></i>';
};

const onUECreated = (newUE: UE) => {
  UE.value.unshift(newUE);
};

const onUEUpdated = (updatedUE: UE) => {
  const index = UE.value.findIndex((u) => u.ID === updatedUE.ID);
  if (index !== -1) {
    UE.value[index] = updatedUE;
  }
};

const onDeleteUE = (ue: UE) => {
  Swal.fire({
    title: 'Êtes-vous sûr de vouloir supprimer cette UE ?',
    showCancelButton: true,
    confirmButtonText: 'Supprimer',
    cancelButtonText: 'Annuler',
  }).then((result) => {
    if (result.isConfirmed) {
      UEDAO.getInstance().delete(ue.ID!).then(() => {
        UE.value = UE.value.filter((u) => u.ID !== ue.ID);
      }).catch(() => {
        Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression de l\'UE', 'error');
      });
    }
  });
};

const columns = [
  {
    field: 'EditionUE',
    label: 'Edition',
    formatter: formatterEdition,
    onClick: (UE: UE) => {
      router.push(`/UE/${UE.ID}`);
    },
    style: 'width: 32px;text-align:center;'
  },
  { field: 'ID', label: 'ID', formatter: null, onClick: null, style: null },
  { field: 'Numero', label: 'Numéro', formatter: null, onClick: null, style: null },
  { field: 'Intitulee', label: 'Intitulé', formatter: null, onClick: null, style: null },
  {
    field: 'DeleteUE',
    label: 'Suppression',
    formatter: formatterSuppression,
    onClick: onDeleteUE,
    style: 'width: 32px;text-align:center;'
  },
];

onMounted(() => {
  UEDAO.getInstance().list().then((data) => {
    UE.value = data;
  }).catch((ex) => {
    Swal.fire('Erreur', ex.message, 'error');
  });
});
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-5">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="card-title">
          <h4>Liste des UEs</h4>
        </div>
        <CustomButton :color="BootstrapButtonEnum.info" @click="() => UEForm?.openForm()">
          Ajouter une UE
        </CustomButton>
      </div>
      <div class="card-body">
        <CustomTable
            idAttribute="ID"
            :columns="columns"
            :data="UE"
        />
      </div>
    </div>
  </div>

  <UEForm
      ref="ueForm"
      @create:ue="onUECreated"
      @update:ue="onUEUpdated"
  />
</template>

