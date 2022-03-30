import Task, { TaskConstructionData } from "~src/models/task";

export default abstract class TaskState {
    protected task: Task;

    public constructor(task: Task, data?: TaskConstructionData) {
        this.task = task;
    }

    public abstract get isCompleted(): boolean;
    public abstract get progress(): boolean[] | null;
    public abstract updateProgress(value: boolean[] | null): Promise<void>;
}
