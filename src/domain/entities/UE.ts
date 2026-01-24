import { Parcours } from './Parcours';

/* ce fichier sert à definiir les attribut et la forme de l'UE*/

export interface IUE {

    ID: number | null;

    Intitule: string | null;

    NumeroUe: string | null;

    Parcours: Parcours[] | null;



    toJSON(): Object;

}



export class UE implements IUE {

    constructor(

        public ID: number | null,

        public Intitule: string | null,

        public NumeroUe: string | null,

        public Parcours: Parcours[] | null

    ) {}



    toJSON(): Object {

        return {

            ID: this.ID,

            Intitule: this.Intitule,

            NumeroUe: this.NumeroUe,

            Parcours: this.Parcours?.map((parcours) => parcours.ID)

        };

    }

} 