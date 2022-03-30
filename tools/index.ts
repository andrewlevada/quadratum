import { run } from "./db-modifier";

new Promise(resolve => {
    console.log("Starting");
    run().then(() => console.log("DONE"));
}).then();
