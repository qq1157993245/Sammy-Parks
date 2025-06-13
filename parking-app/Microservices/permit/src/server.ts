import {app, bootstrap} from './app'

const PORT = 5050;
app.listen(PORT, async () => {
  await bootstrap()
  console.log(`Permit service running on port ${PORT}`);
  console.log('Running a GraphQL Playground at http://localhost:5050/playground')
});
