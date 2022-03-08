import Project from "~services/project";
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";

export async function postProject(project: Project): Promise<Project> {
    const snap = await addDoc(collection(userDoc(), "projects").withConverter(Project.converter), project);
    return new Project(snap.id, project);
}

export async function fetchProjectById(id: string): Promise<Project> {
    const snap = await getDoc(doc(userDoc(), "projects", id).withConverter(Project.converter));
    return snap.data() || Promise.reject();
}

export function updateProject(project: Project): Promise<void> {
    return setDoc(doc(userDoc(), "projects", project.id).withConverter(Project.converter), project).then();
}

export async function fetchAllProjects(): Promise<Project[]> {
    const q = await getDocs(collection(userDoc(), "projects").withConverter(Project.converter));
    const snaps = q.docs;
    return snaps.map(snap => snap.data());
}
