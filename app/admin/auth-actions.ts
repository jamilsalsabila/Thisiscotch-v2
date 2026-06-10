'use server'

import { loginAdmin, logoutAdmin } from '@/lib/admin-auth'

export async function loginAdminAction(formData: FormData) {
  await loginAdmin(formData)
}

export async function logoutAdminAction() {
  await logoutAdmin()
}
