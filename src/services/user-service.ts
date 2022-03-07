import { doc, getDoc, setDoc } from "@firebase/firestore";
import Sprint from "~services/sprint";
import List from "~services/list";
import { db, userId } from "~services/tools";

interface UserInfo {
    dailyListId: string;
}

export function initializeUser(): Promise<void> {
    return Sprint.createAndAppend()
        .then(() => Sprint.createAndAppend())
        .then(() => List.create())
        .then(list => setDoc(doc(db(), "users", userId()), {
            userInfo: { dailyListId: list.id },
        }));
}

export function getDailyListId(): Promise<string> {
    return getDoc(doc(db(), "users", userId()))
        .then(snap => snap.data() as UserInfo)
        .then(userInfo => userInfo.dailyListId);
}
