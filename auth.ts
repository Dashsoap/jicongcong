import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { prisma } from "./src/lib/prisma"

// 模拟用户数据库（实际应用中应该连接真实数据库）
const users = [
  {
    id: "1",
    email: "demo@example.com",
    username: "demo",
    password: "password", // 实际应用中应该是加密后的密码
    name: "演示用户",
    role: "STUDENT"
  },
  {
    id: "2", 
    email: "teacher@example.com",
    username: "teacher",
    password: "teacher123",
    name: "老师账号",
    role: "TEACHER"
  }
]

const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || 'fallback-dev-secret-key-change-in-production',
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        try {
          // 验证输入数据并做基础清洗
          const { username, password } = loginSchema.parse(credentials)
          const normalizedUsername = username.trim().toLowerCase()
          const normalizedPassword = password.trim()

          // 1) 优先校验内置演示账号，避免数据库异常导致“密码错误”误判
          const mockUser = users.find(u =>
            u.username.toLowerCase() === normalizedUsername ||
            u.email.toLowerCase() === normalizedUsername
          )

          if (!mockUser || mockUser.password !== normalizedPassword) {
            console.log(`登录失败：用户名 ${username} 不存在或密码错误`)
            return null
          }

          // 2) 尝试把演示账号写入/更新到数据库（失败也不影响登录）
          let dbUser = undefined as undefined | { id: string; name: string | null; email: string; role: any }
          try {
            dbUser = await prisma.user.upsert({
              where: { email: mockUser.email },
              update: {
                name: mockUser.name,
                role: mockUser.role as any
              },
              create: {
                email: mockUser.email,
                name: mockUser.name,
                role: mockUser.role as any
              }
            })
          } catch (dbError) {
            console.warn('登录成功但数据库不可用，使用内存用户信息继续：', dbError)
          }

          const resultUser = dbUser ?? {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role as any,
          }

          console.log(`登录成功：用户 ${resultUser.name} (${resultUser.email})`)

          // 返回用户信息（不包含敏感信息）
          return {
            id: resultUser.id,
            name: resultUser.name || '',
            email: resultUser.email,
            role: resultUser.role,
          }
        } catch (error) {
          console.error("认证过程中发生错误:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // 用户首次登录时，将用户信息存储到 JWT 中
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // 将 JWT 中的信息传递给 session
      if (token) {
        session.user.id = token.sub as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === "development",
})
