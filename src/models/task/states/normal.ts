import TaskState from "~src/models/task/states/index";
import Task, { PendingTaskDocument, TaskConstructionData } from "~src/models/task";
import { updateTask } from "~src/models/task/data";
import CompletedState from "~src/models/task/states/completed";

export default class NormalState extends TaskState {
    private progressInner: boolean[] | null;

    constructor(task: Task, data?: TaskConstructionData) {
        super(task, data);
        this.progressInner = (data as PendingTaskDocument | undefined)?.progress || null;
    }

    public get isCompleted(): boolean {
        return false;
    }

    public get progress(): boolean[] | null {
        return this.progressInner?.clone() || null;
    }

    public updateProgress(value: boolean[] | null): Promise<void> {
        if (value === this.progressInner) return Promise.resolve();
        this.progressInner = value;
        if (value?.every(v => v))
            return this.task.edit({
                isCompleted: true, progress: null, sessions: value?.length || 0,
            }).then(() => this.task.setState(new CompletedState(this.task)));

        return updateTask({ id: this.task.id, progress: value, sessions: value?.length || 0 });
    }
}
