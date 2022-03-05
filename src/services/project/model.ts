import Project from "~services/project/view-model";

interface ProjectStored {
    label: string;
    color: string;
    backlogListId: string;
}

export interface PostProjectPayload {
    label: string;
    backlogListId: string;
    color?: string;
}

export function postProject(payload: PostProjectPayload): Promise<Project> {
    throw new Error("Not implemented!");
}

export function fetchProjectById(id: string): Promise<Project> {
    throw new Error("Not implemented!");
}

export function updateProject(project: Project): Promise<void> {
    throw new Error("Not implemented!");
}
