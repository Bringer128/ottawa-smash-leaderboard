import  functions from '@google-cloud/functions-framework';

import {scrape} from './scrape.js'

// Register an HTTP function with the Functions Framework
functions.http('myHttpFunction', async (req, res) => {
  const userProfile = await scrape('BRGR#785');

  // Send an HTTP response
  res.send(JSON.stringify(userProfile));
});