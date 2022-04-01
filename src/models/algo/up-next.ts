import Task from "~src/models/task";
import { QueryConstraint, where } from "@firebase/firestore";
import { getDayTimestamp } from "~utils/time";
import { fetchTasksWithFilter } from "~src/models/task/data";

const baseConstraints = [
    where("isCompleted", "==", false),
];

export default function getUpNextTasks(): Promise<Task[]> {
    return queryTasksForGroups([
        [where("wasActive", "==", true)],
        [where("isStarted", "==", true)],
        [where("dueDate", "<=", getDayTimestamp())],
    ]);
}

export function getMoreUpNextTasks(): Promise<Task[]> {
    return queryTasksForGroups([
        [
            where("dueDate", ">", getDayTimestamp()),
            where("dueDate", "<=", getDayTimestamp(3)),
        ],
        // TODO: add condition for milestones
    ]);
}

function queryTasksForGroups(groups: QueryConstraint[][]): Promise<Task[]> {
    return Promise.all(groups.map(
        constraint => fetchTasksWithFilter(baseConstraints.concat(constraint), true),
    )).then(results => results.reduce((acc: Task[], cur) => acc.concat(cur.filter(t => t.sessions > 0)), []));
}
