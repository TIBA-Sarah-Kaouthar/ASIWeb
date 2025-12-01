<script setup lang="ts">
import { ref, onBeforeMount, defineExpose, defineProps, toRaw } from 'vue';
import { BootstrapButtonEnum } from '@/types/BootstrapButtonEnum';
import { Parcours } from '@/domain/entities/Parcours';
import CustomInput from '@/presentation/components/forms/components/CustomInput.vue';
import CustomButton from '@/presentation/components/forms/components/CustomButton.vue';
import { ParcoursDAO } from '@/domain/daos/ParcoursDAO';

const currentParcours = ref<Parcours>(new Parcours(null, null, null));
const isOpen = ref(false);

const openForm = (parcours: Parcours | null = null) => {
  isOpen.value = true;

  if (parcours) {
    currentParcours.value = structuredClone(toRaw(parcours));
  }
};

const closeForm = () => {
  isOpen.value = false;
  currentParcours.value = new Parcours(null, null, null);
};

const props = defineProps({
  parcours: {
    type: Object as () => Parcours | null,
    required: false,
    default: null,
  },
});
const saveParcours = () => {
  if (currentParcours.value.ID) {
    // Mise à jour d'un parcours (tu feras plus tard)
  } else {
    ParcoursDAO.getInstance()
        .create(currentParcours.value)
        .then(() => {
          alert('Parcours créé avec succès');
          closeForm();
        })
        .catch((ex) => {
          alert(ex.message);
        });
  }
};


onBeforeMount(() => {
  if (props.parcours) {
    currentParcours.value = props.parcours;
  }
});

defineExpose({
  openForm,
  closeForm,
});
</script>
<template>
  <div v-if="isOpen" class="custom-modal">
    <div class="card new-parcours">
      <div class="card-header" style="background: #273656">
        <template v-if="parcours && parcours.ID"> Modification du parcours </template>
        <template v-else> Nouveau parcours </template>
      </div>
      <div class="card-body">
        <div class="card-text mt-1 mb-1">
          <form>
            <CustomInput id="intitule" libelle="Intitulé" type="text" placeholder="Intitulé du parcours" />
            <CustomInput class="mt-2" id="annee" libelle="Année" type="number"
                         placeholder="Année de formation" />
          </form>
        </div>
        <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.danger"
                      @click="closeForm">
          Annuler
        </CustomButton>
        <CustomButton class="mt-1" style="margin-left: 5px" :color="BootstrapButtonEnum.primary" @click="saveParcours">
          Enregistrer
        </CustomButton>
      </div>
    </div>
  </div>
</template>
<style scoped>
.custom-modal {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(87, 86, 86, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.custom-modal .card {
  width: 250px;
}

.card-header {
  background: #273656;
  color: white;
  text-align: left;
}

.card-text {
  text-align: left;
}
</style> 