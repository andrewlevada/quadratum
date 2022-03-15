import Project from "~services/project";
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc } from "@firebase/firestore";
import { userDoc } from "~services/tools";

export async function postProject(project: Project): Promise<Project> {
    const snap = await addDoc(collection(userDoc(), "projects").withConverter(Project.converter), project);
    return new Project(snap.id, project);
}

export async function fetchProjectById(id: string): Promise<Project> {
    const snap = await getDoc(doc(userDoc(), "projects", id).withConverter(Project.converter));
    return snap.data() || Promise.reject();
}

export function updateProject(project: Partial<Project> & { id: string }): Promise<void> {
    // Don't use updateDoc() - it does not work with convertors!
    return setDoc(doc(userDoc(), "projects", project.id).withConverter(Project.converter), project, { merge: true }).then();
}

export async function fetchAllProjects(): Promise<Project[]> {
    const q = query(collection(userDoc(), "projects").withConverter(Project.converter), orderBy("label"));
    const docs = await getDocs(q);
    const snaps = docs.docs;
    return snaps.map(snap => snap.data());
}
