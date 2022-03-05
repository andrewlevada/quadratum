import { deleteTask, fetchTaskById, fetchTasksByIds, postTask, updateTask } from "~services/task/model";
import Sprint from "~services/sprint/view-model";
import List from "~services/list/view-model";
import { read } from "fs";

export interface ActionContext {
    listId: string;
    origin: "daily" | "sprint" | "backlog";
}

export interface CreationContext extends ActionContext {
    projectId: string;
}

export default class Task {
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
            return Sprint.fromDate(new Date())
                .then(sprint => sprint.list())
                .then(sprintList => sprintList.removeTask(this))
                .then(() => List.fromId(context.listId))
                .then(list => list.removeTask(this));
        return List.fromId(context.listId).then(list => list.removeTask(this));
    }

    public static fromId(id: string): Promise<Task> {
        return fetchTaskById(id);
    }

    public static fromIds(ids: readonly string[]): Promise<Task[]> {
        return fetchTasksByIds(ids);
    }

    public static create(text: string, context: CreationContext): Promise<Task> {
        return postTask({ text, projectId: context.projectId })
            .then(task => this.getEffectForCreation(task, context).then(() => task));
    }

    private static getEffectForCreation(task: Task, context: CreationContext): Promise<void> {
        if (context.origin === "daily")
            return Sprint.fromDate(new Date())
                .then(sprint => sprint.list())
                .then(sprintList => sprintList.addTask(task))
                .then(() => List.fromId(context.listId))
                .then(list => list.addTask(task));
        return List.fromId(context.listId).then(list => list.addTask(task));
    }
}

// export interface ParentTask extends Task {
//     subtasksIds: string[];
// }
//
// export interface PointsTask extends Task {
//     points: boolean[];
// }
