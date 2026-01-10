import type { Parcours } from '../entities/Parcours';
import type { IDAO } from './IDAO';
import axios from 'axios';


export class ParcoursDAO implements IDAO<Parcours> {
    private static instance: ParcoursDAO;

    private constructor() {}

    public static getInstance(): ParcoursDAO {
        if (!ParcoursDAO.instance) {
            ParcoursDAO.instance = new ParcoursDAO();
        }
        return ParcoursDAO.instance;
    }

    public async create(data: Parcours): Promise<Parcours> {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Parcours`, data);
            return response.data;
        } catch (error) {
            throw new Error('Impossible de créer le nouveau parcours');
        }
    }
   /* public async get(id: number): Promise<Parcours> {
        // Retrieve a Parcours document from the database 
        return { ID: id, NomParcours: 'Parcours 1', AnneeFormation: 2024 };
    }*/

    public async update(id: number, data: Parcours): Promise<Parcours> {
        try {
            // pour la modification faut mettre un put au lieu d'un post parce qu'on modifie ce qui existe deja !
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/Parcours/${id}`,
                data
            );
            return response.data;
        } catch (error) {
            throw new Error('Impossible de modifier le parcours');
        }
    }

    public async delete(id: number): Promise<void> {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/Parcours/${id}`);
        } catch (error) {
            throw new Error('Impossible de supprimer le parcours');
        }
    }
    // test pour voir si ça s'affiche sur l'ecran 
   /* public async list(): Promise<Parcours[]> {
        // List all Parcours documents from the database 
        return [
            { ID: 1, NomParcours: 'Parcours 1', AnneeFormation: 2024 },
            { ID: 2, NomParcours: 'Parcours 2', AnneeFormation: 2024 }
        ];
    }*/
    
    // là on parcours ce qu'on a dans la DB et cest avec P maj !!
    public async list(): Promise<Parcours[]> {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/Parcours`
        );
        return response.data;
    }

} 