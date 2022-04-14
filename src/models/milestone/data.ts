import { QueryConstraint, Unsubscribe } from "@firebase/firestore";
import { Callback } from "~utils/types";
import Milestone from "~src/models/milestone/index";
import { listenForModelsWithFilter } from "~src/models/data";

export function listenForMilestonesWithFilter(constraints: QueryConstraint[], callback: Callback<Milestone[]>): Unsubscribe {
    return listenForModelsWithFilter(Milestone, "milestones", callback, constraints);
}
