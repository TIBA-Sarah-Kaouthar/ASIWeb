/* Ce fichier, centralise toutes les activités a faire vec les autres DAO
    Comme recuperer les parcours pour modifier, UE pour modifier
    Ici je gére les parcours en localstorage, pour éviter de trop toucher au backend
    je gére les notes des etudiants, les listes
    les parcours, les listes liée à une UE bien sur
    le fait que les étudiants changent si je change de parcours...etc
 */
import { UEDAO } from "@/domain/daos/UEDAO";
import { ParcoursDAO } from "@/domain/daos/ParcoursDAO";
import { EtudiantDAO } from "@/domain/daos/EtudiantDAO";

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
    ID: number;
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

    private parcoursKey(ueId: number) {
        return `ue:${ueId}:parcours_ids`;
    }
    private notesKey(ueId: number) {
        return `ue:${ueId}:notes`;
    }

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

    private readNotesMap(ueId: number): Record<string, number | null> {
        try {
            const raw = localStorage.getItem(this.notesKey(ueId));
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    private writeNotesMap(ueId: number, map: Record<string, number | null>) {
        localStorage.setItem(this.notesKey(ueId), JSON.stringify(map));
    }

    public async getUEBasic(ueId: number): Promise<UEBasic> {
        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;

        if (!ue) throw new Error("UE introuvable");

        return {
            ID: ue.ID,
            Intitule: ue.Intitule ?? null,
            NumeroUe: ue.NumeroUe ?? ue.Numero ?? ue.numero ?? null,
        };
    }

    public async updateUEBasic(
        ueId: number,
        payload: { Intitule: string; NumeroUe: string | number }
    ): Promise<void> {
        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;
        if (!ue) throw new Error("UE introuvable");

        ue.Intitule = payload.Intitule;
        ue.NumeroUe = payload.NumeroUe == null ? null : String(payload.NumeroUe);

        await UEDAO.getInstance().update(ueId, ue);
    }

    public async listAllParcoursLite(): Promise<ParcoursLite[]> {
        const parcours = await ParcoursDAO.getInstance().list();
        return (parcours as any[]).map((p: any) => ({
            ID: p.ID,
            NomParcours: p.NomParcours ?? p.nom ?? "",
        }));
    }

    public async listUEParcoursIds(ueId: number): Promise<number[]> {
        const stored = this.readNumberArray(this.parcoursKey(ueId));
        if (stored.length) return stored;

        const list = await UEDAO.getInstance().list();
        const ue = list.find((u: any) => u.ID === ueId) as any;

        if (ue?.Parcours && Array.isArray(ue.Parcours)) {
            const ids = ue.Parcours
                .map((p: any) => p?.ID ?? p?.id)
                .filter((x: any) => typeof x === "number");
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

    public async listEtudiantsNotesForUE(ueId: number): Promise<EtudiantNoteRow[]> {
        const parcoursIds = new Set(await this.listUEParcoursIds(ueId));
        const parcoursLite = await this.listAllParcoursLite();
        const parcoursNameById = new Map<number, string>(parcoursLite.map((p) => [p.ID, p.NomParcours]));

        const etudiants = await EtudiantDAO.getInstance().list();
        const notesMap = this.readNotesMap(ueId);

        const getParcoursId = (e: any): number | null => {
            return e?.Parcours?.ID ?? e?.parcours_id ?? e?.ParcoursID ?? null;
        };

        const rows = (etudiants as any[])
            .filter((e) => {
                const pid = getParcoursId(e);
                const id = e?.ID ?? e?.id;
                return typeof id === "number" && pid != null && parcoursIds.has(pid);
            })
            .map((e) => {
                const pid = getParcoursId(e);
                const etuId = (e?.ID ?? e?.id) as number;
                const noteRaw = notesMap[String(etuId)];

                return {
                    ID: etuId,
                    nom: e?.Nom ?? e?.nom ?? null,
                    prenom: e?.Prenom ?? e?.prenom ?? null,
                    email: e?.Email ?? e?.email ?? null,
                    parcoursNom: pid ? (parcoursNameById.get(pid) ?? null) : null,
                    note: typeof noteRaw === "number" ? noteRaw : (noteRaw ?? null),
                } as EtudiantNoteRow;
            });

        rows.sort((a, b) => (a.nom ?? "").localeCompare(b.nom ?? ""));
        return rows;
    }

    public async upsertNote(ueId: number, etudiantId: number, note: number | null): Promise<void> {
        const map = this.readNotesMap(ueId);
        map[String(etudiantId)] = note;
        this.writeNotesMap(ueId, map);
    }
}
