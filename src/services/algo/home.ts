import Task from "~src/models/task";
import { listenToTasksWithFilter } from "~src/models/task/data";
import { orderBy, Unsubscribe, where } from "@firebase/firestore";

export function listenForTasksCompletedToday(callback: (tasks: Task[]) => void): Unsubscribe {
    return listenToTasksWithFilter([where("isInHome", "==", true), orderBy("text")], callback);
}
