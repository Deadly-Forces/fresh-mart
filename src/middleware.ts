import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        // and allow access to public routes
    }

    const url = request.nextUrl.clone()
    const isAuthRoute = url.pathname.startsWith('/login')
    const isOnboardingRoute = url.pathname.startsWith('/onboarding')

    // Public routes that don't need auth check
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname === '/' ||
        url.pathname.startsWith('/product') ||
        url.pathname.startsWith('/category') ||
        url.pathname.startsWith('/shop') ||
        url.pathname.startsWith('/cart') ||
        url.pathname.startsWith('/search') ||
        url.pathname.startsWith('/checkout')
    ) {
        // If user is logged in and tries to access /login, redirect to home
        if (user && isAuthRoute) {
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    if (!user && !isAuthRoute) {
        // Redirect unauthenticated users to login if they try to access protected routes
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
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
