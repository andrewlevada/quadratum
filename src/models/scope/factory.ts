import Scope, { ScopeDocument } from "~src/models/scope/index";
import { doc, setDoc } from "@firebase/firestore";
import { userDoc } from "~src/models/tools";
import { DocumentDraft } from "~src/models/data";

export function createScope(draft: DocumentDraft<ScopeDocument>): Scope {
    setDoc(doc(userDoc(), "scopes", draft.id).withConverter(Scope.converter), draft as Partial<Scope>).then();
    return new Scope(draft.id, draft);
}
