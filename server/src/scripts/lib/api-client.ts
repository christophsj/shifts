import { PaginatedResponse, Response } from "src/modules/shared/shared.types";
import { ShiftDTO } from "src/modules/shifts/shifts.schemas";
import { WorkerDTO } from "src/modules/workers/workers.schemas";


export class ApiClient {
    protected readonly baseUrl;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async getAllShifts(): Promise<ShiftDTO[]> {
        let nextUrl: string | undefined = `${this.baseUrl}/shifts`;
        const result: ShiftDTO[] = [];

        while (nextUrl) {
            const response = await this.getShift(nextUrl);
            result.push(...response.data);
            nextUrl = response.links.next;
        }

        return result;
    }

    async getShift(url: string): Promise<PaginatedResponse<ShiftDTO>> {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json() as PaginatedResponse<ShiftDTO>;
        } catch (error) {
            console.error('Error fetching shifts:', error);
            throw error;
        }
    }

    async getWorker(workerId: number): Promise<WorkerDTO> {
        try {
            const response = await fetch(`${this.baseUrl}/workers/${workerId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const workerResponse = await response.json() as Response<WorkerDTO>;
            return workerResponse.data;
        } catch (error) {
            console.error(`Error fetching worker ${workerId}:`, error);
            throw error;
        }
    }

    async getWorkplace(workplaceId: number): Promise<WorkerDTO> {
        try {
            const response = await fetch(`${this.baseUrl}/workplaces/${workplaceId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const workerResponse = await response.json() as Response<WorkerDTO>;
            return workerResponse.data;
        } catch (error) {
            console.error(`Error fetching worker ${workplaceId}:`, error);
            throw error;
        }
    }
} 