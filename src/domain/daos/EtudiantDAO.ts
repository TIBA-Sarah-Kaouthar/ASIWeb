import axios from "axios";
import type { Etudiant } from "@/domain/entities/Etudiant";

export class EtudiantDAO {
    private static instance: EtudiantDAO;

    private constructor() {}

    public static getInstance(): EtudiantDAO {
        if (!EtudiantDAO.instance) EtudiantDAO.instance = new EtudiantDAO();
        return EtudiantDAO.instance;
    }

    async list(): Promise<Etudiant[]> {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/etudiants`);
        return res.data;
    }

    async create(data: Etudiant): Promise<Etudiant> {
        const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/etudiants`,
            (data as any).toJSON ? (data as any).toJSON() : data
        );
        return res.data;
    }

    async update(id: number, data: Etudiant): Promise<Etudiant> {
        try {
            const payload = (data as any).toJSON ? (data as any).toJSON() : data;

            // logs utiles
            console.log("UPDATE -> URL:", `${import.meta.env.VITE_API_URL}/api/etudiants/${id}`);
            console.log("UPDATE -> PAYLOAD:", payload);

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/etudiants/${id}`,
                payload
            );
            return res.data;
        } catch (error: any) {
            console.error("UPDATE ETUDIANT ERROR STATUS:", error?.response?.status);
            console.error("UPDATE ETUDIANT ERROR DATA:", error?.response?.data);
            throw new Error("Impossible de modifier l'étudiant");
        }
    }

    async delete(id: number): Promise<void> {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/etudiants/${id}`);
    }
}