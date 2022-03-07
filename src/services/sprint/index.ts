import { createNewSprint,
    fetchSprintByNumber,
    getCurrentSprintNumber } from "~services/sprint/data";
import List from "~services/list";
import { getSprintAnchor } from "~services/user-service";

export default class Sprint {
    public readonly number: number;
    public readonly startWeek: number;
    public readonly listId: string;

    constructor(number: number, startWeek: number, listId: string) {
        this.number = number;
        this.startWeek = startWeek;
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
                    if ((shift || -1) > 0) return this.createAndAppend();
                    return Promise.resolve(null);
                }));
    }

    public static createAndAppend(): Promise<Sprint> {
        return Promise.all([List.create(), getSprintAnchor()])
            .then(([list, anchor]) => createNewSprint(
                list.id,
                anchor.lastSprintNumber + 1,
                anchor.currentSprintWeek + (anchor.lastSprintNumber - anchor.currentSprintNumber) + 1,
            ));
    }
}
