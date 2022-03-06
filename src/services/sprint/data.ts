import Sprint from "~services/sprint";

export function createNewSprint(listId: string): Promise<Sprint> {
    throw new Error("Not implemented!");
}

export function getCurrentSprintNumber(): Promise<number> {
    throw new Error("Not implemented!");
}

export function fetchSprintByNumber(number: number): Promise<Sprint | null> {
    throw new Error("Not implemented!");
}
