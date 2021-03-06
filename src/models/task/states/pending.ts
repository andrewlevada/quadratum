import TaskState from "~src/models/task/states/index";
import Task, {
    CompletedTaskDocumentPart,
    PendingTaskDocumentPart,
} from "~src/models/task";
import { updateTask } from "~src/models/task/data";
import CompletedState from "~src/models/task/states/completed";
import Milestone from "~src/models/milestone";

export default class PendingState extends TaskState {
    private progressInner: boolean[] | null;
    private upNextBlockTimeInner: number | null;
    private wasActiveInner: boolean | null;

    constructor(task: Task, data: PendingTaskDocumentPart) {
        super(task);
        this.progressInner = data.progress || null;
        this.upNextBlockTimeInner = data.upNextBlockTime || null;
        this.wasActiveInner = data.wasActive || null;
    }

    public get isCompleted(): boolean {
        return false;
    }

    public get completedSessions(): number {
        return this.progressInner?.filter(x => x).length || 0;
    }

    public get progress(): boolean[] | null {
        return this.progressInner?.clone() || null;
    }

    public set progress(value: boolean[] | null) {
        if (value === this.progressInner) return;

        if (this.task.milestone)
            Milestone.updateSessions(this.task.milestone.id,
                this.getProgressDeltaChange(value, "all"),
                this.getProgressDeltaChange(value, "completed"));


        this.progressInner = value;
        if (value?.every(v => v) && value?.length > 0) {
            const updateValues = {
                isCompleted: true,
                isInHome: true,
                sessions: value?.length || 0,
                progress: null,
                upNextBlockTime: null,
                wasActive: null,
            };
            this.task.setState(new CompletedState(this.task, updateValues as CompletedTaskDocumentPart));
            this.task.edit(updateValues).then();
        } else updateTask({
            id: this.task.id,
            progress: value,
            sessions: value?.length || 0,
        }).then();
    }

    get isInHome(): boolean {
        return false;
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
