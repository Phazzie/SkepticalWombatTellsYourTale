export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/api/projects/:path*', '/api/transcribe'],
};
