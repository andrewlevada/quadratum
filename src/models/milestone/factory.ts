import Milestone, { MilestoneDocument, MilestoneDraft } from "~src/models/milestone/index";
import { addDoc, collection } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";

export function createMilestone(draft: MilestoneDraft): Promise<Milestone> {
    const payload = {
        ...draft,
        totalSessions: 0,
        completedSessions: 0,
    } as MilestoneDocument;

    return addDoc(collection(userDoc(), "milestones"), payload).then(snap => {
        return new Milestone(snap.id, payload);
    });
}
