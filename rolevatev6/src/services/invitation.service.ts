import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

// GraphQL Queries and Mutations
const GET_INVITATION = gql`
  query GetInvitation($code: String!) {
    getInvitation(code: $code) {
      id
      code
      email
      companyId
      status
      expiresAt
      createdAt
    }
  }
`;

const GET_COMPANY = gql`
  query GetCompany($id: ID!) {
    company(id: $id) {
      id
      name
      logo
      industry
      website
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      userType
    }
  }
`;

const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($code: String!) {
    acceptCompanyInvitation(code: $code) {
      id
      code
      status
      usedAt
      companyId
    }
  }
`;

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      access_token
      user {
        id
        email
        name
        userType
      }
    }
  }
`;

export interface Invitation {
  id: string;
  code: string;
  email: string | null;
  companyId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
}

export interface CreateUserInput {
  userType: 'BUSINESS' | 'CANDIDATE';
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
}

// GraphQL Response Types
interface GetInvitationResponse {
  getInvitation: Invitation;
}

interface GetCompanyResponse {
  company: Company;
}

interface CreateUserResponse {
  createUser: {
    id: string;
    email: string;
    name: string;
    userType: string;
  };
}

interface LoginMutationResponse {
  login: LoginResponse;
}

interface AcceptInvitationResponse {
  acceptCompanyInvitation: Invitation;
}

export const getInvitation = async (code: string): Promise<Invitation> => {
  try {
    const { data } = await apolloClient.query<GetInvitationResponse>({
      query: GET_INVITATION,
      variables: { code },
      fetchPolicy: 'network-only',
    });

    if (!data?.getInvitation) {
      throw new Error('Invitation not found');
    }

    return data.getInvitation;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch invitation');
  }
};

export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const { data } = await apolloClient.query<GetCompanyResponse>({
      query: GET_COMPANY,
      variables: { id },
      fetchPolicy: 'network-only',
    });

    if (!data?.company) {
      throw new Error('Company not found');
    }

    return data.company;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to fetch company');
  }
};

export const createUser = async (input: CreateUserInput): Promise<any> => {
  try {
    const { data } = await apolloClient.mutate<CreateUserResponse>({
      mutation: CREATE_USER,
      variables: { input },
    });

    if (!data?.createUser) {
      throw new Error('Failed to create user');
    }

    return data.createUser;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to create user');
  }
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const { data } = await apolloClient.mutate<LoginMutationResponse>({
      mutation: LOGIN,
      variables: {
        input: { email, password },
      },
    });

    if (!data?.login) {
      throw new Error('Login failed');
    }

    return data.login;
  } catch (error: any) {
    throw new Error(error?.message || 'Login failed');
  }
};

export const acceptCompanyInvitation = async (code: string, accessToken: string): Promise<Invitation> => {
  try {
    const { data } = await apolloClient.mutate<AcceptInvitationResponse>({
      mutation: ACCEPT_INVITATION,
      variables: { code },
      context: {
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      },
    });

    if (!data?.acceptCompanyInvitation) {
      throw new Error('Failed to accept invitation');
    }

    return data.acceptCompanyInvitation;
  } catch (error: any) {
    throw new Error(error?.message || 'Failed to accept invitation');
  }
};
