import Task from "~src/models/task";
import { limit, QueryConstraint, Unsubscribe, where } from "@firebase/firestore";
import { getDayTimestamp } from "~utils/time";
import { fetchTasksWithFilter, listenToTasksWithFilter } from "~src/models/task/data";
import { Callback } from "~utils/types";

const baseConstraints = [
    where("isCompleted", "==", false),
];

export default function listenToUpNextTasks(callback: Callback<Task[]>): Unsubscribe[] {
    return queryTasksForGroups([
        [where("wasActive", "==", true)],
        [where("isStarted", "==", true)],
        [where("dueDate", "<=", getDayTimestamp())],
    ], callback);
}

// export function getMoreUpNextTasks(): Promise<Task[]> {
//     return queryTasksForGroups([
//         [
//             where("dueDate", ">", getDayTimestamp()),
//             where("dueDate", "<=", getDayTimestamp(3)),
//         ],
//         // TODO: add condition for milestones
//     ]);
// }

function queryTasksForGroups(groups: QueryConstraint[][], masterCallback: Callback<Task[]>): Unsubscribe[] {
    const groupTasks: Record<string, Task[]> = {};
    const callback = (tasks: Task[], groupLabel: string) => {
        filter(tasks, hasNoChildren).then(filteredTasks => {
            groupTasks[groupLabel] = filteredTasks;
            masterCallback(Object.values(groupTasks).flat());
        });
    };

    return groups.map(constraints => listenToTasksWithFilter(baseConstraints.concat(constraints),
            tasks => callback(tasks.filter(t => t.sessions  > 0), JSON.stringify(constraints))));
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
