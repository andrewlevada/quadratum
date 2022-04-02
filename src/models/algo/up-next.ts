import Task from "~src/models/task";
import { limit, query, QueryConstraint, where } from "@firebase/firestore";
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

async function queryTasksForGroups(groups: QueryConstraint[][]): Promise<Task[]> {
    return Promise.all(groups.map(
        constraint => fetchTasksWithFilter(baseConstraints.concat(constraint), true),
    )).then(results => results.reduce((acc: Task[], cur) => acc.concat(cur.filter(t => t.sessions > 0)), []))
        .then(tasks => filter(tasks, hasNoChildren));
}

function hasNoChildren(task: Task): Promise<boolean> {
    return fetchTasksWithFilter([where("parentTaskId", "==", task.id), limit(1)])
        .then(tasks => tasks.length === 0);
}

async function filter<T>(arr: Array<T>, callback: (item: T) => Promise<boolean>): Promise<T[]> {
    const fail = Symbol()
    return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail)))
        .filter(i=>i!==fail) as T[];
}
