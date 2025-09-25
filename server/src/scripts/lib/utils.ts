import { ShiftDTO } from "src/modules/shifts/shifts.schemas";

export function shiftEndedBefore(now: Date): (item: ShiftDTO) => boolean {
    return w => new Date(w.endAt) <= now;
}