import { fetchProjectById, postProject, updateProject } from "~services/project/data";
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

    public static fromId(id: string): Promise<Project> {
        return fetchProjectById(id);
    }

    public static create(label: string): Promise<Project> {
        return List.create().then(list => postProject({
            label, color: getRandomNiceColor(), backlogListId: list.id,
        }));
    }
}
