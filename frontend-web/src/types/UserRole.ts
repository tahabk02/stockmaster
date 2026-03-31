// src/types/UserRole.ts

export enum UserRole {
  // --- إدارة النظام (System Administration) ---
  SUPER_ADMIN = "SUPER_ADMIN", // صلاحيات كاملة على كل الشركات (Tenants)
  ADMIN = "ADMIN", // مدير النظام لشركة معينة

  // --- إدارة العمليات (Operations) ---
  MANAGER = "MANAGER", // مدير مخزن أو مبيعات
  STAFF = "STAFF", // مستخدم له صلاحيات محدودة (كاشير مثلاً)

  // --- نظام الـ Marketplace (New) ---
  VENDOR = "VENDOR", // بائع مستقل (عنده حانوت أو وكالة قطع غيار)
  USER = "USER", // زبون عادي (يشري قطع الغيار فقط)
}

/**
 * دالة مساعدة للتحقق من الصلاحيات الإدارية بسرعة
 */
export const isInternalStaff = (role: UserRole): boolean => {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
  ].includes(role);
};
