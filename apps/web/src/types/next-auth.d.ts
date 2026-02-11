import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
      role: 'landlord' | 'tenant';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: 'landlord' | 'tenant';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'landlord' | 'tenant';
    avatar: string | null;
  }
}
