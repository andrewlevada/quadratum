import Project from "~services/project";
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";

interface ProjectDocument {
    label: string;
    color: string;
    backlogListId: string;
}

export interface PostProjectPayload {
    label: string;
    backlogListId: string;
    color: string;
}

export async function postProject(payload: PostProjectPayload): Promise<Project> {
    const snap = await addDoc(collection(userDoc(), "projects"), payload);
    return new Project(snap.id, payload.backlogListId, payload.label, payload.color);
}

export async function fetchProjectById(id: string): Promise<Project> {
    const snap = await getDoc(doc(userDoc(), "projects", id));
    const data = snap.data() as ProjectDocument;
    if (!data) return Promise.reject();
    return new Project(id, data.backlogListId, data.label, data.color);
}

export function updateProject(project: Project): Promise<void> {
    return setDoc(doc(userDoc(), "projects", project.id), {
        label: project.label, color: project.color, backlogListId: project.backlogListId,
    } as ProjectDocument).then();
}

export async function fetchAllProjects(): Promise<Project[]> {
    const q = await getDocs(collection(userDoc(), "projects"));
    const snaps = q.docs;
    return snaps.map(snap => {
        const data = snap.data() as ProjectDocument | undefined;
        if (!data) return null;
        return new Project(snap.id, data.backlogListId, data.label, data.color);
    }).filter(v => !!v) as Project[];
}
