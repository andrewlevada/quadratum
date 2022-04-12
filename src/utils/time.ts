import { formatISO, parseISO } from "date-fns";

const millsInDay = 86400000;

export function dateToDisplayString(date: Date): string {
    const dayDiff = getDayDiffFromNow(date);
    if (dayDiff >= -1) {
        if (dayDiff < 0) return "Yesterday";
        if (dayDiff < 1) return "Today";
        if (dayDiff < 2) return "Tomorrow";
    }

    return date.toDateString().split(" ").slice(0, 3).join(" ");
}

export function timestampToRelativeString(time: number) {
    const dayDiff = getDayDiffFromNow(new Date(time));

    if (dayDiff < 0) {
        if (dayDiff >= -2) return "Overdue";
        return "Very overdue";
    }

    if (dayDiff <= 1) return "Today";
    if (dayDiff <= 2) return "Tomorrow";
    if (dayDiff <= 3) return "In 3 days";
    if (dayDiff <= 7) return "This week";
    return `In ${Math.round(dayDiff)} days`;
}

export function getDayTimestamp(dayDelta?: number) {
    const day = new Date(new Date().getTime() + (dayDelta || 0) * millsInDay);
    day.setHours(24, 0, 0, 0);
    return day.getTime();
}

function getDayDiffFromNow(date: Date): number {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return diff / millsInDay;
}

export function hasChangedISO(value: Date | undefined, oldValue: Date | undefined): boolean {
    if (value === undefined || oldValue === undefined)
        return !(value === undefined && oldValue === undefined);
    return formatISO(value) != formatISO(oldValue);
}

export const ISOConverter = {
    fromAttribute(value: string) {
        return value ? parseISO(value) : undefined;
    },
    toAttribute(value: Date | undefined) {
        return value ? formatISO(value) : undefined;
    },
}
