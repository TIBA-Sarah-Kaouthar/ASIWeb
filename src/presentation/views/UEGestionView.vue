/* Ce fichier c'est pour la gestion de l'exercice 10
affiche les etudiants, les notes, les parcours lié a une UE (+ modification)
modifier les notes
Passe par UEGestionDap pour faire les appel au backend HTTP
 */
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

const numeroUe = ref<string | number>("");
const intitule = ref<string>("");

const allParcours = ref<ParcoursLite[]>([]);
const ueParcoursIds = ref<number[]>([]);
const parcoursToAdd = ref<ParcoursLite[]>([]);

const rows = ref<EtudiantNoteRow[]>([]);
const noteDraft = ref<Record<number, string>>({});


/* je m'occupe ici de ce que je veux afficher les colonnes avec parcours et leurs listes...etc*/
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
  rows.value.forEach((r) => {
    noteDraft.value[r.ID] = r.note == null ? "" : String(r.note);
  });
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
    const ids = parcoursToAdd.value
        .map((p) => p.ID)
        .filter((id): id is number => typeof id === "number");

    if (!ids.length) return;

    await UEGestionDAO.getInstance().addParcoursToUE(ueId.value, ids);
    parcoursToAdd.value = [];

    await loadParcours();
    await loadEtudiantsNotes();

    Swal.fire("OK", "Parcours ajoutés", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible d'ajouter les parcours", "error");
  }
};

const removeOneParcours = async (parcoursId: number) => {
  try {
    await UEGestionDAO.getInstance().removeParcoursFromUE(ueId.value, [parcoursId]);
    await loadParcours();
    await loadEtudiantsNotes();
    Swal.fire("OK", "Parcours supprimé", "success");
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible de supprimer le parcours", "error");
  }
};

const saveNote = async (etudiantId: number) => {
  try {
    const raw = noteDraft.value[etudiantId]?.trim() ?? "";

    if (raw === "") {
      await UEGestionDAO.getInstance().upsertNote(ueId.value, etudiantId, null);
      await loadEtudiantsNotes();
      return;
    }

    const value = Number(raw);
    if (Number.isNaN(value) || value < 0 || value > 20) {
      Swal.fire("Erreur", "Note invalide (0 à 20)", "error");
      return;
    }

    await UEGestionDAO.getInstance().upsertNote(ueId.value, etudiantId, value);
    await loadEtudiantsNotes();
  } catch (e: any) {
    Swal.fire("Erreur", e?.message ?? "Impossible d'enregistrer la note", "error");
  }
};

const parcoursLinked = computed(() => {
  const set = new Set(ueParcoursIds.value);
  return allParcours.value.filter((p) => set.has(p.ID));
});

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
  <div class="ue-gestion container-fluid py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="m-0">Gestion de l'UE #{{ ueId }}</h3>
      <button class="btn btn-outline-secondary" @click="router.back()">Retour</button>
    </div>

    <div v-if="loading" class="card p-4">Chargement...</div>

    <div v-else class="grid">
      <div class="left">
        <div class="panel">
          <div class="panel-title">Informations UE</div>

          <div class="form-row">
            <div class="field">
              <label>Numéro :</label>
              <input class="form-control" v-model="numeroUe" />
            </div>
            <div class="field flex1">
              <label>Intitulé :</label>
              <input class="form-control" v-model="intitule" />
            </div>
            <div class="actions">
              <button class="btn btn-info" @click="saveUEBasic">Enregistrer</button>
            </div>
          </div>
        </div>

        <div class="panel mt-3">
          <div class="panel-title">Notes</div>

          <div class="list" v-if="rows.length">
            <div class="row-item" v-for="r in rows" :key="r.ID">
              <div class="name">
                <div class="line1">{{ r.nom }} {{ r.prenom }}</div>
                <div class="line2">{{ r.email }}</div>
              </div>

              <div class="note">
                <input
                    class="note-input"
                    v-model="noteDraft[r.ID]"
                    :placeholder="r.note == null ? '__' : String(r.note)"
                    @blur="saveNote(r.ID)"
                />
                <span class="sur">/ 20</span>
              </div>
            </div>
          </div>

          <div v-else class="text-muted p-2">
            Aucun étudiant (ajoute des parcours à l'UE)
          </div>
        </div>
      </div>

      <div class="right">
        <div class="panel">
          <div class="panel-title d-flex justify-content-between align-items-center">
            <span>Parcours</span>
            <button class="btn btn-sm btn-success" @click="addParcours">+</button>
          </div>

          <div class="mt-2">
            <vSelect
                multiple
                label="NomParcours"
                :options="allParcours"
                v-model="parcoursToAdd"
                :append-to-body="true"
                placeholder="Ajouter des parcours..."
            />
          </div>

          <div class="list mt-3">
            <div class="row-item" v-for="p in parcoursLinked" :key="p.ID">
              <div class="name">
                <div class="line1">{{ p.NomParcours }}</div>
              </div>
              <button class="btn btn-sm btn-danger" @click="removeOneParcours(p.ID)">-</button>
            </div>

            <div v-if="parcoursLinked.length === 0" class="text-muted p-2">
              Aucun parcours lié
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ue-gestion {
  background: #f6f7f9;
  min-height: 100vh;
}

.grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
}

.panel {
  background: #fff;
  border: 1px solid #e6e7eb;
  border-radius: 10px;
  padding: 16px;
}

.panel-title {
  font-weight: 700;
  font-size: 20px;
  margin-bottom: 12px;
}

.form-row {
  display: flex;
  gap: 14px;
  align-items: end;
  flex-wrap: wrap;
}

.field {
  min-width: 220px;
}

.field.flex1 {
  flex: 1;
  min-width: 320px;
}

.actions {
  min-width: 140px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f1f2f4;
  border-radius: 6px;
  padding: 8px 10px;
}

.name .line1 {
  font-weight: 600;
}

.name .line2 {
  font-size: 12px;
  color: #6b7280;
}

.note {
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-input {
  width: 72px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #cfd3da;
  padding: 0 8px;
  text-align: right;
  background: #fff;
}

.sur {
  font-weight: 600;
  color: #111827;
}
</style>
