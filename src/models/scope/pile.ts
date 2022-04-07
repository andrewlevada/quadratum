import Scope from ".";

export default class PileScope extends Scope {
    public constructor() {
        super("pile", {
            label: "Pile",
            parentIds: ["root"],
            symbol: "inbox",
            isPinned: true,
            isArchived: false,
        });
    }
}
