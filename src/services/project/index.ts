import { fetchAllProjects, fetchProjectById, postProject, updateProject } from "~services/project/data";
import List from "~services/list";
import { getRandomNiceColor } from "~utils/random";

export default class Project {
    public readonly id: string;
    public readonly backlogListId: string;

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

    constructor(id: string, backlogListId: string, label: string, color: string) {
        this.id = id;
        this.backlogListId = backlogListId;
        this.labelInner = label;
        this.colorInner = color;
    }

    public backlog(): Promise<List> {
        return List.fromId(this.backlogListId);
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
        return List.create().then(list => postProject({
            label, color: getRandomNiceColor(), backlogListId: list.id,
        }));
    }
}
