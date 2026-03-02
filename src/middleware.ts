import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public route prefixes that never need authentication
const PUBLIC_PREFIXES = [
    '/_next', '/api', '/product', '/category', '/shop', '/cart',
    '/search', '/about', '/contact', '/faq', '/terms', '/privacy',
    '/cookies', '/refunds', '/shipping', '/blog', '/careers',
    '/stores', '/security',
];

function isPublicRoute(pathname: string): boolean {
    if (pathname === '/') return true;
    return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone()
    const isAuthRoute = url.pathname.startsWith('/login')

    // Fast-path: skip Supabase auth call entirely for public routes (except /login)
    if (isPublicRoute(url.pathname) && !isAuthRoute) {
        return NextResponse.next({ request })
    }

    // Only create Supabase client for protected routes
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    let user = null;
    try {
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch {
        // If Supabase is unreachable, treat as unauthenticated
    }

    const isOnboardingRoute = url.pathname.startsWith('/onboarding')

    // If user is logged in and tries to access /login, redirect to home
    if (user && isAuthRoute) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    if (!user && !isAuthRoute) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        // Check if user is onboarded and get their role
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_onboarded, role')
            .eq('id', user.id)
            .single()

        const isOnboarded = profile?.is_onboarded ?? false

        if (!isOnboarded && !isOnboardingRoute) {
            url.pathname = '/onboarding'
            return NextResponse.redirect(url)
        }

        if (isOnboarded && isOnboardingRoute) {
            url.pathname = '/'
            return NextResponse.redirect(url)
        }

        // Protect admin routes
        if (url.pathname.startsWith('/admin')) {
            if (profile?.role !== 'admin') {
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // Protect picker routes - only pickers and admins can access
        if (url.pathname.startsWith('/picker')) {
            if (profile?.role !== 'admin' && profile?.role !== 'delivery') {
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }

        // Protect rider/delivery routes - only delivery personnel and admins can access
        if (url.pathname.startsWith('/rider')) {
            if (profile?.role !== 'admin' && profile?.role !== 'delivery') {
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
