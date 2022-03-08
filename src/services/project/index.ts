import { fetchAllProjects, fetchProjectById, postProject, updateProject } from "~services/project/data";
import { getRandomNiceColor } from "~utils/random";
import Task from "~services/task";
import { fetchTasksWithFilter } from "~services/task/data";
import { DocumentData, FirestoreDataConverter, PartialWithFieldValue, QueryDocumentSnapshot, where, WithFieldValue } from "@firebase/firestore";

interface ProjectDocument {
    label: string;
    color: string;
}

export default class Project {
    public readonly id: string;

    private labelInner: string;
    get label(): string {
        return this.labelInner;
    }
    set label(value: string) {
        this.labelInner = value;
        updateProject(this).then();
    }

    private colorInner: string;
    get color(): string {
        return this.colorInner;
    }
    set color(value: string) {
        this.colorInner = value;
        updateProject(this).then();
    }

    constructor(id: string, data: Project | ProjectDocument) {
        this.id = id;
        this.labelInner = data.label;
        this.colorInner = data.color;
    }

    public tasks(): Promise<Task[]> {
        return Project.tasks(this.id);
    }

    public static tasks(projectId: string): Promise<Task[]> {
        return fetchTasksWithFilter(where("projectId", "==", projectId));
    }

    public static fromId(id: string): Promise<Project> {
        return fetchProjectById(id);
    }

    public static fromIds(ids: string[]): Promise<Project[]> {
        if (ids.length === 0) return Promise.resolve([]);
        return Promise.all(ids.map(id => this.fromId(id)));
    }

    public static all(): Promise<Project[]> {
        return fetchAllProjects();
    }

    public static create(label: string): Promise<Project> {
        return postProject(new Project("null", {
            label, color: getRandomNiceColor(),
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
