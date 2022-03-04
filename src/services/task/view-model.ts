import md5 from "md5";
import { deleteTask, postTask, updateTask } from "~services/task/model";
import { deleteTaskFromList, postTaskToList } from "~services/list-service";
import { getSprintById, getSprintIdFromDate } from "~services/sprints-service";

export interface ActionContext {
    listId: string;
    origin: "daily" | "sprint" | "backlog";
}

export interface CreationContext extends ActionContext {
    projectId: string;
}

export class Task {
    public readonly id: string;

    private textInner: string;
    public get text(): string {
        return this.textInner;
    }
    public set text(value: string) {
        this.textInner = value;
        updateTask(this).then();
    }

    private projectIdInner: string;
    public get projectId(): string {
        return this.projectIdInner;
    }
    public set projectId(value: string) {
        this.projectIdInner = value;
        updateTask(this).then();
    }

    constructor(id: string, text: string, projectId: string) {
        this.id = id;
        this.textInner = text;
        this.projectIdInner = projectId;
    }

    public delete(context: ActionContext): Promise<void> {
        const effect = this.getEffectFromDeletion(context);
        return Promise.all([deleteTask(this), effect]).then();
    }

    private getEffectFromDeletion(context: ActionContext): Promise<void> {
        if (context.origin === "daily")
            return getSprintIdFromDate(new Date())
                .then(currentSprintId => getSprintById(currentSprintId))
                .then(sprint => deleteTaskFromList(sprint.listId, this.id))
                .then(() => deleteTaskFromList(context.listId, this.id));
        return deleteTaskFromList(context.listId, this.id);
    }

    public static create(text: string, context: CreationContext): Promise<Task> {
        const hash = md5(text + new Date().valueOf().toString());
        const task = new Task(hash, text, context.projectId);

        const effect = this.getEffectForCreation(hash, context);
        return Promise.all([postTask(task), effect]).then(() => task);
    }

    private static getEffectForCreation(taskId: string, context: CreationContext): Promise<void> {
        if (context.origin === "daily")
            return getSprintIdFromDate(new Date())
                .then(currentSprintId => getSprintById(currentSprintId))
                .then(sprint => postTaskToList(sprint.listId, taskId))
                .then(() => postTaskToList(context.listId, taskId));
        return postTaskToList(context.listId, taskId);
    }
}

// export interface ParentTask extends Task {
//     subtasksIds: string[];
// }
//
// export interface PointsTask extends Task {
//     points: boolean[];
// }
