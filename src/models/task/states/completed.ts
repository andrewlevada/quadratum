import TaskState from "~src/models/task/states/index";
import PendingState from "~src/models/task/states/normal";
import Task, { CompletedTaskDocument, TaskConstructionData } from "~src/models/task";

export default class CompletedState extends TaskState {
    private isInHomeInner: boolean;

    constructor(task: Task, data?: TaskConstructionData) {
        super(task, data);
        this.isInHomeInner = !!((data as CompletedTaskDocument)?.isInHome);
    }

    public get isCompleted(): boolean {
        return true;
    }

    public get progress(): boolean[] | null {
        return new Array(this.task.sessions).fill(true);
    }

    public set progress(value: boolean[] | null) {
        if (value === null) {
            this.task.sessions = 0;
            return;
        }

        if (value.every(v => v)) {
            this.task.sessions = value.length;
            return;
        }

        this.task.edit({
            isCompleted: false, progress: value, sessions: value.length,
        }).then(() => this.task.setState(new PendingState(this.task, { progress: value })));
    }

    get isInHome(): boolean {
        return this.isInHomeInner;
    }

    set isInHome(value: boolean) {
        if (this.isInHomeInner === value) return;
        this.isInHomeInner = value;
        this.task.edit({ isInHome: value || null }).then();
    }

    get isStarted(): boolean {
        return true;
    }

    get upNextBlockTime(): number | null {
        return null;
    }

    get wasActive(): boolean {
        return true;
    }
}
