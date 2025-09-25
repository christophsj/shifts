import { ApiClient } from "./lib/api-client";
import { Sequence } from "./lib/sequence";
import { ShiftDTO } from "src/modules/shifts/shifts.schemas";
import { shiftEndedBefore } from "./lib/utils";
import { WorkerStatus } from "src/modules/workers/workers.schemas";

async function main(): Promise<void> {
    try {
        const baseUrl = 'http://localhost:5000/api';
        const client = new ApiClient(baseUrl);
        const top3 = await getTop3Workers(await client.getAllShifts(), client);
        console.log(JSON.stringify(top3.toArray(), null, 2));
    } catch (error) {
        console.error('Worker analysis failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

async function getTop3Workers(shifts: ShiftDTO[], client: ApiClient) {
    // NOTE: this will currently fetch all workers from backend one by one, because the sequence is not implemented as lazily evaluated
    // Lazy evaluation was left as out of scope for this exercise
    // with lazy evaluation, it would only keep fetching until 3 active workers found (might still fetch all)
    const now = new Date();
    return (await Sequence.fromArray(shifts)
        .filter(hasWorkerAssigned)
        .filter(shiftEndedBefore(now))
        .countBy(w => w.workerId as number)
        .sort((a, b) => b.count - a.count)
        .mapAsync(async ({ key: workerId, count }) => {
            const w = (await client.getWorker(workerId));
            return ({
                name: w.name,
                shifts: count,
                status: w.status,
            });
        }))
        .filter(w => w.status == WorkerStatus.ACTIVE)
        .map(w => ({ name: w.name, shifts: w.shifts }))
        .topK(3, (a, b) => b.shifts - a.shifts)
}

function hasWorkerAssigned(shift: ShiftDTO): boolean {
    return shift.workerId != null;
}
