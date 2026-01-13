<script setup lang="ts">
console.log("EtudiantForm chargé");

import { ref, onBeforeMount, defineExpose, defineProps, watch, toRaw } from "vue";
import Swal from "sweetalert2";

import { BootstrapButtonEnum } from "@/types/BootstrapButtonEnum";
import CustomInput from "@/presentation/components/forms/components/CustomInput.vue";
import CustomButton from "@/presentation/components/forms/components/CustomButton.vue";
import CustomModal from "@/presentation/components/modals/CustomModal.vue";

import { Etudiant } from "@/domain/entities/Etudiant";
import { EtudiantDAO } from "@/domain/daos/EtudiantDAO";
import { ParcoursDAO } from "@/domain/daos/ParcoursDAO";
import type { Parcours } from "@/domain/entities/Parcours";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

const currentEtudiant = ref<Etudiant>(
    new Etudiant(null, null, null, null, null)
);
const isOpen = ref(false);

const parcoursOptions = ref<Parcours[]>([]);

const formErrors = ref({
  nom: null as string | null,
  prenom: null as string | null,
  email: null as string | null,
  parcours: null as string | null,
});

const props = defineProps({
  etudiant: {
    type: Object as () => Etudiant | null,
    required: false,
    default: null,
  },
});

const emit = defineEmits<{
  (e: "create:etudiant", etudiant: Etudiant): void;
  (e: "update:etudiant", etudiant: Etudiant): void;
}>();


const openForm = (etudiant: Etudiant | null = null) => {
  isOpen.value = true;

  if (etudiant) {
    // Créer une instance Etudiant qu'on va passer dans ce formulaire
    currentEtudiant.value = new Etudiant(
        etudiant.ID,
        etudiant.Nom,
        etudiant.Prenom,
        etudiant.Email,
        etudiant.Parcours
    );
  } else {
    currentEtudiant.value = new Etudiant(null, null, null, null, null);
  }
};

const closeForm = () => {
  isOpen.value = false;
  currentEtudiant.value = new Etudiant(null, null, null, null, null);
  formErrors.value = { nom: null, prenom: null, email: null, parcours: null };
};

const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const saveEtudiant = async () => {
  if (
      formErrors.value.nom ||
      formErrors.value.prenom ||
      formErrors.value.email
  )
    return;

  // Exercice 9 : 1 étudiant = 1 parcours
  if (!currentEtudiant.value.Parcours?.ID) {
    formErrors.value.parcours = "Veuillez sélectionner un parcours";
    return;
  }

  try {
    if (currentEtudiant.value.ID) {
      const updated = await EtudiantDAO.getInstance().update(
          currentEtudiant.value.ID,
          currentEtudiant.value
      );
      emit("update:etudiant", updated);
      Swal.fire("OK", "Étudiant mis à jour", "success");
    } else {
      const created = await EtudiantDAO.getInstance().create(
          currentEtudiant.value
      );
      emit("create:etudiant", created);
      Swal.fire("OK", "Étudiant créé", "success");
    }
    closeForm();
  } catch (e: any) {
    console.error("BACKEND ERROR:", e?.response?.data ?? e);
    Swal.fire("Erreur", "Impossible d'enregistrer l'étudiant", "error");
  }
};


onBeforeMount(async () => {
  parcoursOptions.value = await ParcoursDAO.getInstance().list();
  console.log("parcoursOptions =", parcoursOptions.value);
  if (props.etudiant) openForm(props.etudiant);
});


watch(() => props.etudiant, (v) => {
  if (v) openForm(v);
});

watch(() => currentEtudiant.value.Nom, () => {
  const v = currentEtudiant.value.Nom ?? "";
  formErrors.value.nom =
      v.trim().length < 3
          ? "Le nom doit contenir au moins 3 caractères"
          : null;
});

watch(() => currentEtudiant.value.Prenom, () => {
  const v = currentEtudiant.value.Prenom ?? "";
  formErrors.value.prenom =
      v.trim().length < 3
          ? "Le prénom doit contenir au moins 3 caractères"
          : null;
});

watch(() => currentEtudiant.value.Email, () => {
  const v = currentEtudiant.value.Email ?? "";
  formErrors.value.email =
      v && !isValidEmail(v) ? "Email invalide" : null;
});

watch(() => currentEtudiant.value.Parcours, () => {
  formErrors.value.parcours =
      currentEtudiant.value.Parcours?.ID ? null : "Parcours requis";
});


defineExpose({ openForm, closeForm });
</script>

<template>
  <CustomModal :isOpen="isOpen">
    <template #title>
      <span v-if="currentEtudiant.ID">Modifier un étudiant</span>
      <span v-else>Ajouter un étudiant</span>
    </template>

    <template #body>
      <form @submit.prevent="saveEtudiant">
        <CustomInput
            v-model="currentEtudiant.Nom"
            id="nom"
            libelle="Nom"
            placeholder="Nom de l'étudiant"
            :error="formErrors.nom"
        />

        <CustomInput
            v-model="currentEtudiant.Prenom"
            id="prenom"
            libelle="Prénom"
            placeholder="Prénom de l'étudiant"
            :error="formErrors.prenom"
        />

        <CustomInput
            v-model="currentEtudiant.Email"
            id="email"
            libelle="Email"
            type="email"
            placeholder="Email"
            :error="formErrors.email"
        />

        <div class="form-group mt-2">
          <label>Parcours</label>
          
          <vSelect
              v-model="currentEtudiant.Parcours"
              :options="parcoursOptions"
              label="NomParcours"
              :append-to-body="true"
          />

          <div v-if="formErrors.parcours" class="invalid-feedback d-block">
            {{ formErrors.parcours }}
          </div>
        </div>

        <div class="mt-3 d-flex justify-content-end">
          <CustomButton
              class="me-2"
              :color="BootstrapButtonEnum.danger"
              @click="closeForm"
          >
            Annuler
          </CustomButton>

          <CustomButton
              type="submit"
              :color="BootstrapButtonEnum.primary"
          >
            Enregistrer
          </CustomButton>
        </div>
      </form>
    </template>
  </CustomModal>
</template>
