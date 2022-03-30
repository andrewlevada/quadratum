import TaskState from "~src/models/task/states/index";
import NormalState from "~src/models/task/states/normal";

export default class CompletedState extends TaskState {
    public get isCompleted(): boolean {
        return true;
    }

    public get progress(): boolean[] | null {
        return new Array(this.task.sessions).fill(true);
    }

    public async updateProgress(value: boolean[] | null): Promise<void> {
        if (value === null) {
            this.task.sessions = 0;
            return;
        }

        if (value.every(v => v)) {
            this.task.sessions = value.length;
            return;
        }

        await this.task.edit({
            isCompleted: false, progress: value, sessions: value.length,
        }).then(() => this.task.setState(new NormalState(this.task)));
    }
}
