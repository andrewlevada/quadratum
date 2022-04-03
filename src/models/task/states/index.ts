// eslint-disable-next-line max-classes-per-file
import Task, { TaskConstructionData } from "~src/models/task";

export abstract class TaskStateBehaviour {
    public abstract get isCompleted(): boolean;

    // Pending
    public abstract get progress(): boolean[] | null;
    public abstract set progress(value: boolean[] | null);
    public abstract get wasActive(): boolean;
    public abstract set wasActive(value: boolean);
    public abstract get upNextBlockTime(): number | null;
    public abstract set upNextBlockTime(value: number | null);

    // Completed
    public abstract get isInHome(): boolean;
    public abstract set isInHome(value: boolean);
}

export default abstract class TaskState extends TaskStateBehaviour {
    protected task: Task;

    protected constructor(task: Task, data?: TaskConstructionData) {
        super();
        this.task = task;
    }
}
