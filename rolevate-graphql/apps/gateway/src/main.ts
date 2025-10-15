import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

async function bootstrap() {
  // For now, create a simple gateway without federation
  // We'll add federation later when subgraphs are properly configured
  const server = new ApolloServer({
    typeDefs: `
      type Query {
        hello: String
        authHello: String
      }

      type Mutation {
        register(email: String!, password: String!, firstName: String!, lastName: String!): String
        login(email: String!, password: String!): String
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'Hello from Gateway!',
        authHello: async () => {
          // This would proxy to the auth service
          return 'Hello from Auth Service via Gateway!';
        }
      },
      Mutation: {
        register: async (_, args) => {
          // This would proxy to the auth service
          return 'User registered successfully via Gateway!';
        },
        login: async (_, args) => {
          // This would proxy to the auth service
          return 'jwt-token-here';
        }
      }
    }
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 3000 },
  });

  console.log(`🚀 Gateway ready at ${url}`);
}

bootstrap();
