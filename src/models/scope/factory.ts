import Scope, { ScopeDraft } from "~src/models/scope/index";
import { doc, setDoc } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";

export function createScope(draft: ScopeDraft): Scope {
    const scope = new Scope(draft.id, draft);
    setDoc(doc(userDoc(), "scopes", draft.id).withConverter(Scope.converter), scope).then();
    return scope;
}
