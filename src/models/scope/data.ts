import Scope from "~src/models/scope/index";
import {
    fetchAllModels,
    listenForAllModels, listenForModelById,
    listenForModelsWithFilter,
    updateModel
} from "~src/models/data";
import { QueryConstraint, Unsubscribe } from "@firebase/firestore";
import { Callback } from "~utils/types";

export function listenForScopeById(id: string, callback: Callback<Scope>): Unsubscribe {
    return listenForModelById(Scope, "scopes", id, callback);
}

export function listenForAllScopes(callback: Callback<Scope[]>): Unsubscribe {
    return listenForAllModels(Scope, "scopes", "label", callback);
}

export function listenForScopesWithFilter(constraints: QueryConstraint[], callback: Callback<Scope[]>): Unsubscribe {
    return listenForModelsWithFilter(Scope, "scopes", callback, constraints);
}

export function updateScope(scope: Partial<Scope> & { id: string }): Promise<void> {
    return updateModel(Scope, "scopes", scope);
}

export async function fetchAllScopes(): Promise<Scope[]> {
    return fetchAllModels(Scope, "scopes", "label");
}
