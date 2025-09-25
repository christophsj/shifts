import { ShiftDTO } from "src/modules/shifts/shifts.schemas";
import { ApiClient } from "./lib/api-client";
import { Sequence } from "./lib/sequence";
import { shiftEndedBefore } from "./lib/utils";
import { WorkplaceStatus } from "src/modules/workplaces/workplaces.schemas";

async function main(): Promise<void> {
    try {
        const baseUrl = 'http://localhost:5000/api';
        const client = new ApiClient(baseUrl);
        const top3 = await getTop3Workplaces(client, await client.getAllShifts());
        console.log(JSON.stringify(top3.toArray(), null, 2));
    } catch (error) {
        console.error('Worker analysis failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}


async function getTop3Workplaces(client: ApiClient, shifts: ShiftDTO[]) {
    const now = new Date();
    return (await Sequence.fromArray(shifts)
        .filter(shiftEndedBefore(now))
        .countBy(w => w.workplaceId as number)
        .mapAsync(async ({ key: workerId, count }) => {
            const w = (await client.getWorkplace(workerId));
            return ({
                name: w.name,
                shifts: count,
                status: w.status,
            });
        }))
        .filter(w => w.status == WorkplaceStatus.ACTIVE)
        .map(w => ({ name: w.name, shifts: w.shifts }))
        .topK(3, (a, b) => b.shifts - a.shifts)
}

