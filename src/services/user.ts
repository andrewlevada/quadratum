import { getDoc, onSnapshot, setDoc, Unsubscribe } from "@firebase/firestore";
import { userDoc } from "../models/tools";
import { Callback } from "~utils/types";

export interface OAuthData {
    accessToken: string;
    expiresIn: string;
    refreshToken: string;
}

export interface UserDocument {
    activeTaskId: string | null;
    figmaOAuth?: OAuthData | null;
    figmaMapUrl?: string;
}

export async function initializeUser(userUid: string): Promise<void> {
    localStorage.setItem("fb_user_uid", userUid);

    const d = await getDoc(userDoc());
    if (d.exists()) return;

    await setDoc(userDoc(), { activeTaskId: null } as UserDocument);
}

export function getUserInfo(): Promise<UserDocument> {
    return getDoc(userDoc()).then(snap => snap.data() as UserDocument);
}

export function listenForUserInfo(callback: Callback<UserDocument>): Unsubscribe {
    return onSnapshot(userDoc(), snap => callback(snap.data() as UserDocument));
}

export function setFigmaOAuth(data: OAuthData): Promise<void> {
    return setDoc(userDoc(), { figmaOAuth: data }, { merge: true });
}

export function setFigmaMapUrl(value: string): Promise<void> {
    return setDoc(userDoc(), { figmaMapUrl: value }, { merge: true });
}
