import type { Parcours } from "./Parcours";
/* ce fichier sert à definir la forme d'un etdiant et ce qu'il contient comme information, toJSON c'est pour preparer les données a envoyer au backend*/
export interface IEtudiant {
    ID: number | null;
    nom: string | null;
    prenom: string | null;
    email: string | null;
    parcours: Parcours | null;

    toJSON(): object;
}

export class Etudiant implements IEtudiant {
    constructor(
        public ID: number | null,
        public Nom: string | null,
        public Prenom: string | null,
        public Email: string | null,
        public Parcours: Parcours | null
    ) {}

    toJSON(): object {
        return {
            nom: this.Nom,
            prenom: this.Prenom,
            email: this.Email,
            parcours_id: this.Parcours?.ID ?? null,
        };
    }
}
