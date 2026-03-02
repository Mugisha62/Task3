import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: createHttpLink({
    uri: "http://localhost:5000/graphql"
  }),
  cache: new InMemoryCache()
});

export default client;