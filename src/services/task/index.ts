import { deleteTask, fetchTaskById, fetchTasksByIds, postTask, updateTask } from "~services/task/data";
import Sprint from "~services/sprint";
import List from "~services/list";
import { getNoneProjectId } from "~services/user-service";
import Project from "~services/project";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    listId: string;
    origin: ActionOrigin;
}

export interface CreationContext extends ActionContext {
    projectId: string | null;
}

interface SafeCreationContext extends CreationContext {
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
        return Promise.all([deleteTask(this.id), effect]).then();
    }

    private getEffectFromDeletion(context: ActionContext): Promise<void> {
        if (context.origin === "daily")
            return Sprint.current()
                .then(sprint => sprint!.list())
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

    public static async create(text: string, context: CreationContext): Promise<Task> {
        if (!context.projectId) context.projectId = await getNoneProjectId();
        const task = await postTask({ text, projectId: context.projectId });
        await this.getEffectForCreation(task, context as SafeCreationContext);
        return task;
    }

    private static async getEffectForCreation(task: Task, context: SafeCreationContext): Promise<void> {
        if (context.origin === "daily") {
            const currentSprint = await Sprint.current();
            const sprintList = await currentSprint!.list();
            await sprintList.addTask(task);
        }

        if (context.origin !== "backlog") {
            const project = await Project.fromId(context.projectId);
            const backlog = await project.backlog();
            await backlog.addTask(task);
        }

        const list = await List.fromId(context.listId);
        await list.addTask(task);
    }
}

// export interface ParentTask extends Task {
//     subtasksIds: string[];
// }
//
// export interface PointsTask extends Task {
//     points: boolean[];
// }
