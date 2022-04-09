import Scope, { ScopeDraft } from "~src/models/scope/index";
import { doc, setDoc } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";

export function createScope(draft: ScopeDraft): Scope {
    setDoc(doc(userDoc(), "scopes", draft.id).withConverter(Scope.converter), draft as Partial<Scope>).then();
    return new Scope(draft.id, draft);
}
