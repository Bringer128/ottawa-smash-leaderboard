import Firestore from '@google-cloud/firestore';
import  functions from '@google-cloud/functions-framework';

import {scrape} from './scrape.js'

const db = new Firestore();

// Register an HTTP function with the Functions Framework
functions.http('myHttpFunction', async (req, res) => {
  const userProfile = await scrape('BRGR#785');

  const collections = await db.listCollections();

  const response = {
    userProfile,
    collections
  }

  // Send an HTTP response
  res.send(JSON.stringify(response));
});