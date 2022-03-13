import { fetchAllProjects, fetchProjectById, postProject, updateProject } from "~services/project/data";
import Task from "~services/task";
import { fetchTasksWithFilter } from "~services/task/data";
import { DocumentData, FirestoreDataConverter, PartialWithFieldValue, QueryDocumentSnapshot, where, WithFieldValue } from "@firebase/firestore";

interface ProjectDocument {
    label: string;
    color: string;
    isArchived?: boolean;
}

export default class Project {
    public readonly id: string;

    private labelInner: string;
    get label(): string {
        return this.labelInner;
    }
    set label(value: string) {
        if (this.labelInner === value) return;
        this.labelInner = value;
        updateProject({ id: this.id, label: value }).then();
    }

    private colorInner: string;
    get color(): string {
        return this.colorInner;
    }
    set color(value: string) {
        if (this.colorInner === value) return;
        this.colorInner = value;
        updateProject({ id: this.id, color: value }).then();
    }

    private isArchivedInner: boolean | undefined;
    get isArchived(): boolean | undefined {
        return this.isArchivedInner;
    }
    set isArchived(value: boolean | undefined) {
        if (this.isArchivedInner === value) return;
        this.isArchivedInner = value;
        updateProject({ id: this.id, isArchived: value }).then();
    }

    constructor(id: string, data: Project | ProjectDocument) {
        this.id = id;
        this.labelInner = data.label;
        this.colorInner = data.color;
        this.isArchivedInner = data.isArchived;
    }

    public tasks(doneState?: boolean): Promise<Task[]> {
        return Project.tasks(this.id, doneState);
    }

    public static tasks(projectId: string, doneState?: boolean): Promise<Task[]> {
        return doneState !== undefined
            ? fetchTasksWithFilter(where("projectId", "==", projectId), where("isDone", "==", doneState))
            : fetchTasksWithFilter(where("projectId", "==", projectId));
    }

    public static backlogTasks(projectId: string): Promise<Task[]> {
        // Manual filtering is not very efficient - better to user firestore indexing
        // But in this case default sprintNumber must be set to something (ex null)
        return this.tasks(projectId, false).then(tasks => tasks.filter(v => typeof v.sprintNumber !== "number"));
    }

    public static fromId(id: string): Promise<Project> {
        return fetchProjectById(id);
    }

    public static fromIds(ids: string[]): Promise<Project[]> {
        if (ids.length === 0) return Promise.resolve([]);
        return Promise.all(ids.map(id => this.fromId(id)));
    }

    public static all(isArchived?: boolean): Promise<Project[]> {
        return fetchAllProjects()
            .then(projects => projects.filter(v => !!v.isArchived === !!isArchived));
    }

    public static create(label: string, color: string): Promise<Project> {
        return postProject(new Project("null", {
            label, color,
        }));
    }

    public static converter: FirestoreDataConverter<Project> = {
        fromFirestore(snap: QueryDocumentSnapshot): Project {
            return new Project(snap.id, snap.data() as ProjectDocument);
        },

        toFirestore(modelObject: WithFieldValue<Project> | PartialWithFieldValue<Project>): DocumentData {
            const o = modelObject as Partial<Project>;
            const payload: Partial<ProjectDocument> = {};

            if (o.label) payload.label = o.label;
            if (o.color) payload.color = o.color;

            return payload;
        },
    };
}
