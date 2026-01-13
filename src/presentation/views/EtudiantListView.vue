<script setup lang="ts">
console.log("EtudiantsView chargé");

import { ref, onMounted } from "vue";
import Swal from "sweetalert2";

import { BootstrapButtonEnum } from "@/types/BootstrapButtonEnum";
import CustomButton from "@/presentation/components/forms/components/CustomButton.vue";
import CustomTable from "@/presentation/components/tables/CustomTable.vue";

import EtudiantForm from "@/presentation/components/forms/EtudiantForm.vue";
import { Etudiant } from "@/domain/entities/Etudiant";
import { EtudiantDAO } from "@/domain/daos/EtudiantDAO";
import { ParcoursDAO } from "@/domain/daos/ParcoursDAO";

const etudiantsForm = ref<InstanceType<typeof EtudiantForm> | null>(null);
const etudiantsList = ref<Etudiant[]>([]);

const openCreate = () => {
  etudiantsForm.value?.openForm();
};

const formatterEdition = () => '<i class="bi bi-pen-fill text-primary"></i>';
const formatterSuppression = () => '<i class="bi bi-trash-fill text-danger"></i>';
const formatterParcours = (e: any) => e?.Parcours?.NomParcours ?? "";

/**
 * ✅ Mapping API -> Entité FRONT (on garde TON Etudiant.ts)
 * API peut renvoyer: id/ID, nom/Nom, prenom/Prenom, email/Email, parcours_id, Parcours
 */
const mapApiEtudiantToEntity = (e: any, parcoursById: Map<number, string>) => {
  const id = e?.ID ?? e?.id ?? null;
  const nom = e?.Nom ?? e?.nom ?? null;
  const prenom = e?.Prenom ?? e?.prenom ?? null;
  const email = e?.Email ?? e?.email ?? null;

  const parcoursId =
      e?.parcours_id ?? e?.ParcoursID ?? e?.ParcoursId ?? (typeof e?.Parcours === "number" ? e.Parcours : null);

  const parcoursObj =
      parcoursId != null
          ? { ID: parcoursId, NomParcours: parcoursById.get(parcoursId) ?? "" }
          : (typeof e?.Parcours === "object" ? e.Parcours : null);

  return new Etudiant(id, nom, prenom, email, parcoursObj);
};

const loadEtudiants = async () => {
  // 1) Charger parcours
  const parcoursList = await ParcoursDAO.getInstance().list();
  const parcoursById = new Map<number, string>();

  parcoursList.forEach((p: any) => {
    if (p?.ID != null && p?.NomParcours != null) {
      parcoursById.set(p.ID, p.NomParcours);
    }
  });

  // 2) Charger étudiants
  const etudiantsApi: any[] = await EtudiantDAO.getInstance().list();

  // 3) Mapper API -> Entité front
  etudiantsList.value = etudiantsApi.map((e: any) =>
      mapApiEtudiantToEntity(e, parcoursById)
  );
};

const onEtudiantCreated = async () => {
  // ✅ simple & fiable
  await loadEtudiants();
};

const onEtudiantUpdated = async () => {
  // ✅ simple & fiable
  await loadEtudiants();
};

const onDeleteEtudiant = (e: Etudiant) => {
  Swal.fire({
    title: "Êtes-vous sûr de vouloir supprimer cet étudiant ?",
    showCancelButton: true,
    confirmButtonText: "Supprimer",
    cancelButtonText: "Annuler",
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      if (!e.ID) throw new Error("ID étudiant introuvable");
      await EtudiantDAO.getInstance().delete(e.ID);
      await loadEtudiants();
      Swal.fire("Supprimé", "Étudiant supprimé", "success");
    } catch (err: any) {
      console.error(err);
      Swal.fire("Erreur", err?.message ?? "Suppression impossible", "error");
    }
  });
};

const columns = [
  {
    field: "EditionEtudiant",
    label: "Édition",
    formatter: formatterEdition,
    onClick: (e: Etudiant) => etudiantsForm.value?.openForm(e),
    style: "width: 32px;text-align:center;",
  },
  { field: "ID", label: "ID", formatter: null, onClick: null, style: null },

  // ✅ On garde la logique de TON entité (classe): Nom/Prenom/Email/Parcours
  { field: "Nom", label: "Nom", formatter: null, onClick: null, style: null },
  { field: "Prenom", label: "Prénom", formatter: null, onClick: null, style: null },
  { field: "Email", label: "Email", formatter: null, onClick: null, style: null },
  { field: "Parcours", label: "Parcours", formatter: formatterParcours, onClick: null, style: null },

  {
    field: "DeleteEtudiant",
    label: "Suppression",
    formatter: formatterSuppression,
    onClick: onDeleteEtudiant,
    style: "width: 32px;text-align:center;",
  },
];

onMounted(async () => {
  try {
    await loadEtudiants();
  } catch (e: any) {
    console.error("load etudiants erreur", e);
    Swal.fire("Erreur", e?.message ?? "Impossible de charger", "error");
  }
});
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-5">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div class="card-title">
          <h4>Liste des Étudiants</h4>
        </div>

        <CustomButton :color="BootstrapButtonEnum.info" @click="openCreate">
          Ajouter un étudiant
        </CustomButton>
      </div>

      <div class="card-body">
        <CustomTable idAttribute="ID" :columns="columns" :data="etudiantsList" />
      </div>
    </div>

    <EtudiantForm
        ref="etudiantsForm"
        @create:etudiant="onEtudiantCreated"
        @update:etudiant="onEtudiantUpdated"
    />
  </div>
</template>