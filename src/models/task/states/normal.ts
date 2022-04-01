import TaskState from "~src/models/task/states/index";
import Task, { PendingTaskDocument, TaskConstructionData } from "~src/models/task";
import { updateTask } from "~src/models/task/data";
import CompletedState from "~src/models/task/states/completed";

export default class PendingState extends TaskState {
    private progressInner: boolean[] | null;
    private upNextBlockTimeInner: number | null;
    private wasActiveInner: boolean | null;
    private isStartedInner: boolean | null;

    constructor(task: Task, data?: TaskConstructionData) {
        super(task, data);
        const d = data as PendingTaskDocument | undefined;
        this.progressInner = d?.progress || null;
        this.upNextBlockTimeInner = d?.upNextBlockTime || null;
        this.wasActiveInner = d?.wasActive || null;
        this.isStartedInner = d?.isStarted || null;
    }

    public get isCompleted(): boolean {
        return false;
    }

    public get progress(): boolean[] | null {
        return this.progressInner?.clone() || null;
    }

    public set progress(value: boolean[] | null) {
        if (value === this.progressInner) return;
        this.progressInner = value;
        this.isStartedInner = value?.some(v => v) || null;
        if (value?.every(v => v))
            this.task.edit({
                isCompleted: true,
                sessions: value?.length || 0,
                progress: null,
                upNextBlockTime: null,
                wasActive: null,
                isStarted: null,
            }).then(() => this.task.setState(new CompletedState(this.task)));
        else updateTask({
            id: this.task.id,
            progress: value,
            sessions: value?.length || 0,
            isStarted: this.isStartedInner,
        }).then();
    }

    get isInHome(): boolean {
        return false;
    }

    get isStarted(): boolean {
        return !!this.isStartedInner;
    }

    get upNextBlockTime(): number | null {
        return this.upNextBlockTimeInner;
    }

    set upNextBlockTime(value: number | null) {
        if (value === this.upNextBlockTimeInner) return;
        this.upNextBlockTimeInner = value;
        updateTask({
            id: this.task.id,
            upNextBlockTime: value,
        }).then();
    }

    get wasActive(): boolean {
        return !!this.wasActiveInner;
    }

    set wasActive(value: boolean) {
        if (value === this.wasActiveInner) return;
        this.wasActiveInner = value;
        updateTask({
            id: this.task.id,
            wasActive: value,
        }).then();
    }
}
