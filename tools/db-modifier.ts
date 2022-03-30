/* eslint-disable import/no-extraneous-dependencies */
import { initializeApp, cert } from "firebase-admin/app";
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from "firebase-admin/firestore";
import { PendingTaskDocument } from "~src/models/task";
import { firestore } from "firebase-admin";
import FieldValue = firestore.FieldValue;

const certKey = `${__dirname}/firebaseServiceAccount.json`;
initializeApp({ credential: cert(certKey) });

const db = getFirestore();
const docs: PendingTaskDocument[] = [];

// Logic:

// export async function run() {
//     const userId = "TtSRqidQIBZ178DAVltmZgKZO7T2";
//     const tasks = db.collection(`users/${userId}/tasks`);
//     const snap = await tasks.get();
//
//     for (const doc of snap.docs) {
//         console.log(`Processing doc ${doc.id}`);
//         const data = doc.data() as PendingTaskDocument;
//         await doc.ref.set({
//             sessions: data.progress?.length || 0,
//             isCompleted: data.progress?.every(v => v) || false,
//             isDone: FieldValue.delete(),
//         }, { merge: true });
//         docs.push(data);
//     }
//
//     // writeFileSync(`${__dirname}/log.json`, JSON.stringify(docs));
// }
