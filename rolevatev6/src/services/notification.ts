// Notification service
import { apolloClient } from '@/lib/apollo';
import { gql } from '@apollo/client';

export interface Notification {
  id: string;
  type: 'application' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    myNotifications {
      id
      type
      title
      message
      read
      createdAt
    }
  }
`;

const MARK_AS_READ = gql`
  mutation MarkAsRead($id: String!) {
    markNotificationAsRead(id: $id) {
      id
    }
  }
`;

const MARK_ALL_AS_READ = gql`
  mutation MarkAllAsRead {
    markAllNotificationsAsRead {
      success
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: String!) {
    deleteNotification(id: $id) {
      id
    }
  }
`;

export const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await apolloClient.query({
    query: GET_NOTIFICATIONS,
    fetchPolicy: 'network-only'
  });
  return (data as any)?.myNotifications || [];
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await apolloClient.mutate({
    mutation: MARK_AS_READ,
    variables: { id }
  });
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apolloClient.mutate({
    mutation: MARK_ALL_AS_READ
  });
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apolloClient.mutate({
    mutation: DELETE_NOTIFICATION,
    variables: { id }
  });
};
