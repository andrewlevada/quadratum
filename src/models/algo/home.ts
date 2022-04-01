import Task from "~src/models/task";
import { fetchTasksWithFilter } from "~src/models/task/data";
import { where } from "@firebase/firestore";

export function getTasksCompletedToday(): Promise<Task[]> {
    return fetchTasksWithFilter([where("isInHome", "==", true)]);
}
