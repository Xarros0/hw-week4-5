import {Cat, User, UserInput} from '../../types/DBTypes';
import fetchData from '../../functions/fetchData';
import {UserResponse} from '../../types/MessageTypes';
import {MyContext} from '../../types/MyContext';
import {isAdmin, isLoggedIn} from '../../functions/authorize';

export default {
  Cat: {
    owner: async (parent: Cat) => {
      return await fetchData<User>(
        `${process.env.AUTH_URL}/users/` + parent.owner,
      );
    },
  },
  Query: {
    users: async () => {
      return await fetchData<User[]>(`${process.env.AUTH_URL}/users`);
    },
    userById: async (_parent: undefined, args: {id: string}) => {
      console.log('args', args.id);
      return await fetchData<User>(`${process.env.AUTH_URL}/users/` + args.id);
    },
    checkToken: async (_parent: undefined, args: {}, context: MyContext) => {
      return await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/token`,
        {
          headers: {
            Authorization: `Bearer ${context.userdata?.token}`,
          },
        },
      );
    },
  },
  Mutation: {
    login: async (
      _parent: undefined,
      args: {credentials: {username: string; password: string}},
    ) => {
      return await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(args.credentials),
        },
      );
    },
    register: async (_parent: undefined, args: {user: UserInput}) => {
      return await fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.user),
      });
    },
    updateUser: async (
      _parent: undefined,
      args: {user: UserInput},
      context: MyContext,
    ) => {
      isLoggedIn(context);
      return await fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${context.userdata?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args.user),
      });
    },
    deleteUser: async (_parent: undefined, args: {}, context: MyContext) => {
      isLoggedIn(context);
      return await fetchData<UserResponse>(`${process.env.AUTH_URL}/users`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${context.userdata?.token}`,
        },
      });
    },
    updateUserAsAdmin: async (
      _parent: undefined,
      args: {user: UserInput; id: string},
      context: MyContext,
    ) => {
      isAdmin(context);
      return await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/` + args.id,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${context.userdata?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(args.user),
        },
      );
    },
    deleteUserAsAdmin: async (
      _parent: undefined,
      args: {id: string},
      context: MyContext,
    ) => {
      isAdmin(context);
      return await fetchData<UserResponse>(
        `${process.env.AUTH_URL}/users/` + args.id,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${context.userdata?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({id: args.id}),
        },
      );
    },
  },
};

// TODO: create resolvers based on user.graphql
// note: when updating or deleting a user don't send id to the auth server, it will get it from the token. So token needs to be sent with the request to the auth server
// note2: when updating or deleting a user as admin, you need to send user id (dont delete admin btw) and also check if the user is an admin by checking the role from the user object form context
