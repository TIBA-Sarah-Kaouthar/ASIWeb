import axios from 'axios';
import { UE } from '@/domain/entities/UE';

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
            `${import.meta.env.VITE_API_URL}/api/ue`
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

    async create(data: UE): Promise<UE> {const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/ue`, data.toJSON());

        const ue = response.data;

        return new UE(
            ue.ID,
            ue.Intitule,
            ue.NumeroUe,
            ue.Parcours ?? []
        );
    }
}
