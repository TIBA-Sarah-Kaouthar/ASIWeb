import axios from 'axios';
import { UE } from '@/domain/entities/UE';
import { ref } from 'vue';
import UEForm from '@/presentation/components/forms/UEForm.vue';
import type {Parcours} from "@/domain/entities/Parcours";

const UEFormRef = ref<InstanceType<typeof UEForm> | null>(null);

export class UEDAO {
    private static instance: UEDAO;

    private constructor() {}

    public static getInstance(): UEDAO {
        if (!UEDAO.instance) {
            UEDAO.instance = new UEDAO();
        }
        return UEDAO.instance;
    }

    async list(): Promise<UE[]> {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/Ue`
        );

        return response.data.map(
            (ue: any) =>
                new UE(
                    ue.ID,
                    ue.Intitule,
                    ue.NumeroUe,
                    ue.Parcours ?? []
                )
        );
    }
    async create(data: UE): Promise<UE> {const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Ue`, data.toJSON());

        const ue = response.data;

        return new UE(
            ue.ID,
            ue.Intitule,
            ue.NumeroUe,
            ue.Parcours ?? []
        );
    }


    public async update(id: number, data: UE): Promise<UE> {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/Ue/${id}`,
                data.toJSON()
            );
            const ue = response.data;
            return new UE(
                ue.ID,
                ue.Intitule,
                ue.NumeroUe,
                ue.Parcours ?? []
            );
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Impossible de modifier l\'UE');
        }
    }
    public async delete(id: number): Promise<void> {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/Ue/${id}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Impossible de supprimer l\'UE');
        }
    }
}
