import express, { Express, Request } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Resolvers from './schema/resolver'
import http from "http";
import schema from './schema/schema';
import connectToMongoDB from './utils/database';

dotenv.config();

const app: Express = express();
const port = 3000;

// Mongodb function connection
connectToMongoDB();

async function startApolloServer(schema: any, resolvers: any) {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
        typeDefs: schema,
        resolvers,
        context: ({ req }: { req: Request }) => ({ req }), 
        //tell Express to attach GraphQL functionality to the server
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    }) as any;
    await server.start(); //start the GraphQL server.
    server.applyMiddleware({ app });
    await new Promise<void>((resolve) =>
        httpServer.listen({ port: port }, resolve) //run the server on port 3000
    );
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
}
//in the end, run the server and pass in our Schema and Resolver.
startApolloServer(schema, Resolvers);

// const server = new ApolloServer({
//     typeDefs,
//     resolvers
// })

// app.use("*", cors());

// server.start().then(() => {
//     server.applyMiddleware({ app });
// });
// server.start();
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}${server.graphqlPath}`);
// });