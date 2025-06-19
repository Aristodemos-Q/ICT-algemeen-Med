/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
  // Temporarily disable middleware to debug login flow
  return NextResponse.next();
  
  // Check for Supabase session cookies
  const sessionCookie = request.cookies.get('sb-cumsctqzjowisphyhnfj-auth-token') || 
                       request.cookies.get('supabase-auth-token') ||
                       request.cookies.get('sb-auth-token');
  
  // Controleer of de gebruiker is ingelogd
  if (!sessionCookie) {
    // Indien niet ingelogd en de pagina vereist authenticatie, redirect naar login
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
    // Indien ingelogd en op de login pagina, redirect naar trainer dashboard
  if (sessionCookie && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard/trainer-dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configureer welke paden moeten worden gecontroleerd door de middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
