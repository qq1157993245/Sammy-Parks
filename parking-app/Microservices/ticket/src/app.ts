import express, { Express } from 'express';
import path from 'path';
import { createHandler } from 'graphql-http/lib/use/express';
import expressPlayground from 'graphql-playground-middleware-express';
import 'reflect-metadata'; // Required for type-graphql
import { buildSchema } from 'type-graphql';

import { resolvers } from './resolvers';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: resolvers,
    validate: true,
    emitSchemaFile: {
      path: path.resolve(__dirname, '../build/schema.gql'),
      sortedSchema: true,
    },
  });

  app.use(
    '/graphql',
    createHandler({
      schema,
      context: (req) => ({ headers: req.headers }),
    })
  );

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
}

export { app, bootstrap };
