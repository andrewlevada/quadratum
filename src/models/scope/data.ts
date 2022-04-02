import Scope from "~src/models/scope/index";
import { fetchAllModels, fetchModelById, postModel, updateModel } from "~src/models/data";

export function postScope(scope: Scope): Promise<Scope> {
    return postModel(Scope, "scopes", scope);
}

export async function fetchScopeById(id: string): Promise<Scope> {
    return fetchModelById(Scope, "scopes", id);
}

export function updateScope(scope: Partial<Scope> & { id: string }): Promise<void> {
    return updateModel(Scope, "scopes", scope);
}

export async function fetchAllPScopes(): Promise<Scope[]> {
    return fetchAllModels(Scope, "scopes", "label");
}
