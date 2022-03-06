import { createNewSprint, fetchSprintByNumber, getCurrentSprintNumber } from "~services/sprint/data";
import List from "~services/list";

export default class Sprint {
    public readonly id: string;
    public readonly number: number;
    public readonly startDate: Date;
    public readonly listId: string;

    constructor(id: string, number: number, startDate: Date, listId: string) {
        this.id = id;
        this.number = number;
        this.startDate = startDate;
        this.listId = listId;
    }

    public list(): Promise<List> {
        return List.fromId(this.listId);
    }

    public static fromNumber(number: number): Promise<Sprint | null> {
        return fetchSprintByNumber(number);
    }

    public static current(shift?: number): Promise<Sprint | null> {
        return getCurrentSprintNumber()
            .then(currentSprintNumber => this.fromNumber(currentSprintNumber + (shift || 0))
                .then(sprint => {
                    if (sprint) return Promise.resolve(sprint);
                    if (shift || -1 > 0) return this.createAndAppend();
                    return Promise.resolve(null);
                }));
    }

    public static createAndAppend(): Promise<Sprint> {
        return List.create().then(list => createNewSprint(list.id));
    }
}
