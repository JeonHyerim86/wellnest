import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** 로그인 없이 접근 가능한 경로 */
const PUBLIC_PATHS = ["/login", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * 매 요청마다 Supabase 세션 쿠키를 갱신하고, 비로그인 사용자를 /login 으로 보낸다.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() 호출 사이에 다른 코드를 넣지 말 것 — 세션 갱신 타이밍이 어긋나 무작위 로그아웃이 발생한다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return redirectPreservingCookies(url, supabaseResponse);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return redirectPreservingCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}

/**
 * getUser() 가 리프레시 토큰을 회전시키면 갱신된 쿠키가 supabaseResponse 에만 실린다.
 * 새 NextResponse.redirect() 를 그냥 반환하면 그 쿠키가 버려져서 브라우저가
 * 이미 폐기된 리프레시 토큰을 들고 있게 되고, 다음 요청에서 강제 로그아웃된다.
 * 그래서 리다이렉트 응답에도 쿠키를 그대로 옮겨 싣는다.
 */
function redirectPreservingCookies(url: URL, from: NextResponse) {
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}
