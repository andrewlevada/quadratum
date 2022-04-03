import TaskState from "~src/models/task/states/index";
import PendingState from "~src/models/task/states/pending";
import Task, { CompletedTaskDocumentPart } from "~src/models/task";

export default class CompletedState extends TaskState {
    private isInHomeInner: boolean;

    constructor(task: Task, data: CompletedTaskDocumentPart) {
        super(task);
        this.isInHomeInner = !!data.isInHome;
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

        const updateValues = {
            isCompleted: false,
            progress: value,
            wasActive: true,
            sessions: value.length,
            isInHome: null,
        }

        this.task.setState(new PendingState(this.task, updateValues));
        this.task.edit(updateValues).then();
    }

    get isInHome(): boolean {
        return this.isInHomeInner;
    }

    set isInHome(value: boolean) {
        if (this.isInHomeInner === value) return;
        this.isInHomeInner = value;
        this.task.edit({ isInHome: value || null }).then();
    }

    get upNextBlockTime(): number | null {
        return null;
    }

    get wasActive(): boolean {
        return true;
    }
}
