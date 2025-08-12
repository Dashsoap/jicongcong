import { auth } from "./auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 受保护的路由列表
const protectedRoutes = ["/ask", "/practice"]

// 需要教师权限的路由
const teacherRoutes = ["/teacher"]

// 公开路由列表（无需认证）
const publicRoutes = ["/", "/login", "/api/auth"]

export default auth((req: any) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 检查是否是 API 路由
  const isApiRoute = nextUrl.pathname.startsWith("/api")
  
  // 检查是否是认证相关路由
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname === "/login"
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  // 检查是否是教师路由
  const isTeacherRoute = teacherRoutes.some(route => nextUrl.pathname.startsWith(route))
  
  // 检查是否是公开路由
  const isPublicRoute = publicRoutes.some(route => 
    nextUrl.pathname === route || nextUrl.pathname.startsWith(route)
  )

  // 如果是 API 路由但不是认证路由，需要在 API 层面处理认证
  if (isApiRoute && !isAuthRoute) {
    // 对于需要认证的 API 路由，在各自的路由处理器中检查 auth
    return NextResponse.next()
  }

  // 如果是认证路由，已登录用户重定向到首页
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // 如果是受保护的路由但用户未登录，重定向到登录页
  if ((isProtectedRoute || isTeacherRoute) && !isLoggedIn) {
    const callbackUrl = nextUrl.pathname + nextUrl.search
    const loginUrl = new URL("/login", nextUrl)
    loginUrl.searchParams.set("callbackUrl", callbackUrl)
    
    console.log(`未认证用户访问受保护路由 ${nextUrl.pathname}，重定向到登录页`)
    return NextResponse.redirect(loginUrl)
  }
  
  // 如果是教师路由但用户不是教师，返回403
  if (isTeacherRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      console.log(`用户 ${req.auth?.user?.name} (角色: ${userRole}) 尝试访问教师路由 ${nextUrl.pathname}`)
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 其他情况放行
  return NextResponse.next()
})

export const config = {
  matcher: [
    // 匹配所有路径，除了静态文件和 Next.js 内部路径
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
