import { triggerScrape } from "./index.js";

const res = {
  status(code: number) {
    console.log(`Status: ${code}`);
    return this;
  },
  json(payload: any) {
    console.log("Returned JSON:");
    console.dir(payload, { depth: null });
  },
} as any;

triggerScrape(res);
