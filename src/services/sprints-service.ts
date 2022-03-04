/* eslint-disable @typescript-eslint/no-unused-vars */
export interface Sprint {
    id: string;
    number: number;
    startDate: Date;
    listId: string;
}

export function getSprintIdFromDate(date: Date): Promise<string> {
    throw new Error("Not implemented!");
}

export function getSprintById(id: string): Promise<Sprint> {
    throw new Error("Not implemented!");
}
