// import { isAuthenticated } from '@/utils/Auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import ROUTES, { AUTH, getBaseUrl } from './utils/utils';

// Define routes as constants
const DASHBOARD_ROUTE = '/dashboard';
const LOGIN_ROUTE = '/login';

export default function middleware(req: NextRequest) {
  const pathName = req.nextUrl.pathname;
  // check authentication
  let isAuthenticated = req.cookies.has(AUTH.PBPARTNER);
  const basePath = getBaseUrl(pathName);
  switch (basePath) {
    case ROUTES.PBADMIN: {
      isAuthenticated = req.cookies.has(AUTH.PBADMIN);
      break;
    }
    case ROUTES.PBPARTNER: {
      isAuthenticated = req.cookies.has(AUTH.PBPARTNER);
      break;
    }
    case ROUTES.PBENTERPRISE: {
      isAuthenticated = req.cookies.has(AUTH.PBENTERPRISE);
      break;
    }
    case ROUTES.ENTERPRISE: {
      isAuthenticated = req.cookies.has(AUTH.ENTERPRISE);
      break;
    }
  }
  // Include all subroutes under DASHBOARD_ROUTE as protected routes
  const protectedRoutes = [
    `/${basePath}${DASHBOARD_ROUTE}/*`,
    `/${basePath}${DASHBOARD_ROUTE}`,
  ];

  // Define login routes
  const loginRoutes = `/${basePath}${LOGIN_ROUTE}`;

  try {
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathName.startsWith(route)
    );

    // Already login then redirect to dashboard
    if (isAuthenticated && pathName === loginRoutes) {
      const absoluteURL = new URL(
        `/${basePath}${DASHBOARD_ROUTE}`,
        req.nextUrl.origin
      );
      return NextResponse.redirect(absoluteURL.toString());
    }

    // if user enter base url then redirect login and dashbord
    if (
      pathName == `/${ROUTES.PBADMIN}` ||
      pathName == `/${ROUTES.PBPARTNER}` ||
      pathName == `/${ROUTES.PBENTERPRISE}` ||
      pathName == `/${ROUTES.ENTERPRISE}`
    ) {
      if (isAuthenticated) {
        const absoluteURL = new URL(
          `/${basePath}${DASHBOARD_ROUTE}`,
          req.nextUrl.origin
        );
        return NextResponse.redirect(absoluteURL.toString());
      } else {
        const absoluteURL = new URL(
          `/${basePath}${LOGIN_ROUTE}`,
          req.nextUrl.origin
        );
        return NextResponse.redirect(absoluteURL.toString());
      }
    }

    // user enter Procted and not login then redirect to login
    if (!isAuthenticated && isProtectedRoute) {
      const absoluteURL = new URL(
        `/${basePath}${LOGIN_ROUTE}`,
        req.nextUrl.origin
      );
      return NextResponse.redirect(absoluteURL.toString());
    }

    return NextResponse.next();
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!^/?$|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|firebase-messaging-sw.js).*)',
  ],
};
