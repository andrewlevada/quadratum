import md5 from "md5";
import { postNewTask } from "~services/task/model";
import { postTaskToList } from "~services/list-service";
import { getSprintById, getSprintIdFromDate } from "~services/sprints-service";

export interface CreationContext {
    projectId: string;
    listId: string;
    origin: "daily" | "sprint" | "backlog";
}

export class Task {
    public readonly id: string;
    public text: string;
    public projectId: string;

    constructor(id: string, text: string, projectId: string) {
        this.id = id;
        this.text = text;
        this.projectId = projectId;
    }

    public static create(text: string, context: CreationContext): Promise<Task> {
        const hash = md5(text + new Date().valueOf().toString());
        const task = new Task(hash, text, context.projectId);

        const effect = this.getEffectForCreation(hash, context);
        return Promise.all([postNewTask(task), effect]).then(() => task);
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
