import { GraphQLClient } from 'graphql-request';

const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL;

if (!SUBGRAPH_URL) {
  throw new Error('NEXT_PUBLIC_SUBGRAPH_URL is not defined in environment variables');
}

export const graphqlClient = new GraphQLClient(SUBGRAPH_URL);
