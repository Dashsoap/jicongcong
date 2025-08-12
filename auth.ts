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
          // 验证输入数据
          const { username, password } = loginSchema.parse(credentials)
          
          // 首先尝试从数据库查找用户
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: username },
                { name: username }
              ]
            }
          })
          
          // 如果数据库中没有找到，使用模拟用户数据
          if (!dbUser) {
            const mockUser = users.find(u => u.username === username || u.email === username)
            if (!mockUser || mockUser.password !== password) {
              console.log(`登录失败：用户名 ${username} 不存在或密码错误`)
              return null
            }
            
            // 创建或更新数据库中的用户
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
          } else {
            // 验证密码（这里简化处理，实际应该使用加密密码）
            const mockUser = users.find(u => u.email === dbUser!.email)
            if (!mockUser || mockUser.password !== password) {
              console.log(`登录失败：用户名 ${username} 密码错误`)
              return null
            }
          }
          
          console.log(`登录成功：用户 ${dbUser.name} (${dbUser.email})`)
          
          // 返回用户信息（不包含敏感信息）
          return {
            id: dbUser.id,
            name: dbUser.name || '',
            email: dbUser.email,
            role: dbUser.role,
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
