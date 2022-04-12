import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import {
    addDays,
    addMonths,
    differenceInCalendarDays,
    endOfMonth,
    endOfWeek,
    formatISO,
    getDate,
    intlFormat,
    isSameDay,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    subMonths,
} from "date-fns";
import scopedStyles from "./styles.lit.scss";
import "@material/mwc-icon-button";
import { hasChangedISO, ISOConverter } from "~utils/time";
import { componentStyles } from "~src/global";

@customElement("lit-datetime-picker-calendar")
export class Calendar extends LitElement {
    @property({ converter: ISOConverter, hasChanged: hasChangedISO }) value: Date = new Date();

    @state({ hasChanged() { return true; } })
    protected currentMonth: Date = new Date();

    get weeks(): {
        isToday: boolean;
        isSelected: boolean;
        isOutOfMonth: boolean;
        date: Date;
    }[][] {
        const first = startOfWeek(startOfMonth(new Date(this.currentMonth)), {
            weekStartsOn: 1,
        });
        const last = endOfWeek(endOfMonth(new Date(this.currentMonth)), {
            weekStartsOn: 1,
        });

        const sortedByWeeks: { [key: string]: Array<{}> } = {};
        let current = first;
        do {
            const index = formatISO(
                startOfWeek(current, { weekStartsOn: 1 })
            );
            if (!sortedByWeeks[index]) {
                sortedByWeeks[index] = [];
            }
            sortedByWeeks[index].push({
                isToday: differenceInCalendarDays(current, new Date()) == 0,
                isSelected: this.value && isSameDay(this.value, current),
                isOutOfMonth: !isSameMonth(current, this.currentMonth),
                date: current,
            });
            current = addDays(new Date(current), 1);
        } while (current <= last || Object.keys(sortedByWeeks).length < 6);

        return Object.keys(sortedByWeeks).reduce(
            (weeks, current) => [...weeks, sortedByWeeks[current]],
            [] as any
        );
    }

    dayClick(day: Date) {
        this.dispatchEvent(new CustomEvent("input", { detail: day }));
    }

    render() {
        return html`
            <div class="container flex col gap">
                <div class="flex row align-center justify-between">
                    <mwc-icon-button icon="chevron_left" @click=${() => {
                        this.currentMonth = subMonths(this.currentMonth, 1);
                    }}></mwc-icon-button>

                    <div>
                        ${intlFormat(this.currentMonth, {
                            month: "long",
                            year: "numeric",
                        })}
                    </div>

                    <mwc-icon-button icon="chevron_right" @click=${() => {
                        this.currentMonth = addMonths(this.currentMonth, 1);
                    }}></mwc-icon-button>
                </div>

                <div>
                    <div class="flex row align-center justify-between">
                        ${this.weeks[1]?.map(day => intlFormat(day.date, { weekday: "narrow" })).map(day => html`
                            <div class="cell header">${day}</div>
                        `)}
                    </div>

                    ${this.weeks.map(week => html`
                        <div class="flex row align-center justify-between">
                            ${week.map(day => html`
                                <div class="cell flex row justify-center">
                                    ${!day.isOutOfMonth ? html`
                                        <div @click=${() => this.dayClick(day.date)}
                                             class="day flex row justify-center ${classMap(
                                                     { "today": day.isToday, "selected": day.isSelected }
                                             )}">
                                            ${getDate(day.date)}
                                        </div>
                                    ` : null}
                                </div>`
                            )}
                        </div>`
                    )}
                </div>
            </div>
        `;
    }

    static styles = [...componentStyles, scopedStyles];
}
