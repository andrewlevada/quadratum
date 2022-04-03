import Scope from "~src/models/scope/index";
import { fetchAllModels, fetchModelById, updateModel } from "~src/models/data";

export async function fetchScopeById(id: string): Promise<Scope> {
    return fetchModelById(Scope, "scopes", id);
}

export function updateScope(scope: Partial<Scope> & { id: string }): Promise<void> {
    return updateModel(Scope, "scopes", scope);
}

export async function fetchAllScopes(): Promise<Scope[]> {
    return fetchAllModels(Scope, "scopes", "label");
}
