import { deleteTask, fetchTasksWithFilter, updateTask } from "~src/models/task/data";
import { getUserInfo } from "~services/user";
import {
    doc,
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    runTransaction,
    setDoc,
    where,
    WithFieldValue
} from "@firebase/firestore";
import { TaskContextModifier } from "~src/models/task/task-context-modifier";
import TaskState, { TaskStateBehaviour } from "~src/models/task/states";
import PendingState from "~src/models/task/states/pending";
import CompletedState from "~src/models/task/states/completed";
import { FullPartial } from "~src/utils/types";
import { db, nullishPayloadSet, updatable, userDoc } from "~src/models/tools";
import Milestone, { MilestoneDocument } from "~src/models/milestone";
import { captureMessage, Severity } from "@sentry/browser";

export interface BaseTaskDocument {
    text: string;
    isCompleted: boolean;
    sessions: number;
    scope: ScopeReference;
    milestone?: MilestoneReference;
    parentTaskId?: string;
    dueDate?: number;
}

export interface ScopeReference {
    id: string | "pile";
    location: string;
}

export interface MilestoneReference {
    id: string;
    label: string;
}

export type PendingTaskDocument = BaseTaskDocument & PendingTaskDocumentPart;
export interface PendingTaskDocumentPart {
    progress?: boolean[] | null;
    wasActive?: boolean;
    upNextBlockTime?: number;
}

export type CompletedTaskDocument = BaseTaskDocument & CompletedTaskDocumentPart;
export interface CompletedTaskDocumentPart {
    isInHome?: boolean;
}

export type TaskDocument = PendingTaskDocument & CompletedTaskDocument;

export default class Task extends TaskStateBehaviour {
    public readonly id: string;

    private textInner: string;
    @updatable<Task>(updateTask, null, obj => obj.propagateScopeUpdate()) text!: string;

    private sessionsInner: number;
    @updatable<Task>(updateTask) readonly sessions!: number;

    private scopeInner: ScopeReference;
    @updatable<Task>(updateTask, null, obj => obj.propagateScopeUpdate()) scope!: ScopeReference;

    private milestoneInner?: MilestoneReference;
    @updatable<Task, MilestoneReference | undefined>(updateTask, "null", (obj, oldValue, newValue) => {
        if (oldValue) Milestone.updateSessions(oldValue.id, -obj.sessions, -obj.completedSessions);
        if (newValue) Milestone.updateSessions(newValue.id, obj.sessions, obj.completedSessions);
        obj.propagateMilestoneUpdate().then();
    }) milestone!: MilestoneReference | null;

    private parentTaskIdInner?: string;
    @updatable(updateTask, "null") parentTaskId!: string | null;

    private dueDateInner?: number;
    @updatable(updateTask, "null") dueDate!: number | null;

    // State

    private state: TaskState;

    public getState(): TaskState {
        return this.state;
    }

    public setState(value: TaskState) {
        this.state = value;
    }

    public get isCompleted(): boolean {
        return this.state.isCompleted;
    }

    @forwardState() completedSessions!: number;
    @forwardState() progress!: boolean[];
    @forwardState() wasActive!: boolean;
    @forwardState() upNextBlockTime!: number | null;
    @forwardState() isInHome!: boolean;

    public constructor(id: string, data: PendingTaskDocument & CompletedTaskDocument) {
        super();
        this.id = id;

        this.textInner = data.text;
        this.sessionsInner = data.sessions;
        this.scopeInner = data.scope;

        this.milestoneInner = data.milestone;
        this.parentTaskIdInner = data.parentTaskId;
        this.dueDateInner = data.dueDate;

        this.state = data.isCompleted ? new CompletedState(this, data) : new PendingState(this, data);
    }

    public modifier(group: Task[]): TaskContextModifier {
        return new TaskContextModifier(this, group);
    }

    public delete(): Promise<void> {
        return deleteTask(this.id);
    }

    public edit(data: FullPartial<Task>): Promise<void> {
        for (const field of Object.keys(data))
            if (`${field}Inner` in this)
                (this as Record<string, unknown>)[`${field}Inner`] = (data as Record<string, unknown>)[field];
        return updateTask({ ...data, id: this.id as string });
    }

    private async propagateScopeUpdate() {
        const children = await this.getChildrenTasks();
        for (const child of children)
            child.scope = {
                id: this.scope.id,
                location: `${this.scopeInner.location}/${this.textInner}`,
            };
    }

    private async propagateMilestoneUpdate() {
        const children = await this.getChildrenTasks();
        for (const child of children) child.milestone = this.milestone;
    }

    private async getChildrenTasks(): Promise<Task[]> {
        return fetchTasksWithFilter([where("parentTaskId", "==", this.id)], true);
    }

    public static converter: FirestoreDataConverter<Task> = {
        fromFirestore(snap: QueryDocumentSnapshot): Task {
            return new Task(snap.id, snap.data() as BaseTaskDocument);
        },

        toFirestore(modelObject: WithFieldValue<Task> | PartialWithFieldValue<Task>): DocumentData {
            const o = modelObject as Partial<Task>;
            const payload: PartialWithFieldValue<TaskDocument> = {};

            if (o.text !== undefined) payload.text = o.text;
            if (o.scope !== undefined) payload.scope = o.scope;
            if (o.sessions !== undefined) payload.sessions = o.sessions;
            if (o.isCompleted !== undefined) payload.isCompleted = o.isCompleted;

            nullishPayloadSet<Task>("parentTaskId", o, payload);
            nullishPayloadSet<Task>("milestone", o, payload);
            nullishPayloadSet<Task>("dueDate", o, payload);
            nullishPayloadSet<Task>("progress", o, payload);
            nullishPayloadSet<Task>("wasActive", o, payload);
            nullishPayloadSet<Task>("upNextBlockTime", o, payload);
            nullishPayloadSet<Task>("isInHome", o, payload);

            // For extra protection
            if (o.sessions !== undefined && o.progress)
                if (o.sessions !== o.progress.length) payload.sessions = o.progress.length;

            return payload;
        },
    };

    public static async setActive(task: Task | null): Promise<void> {
        const previousActiveId = (await getUserInfo()).activeTaskId;
        await setDoc(userDoc(), { activeTaskId: task?.id || null }, { merge: true });
        if (!previousActiveId) return;
        await updateTask({ id: previousActiveId, wasActive: true });
    }
}

function forwardState() {
    return (target: Task, key: string) => {
        const getter = function() {
            return (this.getState() as unknown as Record<string, unknown>)[key];
        }

        const setter = function (value: unknown) {
            (this.getState() as unknown as Record<string, unknown>)[key] = value;
        }

        delete (target as any)[key];
        Object.defineProperty(target, key, { get: getter, set: setter });
    }
}
