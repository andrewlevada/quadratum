import Task from "~services/task";
import { deleteList,
    deleteTaskFromList,
    fetchListById,
    postList,
    postTaskToList,
    updateList } from "~services/list/data";

export default class List {
    public readonly id: string;
    private tasksIdsInner: string[];
    public get tasksIds(): readonly string[] {
        return this.tasksIdsInner;
    }

    constructor(id: string, tasksIds: string[]) {
        this.id = id;
        this.tasksIdsInner = tasksIds;
    }

    public tasks(): Promise<Task[]> {
        return Task.fromIds(this.tasksIds);
    }

    public addTask(task: Task): Promise<void> {
        return postTaskToList(this.id, task.id);
    }

    public updateTasks(tasks: Task[]): Promise<void> {
        this.tasksIdsInner = tasks.map(task => task.id);
        return updateList(this);
    }

    public removeTask(task: Task): Promise<void> {
        return deleteTaskFromList(this.id, task.id);
    }

    public delete(): Promise<void> {
        return deleteList(this.id);
    }

    public static fromId(id: string): Promise<List> {
        return fetchListById(id);
    }

    public static create(): Promise<List> {
        return postList().then(id => new List(id, []));
    }
}
