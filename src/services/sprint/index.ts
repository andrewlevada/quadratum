import { fetchSprintById, getSprintIdFromDate } from "~services/sprint/data";
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

    public static fromId(id: string): Promise<Sprint> {
        return fetchSprintById(id);
    }

    public static fromDate(date: Date): Promise<Sprint> {
        return getSprintIdFromDate(date)
            .then(id => fetchSprintById(id));
    }
}
