import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getAccessToken } from "../auth";
import { createClient as createWsClient } from "graphql-ws";
import { isSubscription } from "../../utils/helpers";

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
  return forward(operation);
});

const httpLink = concat(
  authLink,
  createHttpLink({ uri: "http://localhost:9000/graphql" })
);

const wsLink = new GraphQLWsLink(
  createWsClient({ url: "ws://localhost:9000/graphql" })
);

export const apolloClient = new ApolloClient({
  link: split(isSubscription, wsLink, httpLink),
  cache: new InMemoryCache(),
});
