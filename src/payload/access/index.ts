import type { Access, FieldAccess } from "payload";

/**
 * Role-based access helpers (enforced server-side by Payload).
 *
 * super_admin     – everything, including user management & audit logs
 * admin           – all content + finance + settings
 * editor          – website content only (no finance records)
 * finance_manager – donors & expenses only (read-only for other content)
 */
export type CmsRole = "super_admin" | "admin" | "editor" | "finance_manager";

export const ROLE_OPTIONS = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Finance Manager", value: "finance_manager" },
] as const;

type MaybeUser = { role?: CmsRole | null } | null | undefined;

const hasRole = (user: MaybeUser, roles: CmsRole[]) =>
  Boolean(user?.role && roles.includes(user.role));

export const isSuperAdminUser = (user: MaybeUser) => hasRole(user, ["super_admin"]);
export const isAdminUser = (user: MaybeUser) => hasRole(user, ["super_admin", "admin"]);
export const canEditContentUser = (user: MaybeUser) =>
  hasRole(user, ["super_admin", "admin", "editor"]);
export const canManageFinanceUser = (user: MaybeUser) =>
  hasRole(user, ["super_admin", "admin", "finance_manager"]);

export const isSuperAdmin: Access = ({ req }) => isSuperAdminUser(req.user as MaybeUser);
export const isAdmin: Access = ({ req }) => isAdminUser(req.user as MaybeUser);
export const canEditContent: Access = ({ req }) => canEditContentUser(req.user as MaybeUser);
export const canManageFinance: Access = ({ req }) =>
  canManageFinanceUser(req.user as MaybeUser);

/** Anyone logged in to the CMS. */
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

/**
 * Public content read: anonymous visitors only see published documents
 * (for draft-enabled collections); logged-in CMS users see everything.
 */
export const publishedOrLoggedIn: Access = ({ req }) => {
  if (req.user) return true;
  return { _status: { equals: "published" } };
};

/** Field-level helper: only admins may change the field. */
export const adminOnlyField: FieldAccess = ({ req }) => isAdminUser(req.user as MaybeUser);
export const superAdminOnlyField: FieldAccess = ({ req }) =>
  isSuperAdminUser(req.user as MaybeUser);
