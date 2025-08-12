/**
 * 权限控制工具
 * 用于检查用户角色和权限
 */

import { auth } from '../../auth'
import { Role } from '@prisma/client'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
}

/**
 * 获取当前认证用户
 * @returns 用户信息或 null
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth()
  if (!session?.user) return null
  
  return {
    id: session.user.id!,
    name: session.user.name!,
    email: session.user.email!,
    role: session.user.role as Role
  }
}

/**
 * 检查用户是否为学生
 * @param user 用户信息
 * @returns 是否为学生
 */
export function isStudent(user: AuthUser): boolean {
  return user.role === 'STUDENT'
}

/**
 * 检查用户是否为教师
 * @param user 用户信息
 * @returns 是否为教师
 */
export function isTeacher(user: AuthUser): boolean {
  return user.role === 'TEACHER'
}

/**
 * 检查用户是否为管理员
 * @param user 用户信息
 * @returns 是否为管理员
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN'
}

/**
 * 检查用户是否有教师或管理员权限
 * @param user 用户信息
 * @returns 是否有教师权限
 */
export function hasTeacherAccess(user: AuthUser): boolean {
  return isTeacher(user) || isAdmin(user)
}

/**
 * 要求用户已登录，否则抛出错误
 * @returns 用户信息
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

/**
 * 要求用户有教师权限，否则抛出错误
 * @returns 用户信息
 */
export async function requireTeacherAccess(): Promise<AuthUser> {
  const user = await requireAuth()
  if (!hasTeacherAccess(user)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

/**
 * 要求用户有管理员权限，否则抛出错误
 * @returns 用户信息
 */
export async function requireAdminAccess(): Promise<AuthUser> {
  const user = await requireAuth()
  if (!isAdmin(user)) {
    throw new Error('FORBIDDEN')
  }
  return user
}

