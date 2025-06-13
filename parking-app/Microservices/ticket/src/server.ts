// import path from 'path'
// import dotenv from 'dotenv'
// dotenv.config({
//   path: path.resolve(__dirname, '../../../.env')
// })

import { app, bootstrap } from './app'

app.listen(5100, async () => {
  await bootstrap()
  console.log('Running a GraphQL Playground at http://localhost:5100/playground')
})