import { connectFirestore } from "./init";
import { collection, getDocs, setDoc } from "@firebase/firestore";
import { TaskDocument } from "~src/models/task";

const db = connectFirestore();
const userId = "TtSRqidQIBZ178DAVltmZgKZO7T2";
// transformUserTasks().then();

async function transformUserTasks() {
    console.log("Starting user tasks transformation");
    const snap = await getDocs(collection(db, `users/${userId}/tasks`));

    for (const d of snap.docs)
        setDoc(d.ref, {

        } as TaskDocument, { merge: true }).then();

    console.log("Done");
}
