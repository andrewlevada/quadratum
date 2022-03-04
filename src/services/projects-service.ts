export interface Project {
    id: string;
    label: string;
    color: string;
    backlogListId: string;
}

export function getAllProjects(): Promise<Project[]> {
    throw new Error("Not implemented!");
}
