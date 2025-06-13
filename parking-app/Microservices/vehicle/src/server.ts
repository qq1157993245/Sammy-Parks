
// import dotenv from 'dotenv'
// dotenv.config()

import { app, bootstrap } from './app'

app.listen(5150, async () => {
  await bootstrap()
  console.log('Running a GraphQL Playground at http://localhost:5150/playground')
})