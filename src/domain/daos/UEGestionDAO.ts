import { UEDAO } from "@/domain/daos/UEDAO";
import { ParcoursDAO } from "@/domain/daos/ParcoursDAO";
import { EtudiantDAO } from "@/domain/daos/EtudiantDAO";

import type { UE } from "@/domain/entities/UE";
import type { Parcours } from "@/domain/entities/Parcours";
import type { Etudiant } from "@/domain/entities/Etudiant";

export type UEBasic = {
    ID: number;
    Intitule: string | null;
    NumeroUe: string | number | null;
};

export type ParcoursLite = {
    ID: number;
    NomParcours: string;
};

export type EtudiantNoteRow = {
    ID: number; // etudiant id
    nom: string | null;
    prenom: string | null;
    email: string | null;
    parcoursNom: string | null;
    note: number | null;
};

export class UEGestionDAO {
    private static instance: UEGestionDAO;
    private constructor() {}

    public static getInstance(): UEGestionDAO {
        if (!UEGestionDAO.instance) UEGestionDAO.instance = new UEGestionDAO();
        return UEGestionDAO.instance;
    }

    // ---------- LocalStorage keys ----------
    private parcoursKey(ueId: number) {
        return `ue:${ueId}:parcours_ids`;
    }
    private notesKey(ueId: number) {
        return `ue:${ueId}:notes`;
    }

    // ---------- Helpers ----------
    private readNumberArray(key: string): number[] {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "number") : [];
        } catch {
            return [];
        }
    }

    private writeNumberArray(key: string, values: number[]) {
        localStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
    }

    private readNotesMap(ueId: number): Record<number, number | null> {
        try {
            const raw = localStorage.getItem(this.notesKey(ueId));
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    private writeNotesMap(ueId: number, map: Record<number, number | null>) {
        localStorage.setItem(this.notesKey(ueId), JSON.stringify(map));
    }

    // ---------- UE basic ----------
    public async getUEBasic(ueId: number): Promise<UEBasic> {
        // pas besoin de backend spécifique : on prend la liste existante et on trouve l'UE
        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;

        if (!ue) {
            throw new Error("UE introuvable");
        }

        return {
            ID: ue.ID,
            Intitule: ue.Intitule ?? null,
            NumeroUe: ue.NumeroUe ?? ue.Numero ?? ue.numero ?? null,
        };
    }

    public async updateUEBasic(ueId: number, payload: { Intitule: string; NumeroUe: string | number }): Promise<void> {
        // on réutilise ton update existant => modification minime
        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;
        if (!ue) throw new Error("UE introuvable");

        ue.Intitule = payload.Intitule;
        ue.NumeroUe = payload.NumeroUe;

        await UEDAO.getInstance().update(ueId, ue);
    }

    // ---------- Parcours liés à l'UE (local) ----------
    public async listAllParcoursLite(): Promise<ParcoursLite[]> {
        const parcours = await ParcoursDAO.getInstance().list();
        return (parcours as any[]).map((p: any) => ({
            ID: p.ID,
            NomParcours: p.NomParcours ?? p.nom ?? "",
        }));
    }

    public async listUEParcoursIds(ueId: number): Promise<number[]> {
        // 1) on lit localStorage
        const stored = this.readNumberArray(this.parcoursKey(ueId));
        if (stored.length) return stored;

        // 2) sinon on essaye de prendre ce que l'UE a déjà (si ton backend renvoie ue.Parcours)
        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;
        if (ue?.Parcours && Array.isArray(ue.Parcours)) {
            const ids = ue.Parcours.map((p: any) => p.ID).filter((x: any) => typeof x === "number");
            this.writeNumberArray(this.parcoursKey(ueId), ids);
            return ids;
        }

        return [];
    }

    public async addParcoursToUE(ueId: number, parcoursIds: number[]): Promise<void> {
        const current = await this.listUEParcoursIds(ueId);
        this.writeNumberArray(this.parcoursKey(ueId), [...current, ...parcoursIds]);
    }

    public async removeParcoursFromUE(ueId: number, parcoursIds: number[]): Promise<void> {
        const current = await this.listUEParcoursIds(ueId);
        const toRemove = new Set(parcoursIds);
        this.writeNumberArray(this.parcoursKey(ueId), current.filter((id) => !toRemove.has(id)));
    }

    // ---------- Étudiants + notes ----------
    public async listEtudiantsNotesForUE(ueId: number): Promise<EtudiantNoteRow[]> {
        const parcoursIds = new Set(await this.listUEParcoursIds(ueId));
        const parcoursLite = await this.listAllParcoursLite();
        const parcoursNameById = new Map<number, string>(parcoursLite.map(p => [p.ID, p.NomParcours]));

        const etudiants = await EtudiantDAO.getInstance().list();
        const notesMap = this.readNotesMap(ueId);

        const getParcoursId = (e: any): number | null => {
            // selon tes retours API, l'étudiant peut avoir Parcours objet ou parcours_id
            return e?.Parcours?.ID ?? e?.parcours_id ?? e?.ParcoursID ?? null;
        };

        const rows = (etudiants as any[])
            .filter((e) => {
                const pid = getParcoursId(e);
                return pid != null && parcoursIds.has(pid);
            })
            .map((e) => {
                const pid = getParcoursId(e);
                const etuId = e?.ID ?? e?.id;
                return {
                    ID: etuId,
                    nom: e?.Nom ?? e?.nom ?? null,
                    prenom: e?.Prenom ?? e?.prenom ?? null,
                    email: e?.Email ?? e?.email ?? null,
                    parcoursNom: pid ? (parcoursNameById.get(pid) ?? null) : null,
                    note: typeof notesMap[etuId] === "number" ? notesMap[etuId] : (notesMap[etuId] ?? null),
                } as EtudiantNoteRow;
            });

        // tri simple (optionnel)
        rows.sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? ""));
        return rows;
    }

    public async upsertNote(ueId: number, etudiantId: number, note: number | null): Promise<void> {
        const map = this.readNotesMap(ueId);
        map[etudiantId] = note;
        this.writeNotesMap(ueId, map);
    }
}
