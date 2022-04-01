const millsInDay = 86400000;

export function timestampToRelativeString(time: number) {
    const now = new Date();
    const then = new Date(time);
    const diff = then.getTime() - now.getTime();
    const dayDiff = diff / millsInDay;

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
