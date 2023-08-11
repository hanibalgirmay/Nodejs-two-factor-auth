import express, { Express, NextFunction, Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { ApolloError, ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import dotenv from 'dotenv';
import Resolvers from './schema/resolver'
import http from "http";
import Schema from './schema/schema';
import connectToMongoDB from './utils/database';
import { GraphQLError } from 'graphql';

dotenv.config();

const port = process.env.PORT;

// Mongodb function connection
connectToMongoDB();

async function startApolloServer(schema: any, resolvers: any) {
    const app: Express = express();
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
    // Error handling middleware for GraphQLError
    app.use((err: GraphQLError, req: Request, res: Response, next: NextFunction) => {
        if (err.originalError instanceof ApolloError) {
            // Handle Apollo-specific errors
            return res.status(err.originalError.statusCode).json({
                message: err.originalError.message,
                code: err.originalError.extensions?.code,
            });
        }

        // Handle other types of errors
        return res.status(500).json({
            message: err.message,
        });
    });
    await new Promise<void>((resolve) =>
        httpServer.listen({ port: port }, resolve) //run the server on port 3000
    );
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
}
//in the end, run the server and pass in our Schema and Resolver.
startApolloServer(Schema, Resolvers);