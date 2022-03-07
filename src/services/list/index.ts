import Task from "~services/task";
import { addTaskToList, deleteList,
    fetchListById,
    postList, removeTaskFromList,
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

    public updateTasks(tasks: Task[]): Promise<void> {
        this.tasksIdsInner = tasks.map(task => task.id);
        return updateList(this);
    }

    public addTask(task: Task): Promise<void> {
        return addTaskToList(this.id, task.id);
    }

    public removeTask(task: Task): Promise<void> {
        return removeTaskFromList(this.id, task.id);
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
