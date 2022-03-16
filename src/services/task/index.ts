import { deleteTask,
    fetchTaskById,
    fetchTasksByIds,
    fetchTasksWithFilter,
    postTask,
    updateTask } from "~services/task/data";
import { deleteField, DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot, where,
    WithFieldValue } from "@firebase/firestore";
import { getCurrentSprintNumber } from "~services/sprint/data";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    origin: ActionOrigin;
}

export interface CreationContext extends ActionContext {
    projectId: string | undefined;
    sprintNumber: number | undefined;
    parentTaskId?: string;
}

interface TaskDocument {
    text: string;
    isDone: boolean;
    projectId?: string;
    sprintNumber?: number;
    isInDaily?: boolean;
    progress?: boolean[];
    parentTaskId?: string;
}

// TODO: Use decorator to fix repetitive code in getters/setters

export default class Task {
    public readonly id: string;

    private textInner: string | undefined;
    public get text(): string {
        return this.textInner || "";
    }
    public set text(value: string) {
        if (this.textInner === value) return;
        this.textInner = value;
        updateTask({ id: this.id, text: value }).then();
    }

    private isInDailyInner: boolean;
    public get isInDaily(): boolean {
        return this.isInDailyInner;
    }
    public set isInDaily(value: boolean) {
        if (this.isInDailyInner === value) return;
        this.isInDailyInner = value;
        updateTask({ id: this.id, isInDaily: value }).then();
    }

    private projectIdInner: string | null | undefined;
    public get projectId(): string | null {
        return this.projectIdInner!;
    }
    public set projectId(value: string | null) {
        if (this.projectIdInner === value) return;
        this.projectIdInner = value;
        updateTask({ id: this.id, projectId: value }).then();
    }

    private sprintNumberInner: number | null | undefined;
    public get sprintNumber(): number | null {
        return this.sprintNumberInner!;
    }
    public set sprintNumber(value: number | null) {
        if (this.sprintNumberInner === value) return;
        this.sprintNumberInner = value;
        updateTask({ id: this.id, sprintNumber: value }).then();
    }

    private parentTaskIdInner: string | undefined;
    public get parentTaskId(): string | undefined {
        return this.parentTaskIdInner;
    }
    public set parentTaskId(value: string | undefined) {
        if (this.parentTaskIdInner === value) return;
        this.parentTaskIdInner = value;
        updateTask({ id: this.id, parentTaskId: value }).then();
    }

    private progressInner: boolean[] | null | undefined;
    public get progress(): boolean[] | null {
        return this.progressInner!;
    }

    constructor(id: string, data: TaskDocument | Task | Partial<Task>) {
        this.id = id;
        this.textInner = data.text;
        this.projectIdInner = data.projectId;
        this.sprintNumberInner = data.sprintNumber;
        this.isInDailyInner = !!data.isInDaily;
        this.progressInner = data.progress;
        this.parentTaskIdInner = data.parentTaskId;
    }

    public delete(): Promise<void> {
        return deleteTask(this.id).then();
    }

    public updateProgress(value?: boolean[]): void {
        if (value !== undefined) this.progressInner = value;
        updateTask({ id: this.id, progress: this.progressInner }).then();
    }

    public isDone(): boolean {
        return !!this.progressInner
            && this.progressInner.length > 0
            && this.progressInner.filter(v => v).length === this.progressInner.length;
    }

    public removeFromDailyList(group: Task[]): void {
        this.isInDaily = false;
        for (const t of this.getChildrenTasks(group)) t.isInDaily = false;
        if (!this.hasSiblings(group) && this.parentTaskId) {
            const firstParent = this.getParentTasks(group)[0];
            firstParent.isInDaily = false;
            this.popTaskTreeFromGroup(group, [firstParent]);
        } else this.popTaskTreeFromGroup(group);
    }

    public getChildrenTasks(group: Task[]): Task[] {
        const childrenTasks: Task[] = [];
        for (let i = 0; i < group.length; i++)
            if (group[i].parentTaskId === this.id) childrenTasks.push(group[i]);
        return childrenTasks;
    }

    public getParentTasks(group: Task[]): Task[] {
        const parents = [];
        let parentId = this.parentTaskId;
        while (parentId) {
            // eslint-disable-next-line no-loop-func
            const parent = group.find(v => v.id === parentId);
            if (!parent) return parents;
            parents.push(parent);
            parentId = parent.parentTaskId;
        }
        return parents;
    }

    public hasSiblings(group: Task[]): boolean {
        if (!this.parentTaskId) return false;
        for (let i = 0; i < group.length; i++)
            if (group[i].parentTaskId === this.parentTaskId && group[i].id !== this.id)
                return true;
        return false;
    }

    private popTaskTreeFromGroup(group: Task[], additionalPop?: Task[]) {
        const childrenTasks = this.getChildrenTasks(group);
        for (let i = group.length - 1; i >= 0; i--)
            if (childrenTasks.includes(group[i])
                || additionalPop?.includes(group[i])
                || group[i].id === this.id)
                group.splice(i, 1);
    }

    public static fromId(id: string): Promise<Task> {
        return fetchTaskById(id);
    }

    public static fromIds(ids: readonly string[]): Promise<Task[]> {
        return fetchTasksByIds(ids);
    }

    public static daily(): Promise<Task[]> {
        return fetchTasksWithFilter(where("isInDaily", "==", true));
    }

    public static async create(text: string, context: CreationContext): Promise<Task> {
        if (context.origin === "daily") context.sprintNumber = await getCurrentSprintNumber();
        return postTask(new Task("null", {
            text,
            projectId: context.projectId || "none",
            sprintNumber: context.sprintNumber,
            isInDaily: context.origin === "daily",
            progress: [false],
            parentTaskId: context.parentTaskId,
            isDone: false,
        }));
    }

    public static converter: FirestoreDataConverter<Task> = {
        fromFirestore(snap: QueryDocumentSnapshot): Task {
            return new Task(snap.id, snap.data() as TaskDocument);
        },

        toFirestore(modelObject: WithFieldValue<Task> | PartialWithFieldValue<Task>): DocumentData {
            const o = modelObject as Partial<Task>;
            const payload: PartialWithFieldValue<TaskDocument> = {};

            if (o.text) payload.text = o.text;
            if (o.projectId !== undefined) payload.projectId = o.projectId || deleteField();
            if (o.isInDaily !== undefined) payload.isInDaily = o.isInDaily;
            if (o.parentTaskId) payload.parentTaskId = o.parentTaskId;

            if (o.sprintNumber === null) payload.sprintNumber = deleteField();
            else if (o.sprintNumber !== undefined) payload.sprintNumber = o.sprintNumber;

            if (o.progress === null) {
                payload.progress = deleteField();
                payload.isDone = deleteField();
            } else if (o.progress) {
                payload.progress = o.progress as boolean[];
                payload.isDone = o.progress.every(v => v);
            }

            return payload;
        },
    };
}
