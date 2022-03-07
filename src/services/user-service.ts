import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import Sprint from "~services/sprint";
import List from "~services/list";
import { db, userDoc, userId } from "~services/tools";

export interface UserDocument {
    dailyListId: string;
    lastSprintNumber: number;
}

export function initializeUser(userUid: string): Promise<void> {
    localStorage.setItem("fb_user_uid", userUid);
    return setDoc(userDoc(), { lastSprintNumber: 0 } as UserDocument)
        .then(() => Sprint.createAndAppend())
        .then(() => Sprint.createAndAppend())
        .then(() => List.create())
        .then(list => updateDoc(doc(db(), "users", userId()), {
            dailyListId: list.id,
        } as Partial<UserDocument>));
}

export function getDailyListId(): Promise<string> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserDocument)
        .then(userInfo => userInfo.dailyListId);
}
