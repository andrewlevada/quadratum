import { ScopeDraft } from "~src/models/scope/index";
import { fetchAllScopes } from "~src/models/scope/data";
import { createScope } from "~src/models/scope/factory";

export default async function syncScopes(drafts: ScopeDraft[]): Promise<void> {
    const scopes = await fetchAllScopes();
    const newIds = new Set(drafts.map(d => d.id));
    const draftsMap = new Map(drafts.map(d => [d.id, d]));

    const promises = [];

    for (const scope of scopes) {
        if (!newIds.has(scope.id)) {
            scope.isArchived = true;
            scope.isPinned = false;
            continue;
        }

        promises.push(scope.edit(draftsMap.get(scope.id)!));
        newIds.delete(scope.id);
    }

    for (const id of newIds.keys())
        promises.push(createScope(draftsMap.get(id)!));

    return Promise.all(promises).then();
}
