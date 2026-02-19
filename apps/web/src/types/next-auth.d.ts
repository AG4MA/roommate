import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    avatar: string | null;
  }
}
