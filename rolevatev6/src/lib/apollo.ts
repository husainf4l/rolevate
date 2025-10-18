import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { API_CONFIG } from './config';

const httpLink = new HttpLink({
  uri: `${API_CONFIG.API_BASE_URL}/graphql`,
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      accept: 'application/json',
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
