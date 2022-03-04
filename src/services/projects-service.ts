/* eslint-disable @typescript-eslint/no-unused-vars */
export interface Project {
    id: string;
    label: string;
    color: string;
    backlogListId: string;
}

export function getAllProjects(): Promise<Project[]> {
    throw new Error("Not implemented!");
}

export function getProjectById(id: string): Promise<Project> {
    throw new Error("Not implemented!");
}
