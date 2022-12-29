import functions from "@google-cloud/functions-framework";

import { register } from "./register.js";
import { recurringScrape } from "./recurring-scrape.js";

functions.http("register", register);
functions.cloudEvent("recurring-scrape", recurringScrape);
