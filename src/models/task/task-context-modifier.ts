import Task from "~src/models/task/index";

export class TaskContextModifier {
    private readonly task: Task;
    private readonly group: Task[];

    constructor(task: Task, group: Task[]) {
        this.task = task;
        this.group = group;
    }

    public isParent(): boolean {
        for (let i = 0; i < this.group.length; i++)
            if (this.group[i].parentTaskId === this.task.id)
                return true;
        return false;
    }

    public isCompletedTree(): boolean {
        const children = this.getChildrenTasks();
        if (children.length === 0) return this.task.isCompleted;
        if (this.task.progress && this.task.progress.length > 0)
            return this.task.isCompleted && children.every(t => t.isCompleted);
        return children.every(t => t.isCompleted);
    }

    public deleteTree(): void {
        this.task.delete().then();
        for (const t of this.getChildrenTasks()) t.delete().then();
        this.popTaskTreeFromGroup();
    }

    private getChildrenTasks(): Task[] {
        const childrenTasks: Task[] = [];
        for (let i = 0; i < this.group.length; i++)
            if (this.group[i].parentTaskId === this.task.id)
                childrenTasks.push(this.group[i]);
        return childrenTasks;
    }

    private getParentTasks(): Task[] {
        const parents = [];
        let parentId = this.task.parentTaskId;
        while (parentId) {
            // eslint-disable-next-line no-loop-func
            const parent = this.group.find(v => v.id === parentId);
            if (!parent) return parents;
            parents.push(parent);
            parentId = parent.parentTaskId;
        }
        return parents;
    }

    private hasSiblings(): boolean {
        if (!this.task.parentTaskId) return false;
        for (let i = 0; i < this.group.length; i++)
            if (this.group[i].parentTaskId === this.task.parentTaskId && this.group[i].id !== this.task.id)
                return true;
        return false;
    }

    private isOnlyChild(): boolean {
        return !this.hasSiblings() && !!this.task.parentTaskId;
    }

    private popTaskTreeFromGroup(additionalPop?: Task[]) {
        const childrenTasks = this.getChildrenTasks();
        for (let i = this.group.length - 1; i >= 0; i--)
            if (childrenTasks.includes(this.group[i])
                || additionalPop?.includes(this.group[i])
                || this.group[i].id === this.task.id)
                this.group.splice(i, 1);
    }
}
