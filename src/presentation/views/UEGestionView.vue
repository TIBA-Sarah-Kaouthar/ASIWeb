<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

import { UEGestionDAO, type EtudiantNoteRow, type ParcoursLite } from "@/domain/daos/UEGestionDAO";

const route = useRoute();
const router = useRouter();

const ueId = computed(() => Number(route.params.id));

const loading = ref(false);

// UE basic
const numeroUe = ref<string | number>("");
const intitule = ref<string>("");

// Parcours
const allParcours = ref<ParcoursLite[]>([]);
const ueParcoursIds = ref<number[]>([]);
const parcoursToAdd = ref<ParcoursLite[]>([]);
const parcoursToRemove = ref<number[]>([]);

// Étudiants + notes
const rows = ref<EtudiantNoteRow[]>([]);
const noteDraft = ref<Record<number, string>>({});

const loadUE = async () => {
  const ue = await UEGestionDAO.getInstance().getUEBasic(ueId.value);
  numeroUe.value = ue.NumeroUe ?? "";
  intitule.value = ue.Intitule ?? "";
};

const loadParcours = async () => {
  allParcours.value = await UEGestionDAO.getInstance().listAllParcoursLite();
  ueParcoursIds.value = await UEGestionDAO.getInstance().listUEParcoursIds(ueId.value);
};

const loadEtudiantsNotes = async () => {
  rows.value = await UEGestionDAO.getInstance().listEtudiantsNotesForUE(ueId.value);
  noteDraft.value = {};
  rows.value.forEach(r => {
    noteDraft.value[r.ID] = r.note == null ? "" : String(r.note);
  });
};

const reloadAllDependants = async () => {
  // IMPORTANT exercice 10 : après modif des parcours => refresh étudiants/notes
  await loadEtudiantsNotes();
};

const saveUEBasic = async () => {
  try {
    await UEGestionDAO.getInstance().updateUEBasic(ueId.value, {
      Intitule: intitule.value,
      NumeroUe: numeroUe.value,
    });
    Swal.fire("OK", "UE mise à jour", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible de modifier l'UE", "error");
  }
};

const addParcours = async () => {
  try {
    const ids = parcoursToAdd.value.map(p => p.ID);
    if (!ids.length) return;

    await UEGestionDAO.getInstance().addParcoursToUE(ueId.value, ids);
    parcoursToAdd.value = [];

    await loadParcours();
    await reloadAllDependants();

    Swal.fire("OK", "Parcours ajoutés", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible d'ajouter les parcours", "error");
  }
};

const removeParcours = async () => {
  try {
    if (!parcoursToRemove.value.length) return;

    await UEGestionDAO.getInstance().removeParcoursFromUE(ueId.value, parcoursToRemove.value);
    parcoursToRemove.value = [];

    await loadParcours();
    await reloadAllDependants();

    Swal.fire("OK", "Parcours supprimés", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible de supprimer les parcours", "error");
  }
};

const saveNote = async (etudiantId: number) => {
  try {
    const raw = noteDraft.value[etudiantId];
    if (raw === "") {
      await UEGestionDAO.getInstance().upsertNote(ueId.value, etudiantId, null);
      await loadEtudiantsNotes();
      Swal.fire("OK", "Note enregistrée", "success");
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value)) {
      Swal.fire("Erreur", "Note invalide", "error");
      return;
    }

    await UEGestionDAO.getInstance().upsertNote(ueId.value, etudiantId, value);
    await loadEtudiantsNotes();
    Swal.fire("OK", "Note enregistrée", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible d'enregistrer la note", "error");
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    await loadUE();
    await loadParcours();
    await loadEtudiantsNotes();
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container-fluid">
    <div class="card mt-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="m-0">Gestion de l'UE #{{ ueId }}</h4>
        <button class="btn btn-outline-secondary" @click="router.back()">Retour</button>
      </div>

      <div class="card-body" v-if="!loading">
        <h5 class="mb-3">Informations UE</h5>
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Numéro</label>
            <input class="form-control" v-model="numeroUe" />
          </div>
          <div class="col-md-9">
            <label class="form-label">Intitulé</label>
            <input class="form-control" v-model="intitule" />
          </div>
        </div>
        <button class="btn btn-primary mt-3" @click="saveUEBasic">Enregistrer</button>

        <hr class="my-4" />

        <h5 class="mb-3">Parcours liés à cette UE</h5>

        <div class="row g-3 align-items-end">
          <div class="col-md-8">
            <label class="form-label">Ajouter des parcours</label>
            <vSelect
                multiple
                label="NomParcours"
                :options="allParcours"
                v-model="parcoursToAdd"
                :append-to-body="true"
            />
          </div>
          <div class="col-md-4">
            <button class="btn btn-success w-100" @click="addParcours">Ajouter</button>
          </div>
        </div>

        <div class="mt-3">
          <label class="form-label">Supprimer des parcours</label>
          <div class="d-flex flex-wrap gap-2">
            <label v-for="p in allParcours.filter(x => ueParcoursIds.includes(x.ID))" :key="p.ID" class="border rounded px-2 py-1">
              <input class="form-check-input me-2" type="checkbox" :value="p.ID" v-model="parcoursToRemove" />
              {{ p.NomParcours }}
            </label>
          </div>
          <button class="btn btn-danger mt-2" @click="removeParcours">Supprimer sélection</button>
        </div>

        <hr class="my-4" />

        <h5 class="mb-3">Étudiants & Notes</h5>

        <table class="table">
          <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Parcours</th>
            <th style="width: 160px;">Note</th>
            <th style="width: 140px;"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="r in rows" :key="r.ID">
            <td>{{ r.nom }}</td>
            <td>{{ r.prenom }}</td>
            <td>{{ r.email }}</td>
            <td>{{ r.parcoursNom }}</td>
            <td>
              <input
                  class="form-control"
                  v-model="noteDraft[r.ID]"
                  :placeholder="r.note == null ? '__' : String(r.note)"
              />
            </td>
            <td>
              <button class="btn btn-outline-primary" @click="saveNote(r.ID)">
                Enregistrer
              </button>
            </td>
          </tr>

          <tr v-if="rows.length === 0">
            <td colspan="6" class="text-center text-muted">
              Aucun étudiant (ajoute des parcours à l'UE)
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="card-body" v-else>
        Chargement...
      </div>
    </div>
  </div>
</template>
