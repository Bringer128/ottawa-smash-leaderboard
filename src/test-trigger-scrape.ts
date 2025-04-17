import { triggerScrape } from "./index.js";

// Mock Response object with logging
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

// Run it
triggerScrape(res).catch(err => {
  console.error("❌ Error in triggerScrape:", err);
});
