import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/sign-in',
  },
});

export const config = {
  matcher: ['/api/projects/:path*', '/api/transcribe', '/project/:path*', '/'],
};
