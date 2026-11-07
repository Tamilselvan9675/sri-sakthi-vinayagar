import type { CollectionConfig, Field } from "payload";
import {
  canEditContent,
  canManageFinance,
  isAdmin,
  isSuperAdmin,
  isSuperAdminUser,
  isAdminUser,
  publishedOrLoggedIn,
  ROLE_OPTIONS,
  adminOnlyField,
} from "./access/index.ts";
import { auditAfterChange, auditAfterDelete } from "./hooks/audit.ts";

/* -------------------------------------------------------------------------- */
/* Shared helpers                                                             */
/* -------------------------------------------------------------------------- */

const yearField: Field = {
  name: "festivalYear",
  label: "Festival Year",
  type: "relationship",
  relationTo: "festival-years",
  required: true,
  index: true,
};

/** Set by the one-time Prisma import so it can be re-run safely (never duplicates). */
const legacyIdField: Field = {
  name: "legacyId",
  type: "text",
  unique: true,
  index: true,
  admin: { hidden: true, readOnly: true },
  access: { read: ({ req }) => Boolean(req.user), create: () => false, update: () => false },
};

const previewFor =
  (path: string) =>
  (_doc: unknown, { locale }: { locale?: string }) =>
    `/api/preview?path=${encodeURIComponent(`/${locale || "en"}${path}`)}`;

const contentAccess = {
  read: publishedOrLoggedIn,
  create: canEditContent,
  update: canEditContent,
  delete: canEditContent,
};

const GALLERY_CATEGORIES = [
  { label: "First Day", value: "first-day" },
  { label: "Last Day", value: "last-day" },
  { label: "Games", value: "games" },
  { label: "Vinayagar Statue", value: "vinayagar-statue" },
];

const VIDEO_CATEGORIES = [
  { label: "Festival", value: "festival" },
  { label: "Pooja", value: "pooja" },
  { label: "First Day", value: "first-day" },
  { label: "Last Day", value: "last-day" },
  { label: "Games", value: "games" },
  { label: "Vinayagar", value: "vinayagar" },
];

/* -------------------------------------------------------------------------- */
/* Users (CMS authentication + roles)                                         */
/* -------------------------------------------------------------------------- */

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8 hours
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  admin: { useAsTitle: "email", defaultColumns: ["name", "email", "role"], group: "System" },
  hooks: {
    beforeValidate: [
      async ({ req, operation, data }) => {
        if (operation === "create" && data) {
          const existing = await req.payload.count({ collection: "users", req, overrideAccess: true });
          if (existing.totalDocs === 0) data.role = "super_admin";
        }
        return data;
      },
    ],
  },
  access: {
    // Only a super admin creates/deletes accounts; admins can read.
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: ({ req }) =>
      isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false,
    update: ({ req }) =>
      isSuperAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [...ROLE_OPTIONS],
      saveToJWT: true,
      access: { create: ({ req }) => isSuperAdminUser(req.user), update: ({ req }) => isSuperAdminUser(req.user) },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Media                                                                      */
/* -------------------------------------------------------------------------- */

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content", useAsTitle: "filename" },
  access: {
    read: () => true,
    create: canEditContent,
    update: canEditContent,
    delete: isAdmin,
  },
  upload: {
    // Used only when Cloudflare R2 is not configured (local development).
    // With R2 enabled the storage adapter keeps binaries in the bucket.
    staticDir: "media",
    // Explicit allow-list (no SVG: it can carry scripts).
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "application/pdf"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
  },
  fields: [
    { name: "alt", type: "text", required: true, localized: true },
    { name: "caption", type: "text", localized: true },
    // Bookkeeping columns used by the R2 (S3) storage adapter. Declared here so
    // the database schema/migrations are the same with or without R2 enabled.
    { name: "prefix", type: "text", admin: { hidden: true, readOnly: true, disableListColumn: true, disableListFilter: true, disableBulkEdit: true } },
    { name: "_objectKey", type: "text", admin: { hidden: true, readOnly: true, disableListColumn: true, disableListFilter: true, disableBulkEdit: true } },
  ],
};

/* -------------------------------------------------------------------------- */
/* Temple settings (single record)                                            */
/* -------------------------------------------------------------------------- */

export const TempleSettings: CollectionConfig = {
  slug: "temple-settings",
  labels: { singular: "Temple Settings", plural: "Temple Settings" },
  admin: { group: "Site", useAsTitle: "templeName" },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isSuperAdmin,
  },
  hooks: {
    beforeValidate: [
      async ({ req, operation, data }) => {
        if (operation === "create") {
          const existing = await req.payload.count({ collection: "temple-settings", req });
          if (existing.totalDocs > 0) {
            throw new Error("Temple settings already exist. Edit the existing record instead.");
          }
        }
        return data;
      },
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    { name: "templeName", type: "text", required: true, localized: true },
    { name: "address", type: "textarea", localized: true },
    { name: "phone", type: "text" },
    { name: "whatsapp", type: "text" },
    { name: "email", type: "email" },
    {
      type: "row",
      fields: [
        { name: "latitude", type: "number", min: -90, max: 90 },
        { name: "longitude", type: "number", min: -180, max: 180 },
      ],
    },
    { name: "upiId", label: "UPI ID", type: "text" },
    { name: "upiQrCode", label: "UPI QR Code", type: "upload", relationTo: "media" },
    { name: "logo", type: "upload", relationTo: "media" },
  ],
};

/* -------------------------------------------------------------------------- */
/* Pages                                                                      */
/* -------------------------------------------------------------------------- */

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status"],
    preview: (doc, opts) => previewFor(`/${(doc as { slug?: string }).slug ?? ""}`)(doc, opts),
  },
  versions: { drafts: true },
  access: contentAccess,
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL segment, e.g. about, story, pooja" },
    },
    { name: "heading", type: "text", localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "heroImage", type: "upload", relationTo: "media" },
    {
      name: "blocks",
      type: "blocks",
      localized: true,
      blocks: [
        {
          slug: "richText",
          labels: { singular: "Rich Text", plural: "Rich Text" },
          fields: [{ name: "content", type: "richText", required: true }],
        },
        {
          slug: "imageBlock",
          labels: { singular: "Image", plural: "Images" },
          fields: [
            { name: "image", type: "upload", relationTo: "media", required: true },
            { name: "caption", type: "text" },
          ],
        },
        {
          slug: "callToAction",
          labels: { singular: "Call to Action", plural: "Calls to Action" },
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "text", type: "textarea" },
            { name: "buttonLabel", type: "text" },
            { name: "buttonUrl", type: "text" },
          ],
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Festival years                                                             */
/* -------------------------------------------------------------------------- */

export const FestivalYears: CollectionConfig = {
  slug: "festival-years",
  labels: { singular: "Festival Year", plural: "Festival Years" },
  admin: { group: "Festival", useAsTitle: "label", defaultColumns: ["year", "title", "startDate"] },
  versions: { drafts: true },
  access: contentAccess,
  defaultSort: "-year",
  fields: [
    {
      name: "year",
      type: "number",
      required: true,
      unique: true,
      min: 1900,
      max: 2200,
      index: true,
    },
    { name: "title", type: "text", required: true, localized: true },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
        { name: "endDate", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
      ],
    },
    { name: "description", type: "textarea", localized: true },
    {
      name: "label",
      type: "text",
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ siblingData }) => String(siblingData.year ?? "")],
      },
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export const Events: CollectionConfig = {
  slug: "events",
  admin: { group: "Festival", useAsTitle: "name", defaultColumns: ["name", "festivalYear", "date", "time"] },
  versions: { drafts: true },
  access: contentAccess,
  defaultSort: "date",
  fields: [
    yearField,
    legacyIdField,
    {
      type: "row",
      fields: [
        { name: "date", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
        { name: "time", type: "text", admin: { description: "e.g. 6:00 PM" } },
      ],
    },
    { name: "name", label: "Event Name", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
  ],
};

/* -------------------------------------------------------------------------- */
/* Winners                                                                    */
/* -------------------------------------------------------------------------- */

export const Winners: CollectionConfig = {
  slug: "winners",
  admin: { group: "Festival", useAsTitle: "winnerName", defaultColumns: ["winnerName", "gameName", "prizePosition", "festivalYear"], preview: previewFor("/winners") },
  versions: { drafts: true },
  access: contentAccess,
  fields: [
    yearField,
    legacyIdField,
    { name: "winnerName", type: "text", required: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "gameName", type: "text", required: true, localized: true },
    { name: "description", type: "textarea", localized: true },
    {
      name: "prizePosition",
      type: "select",
      required: true,
      defaultValue: "1",
      options: [
        { label: "1st Prize", value: "1" },
        { label: "2nd Prize", value: "2" },
        { label: "3rd Prize", value: "3" },
        { label: "Special / Consolation", value: "special" },
      ],
    },
    { name: "prizeDetails", type: "text", localized: true },
  ],
};

/* -------------------------------------------------------------------------- */
/* Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Gallery Album", plural: "Gallery" },
  admin: { group: "Festival", useAsTitle: "title", defaultColumns: ["title", "festivalYear", "category"], preview: previewFor("/gallery") },
  versions: { drafts: true },
  access: contentAccess,
  fields: [
    yearField,
    { name: "title", type: "text", required: true, localized: true },
    { name: "category", type: "select", required: true, options: GALLERY_CATEGORIES, index: true },
    {
      name: "photos",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text", localized: true },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Videos                                                                     */
/* -------------------------------------------------------------------------- */

const extractYoutubeId = (value?: string | null) => {
  if (!value) return "";
  const match = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/,
  );
  if (match) return match[1];
  return /^[\w-]{11}$/.test(value.trim()) ? value.trim() : "";
};

export const Videos: CollectionConfig = {
  slug: "videos",
  admin: { group: "Festival", useAsTitle: "title", defaultColumns: ["title", "festivalYear", "category"], preview: previewFor("/videos") },
  versions: { drafts: true },
  access: contentAccess,
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          const id = extractYoutubeId(data.youtubeUrl) || extractYoutubeId(data.youtubeId);
          if (id) data.youtubeId = id;
        }
        return data;
      },
    ],
  },
  fields: [
    yearField,
    legacyIdField,
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "youtubeUrl",
      label: "YouTube URL or ID",
      type: "text",
      required: true,
      validate: (value: string | null | undefined) =>
        extractYoutubeId(value) ? true : "Enter a valid YouTube URL or 11-character video ID",
    },
    {
      name: "youtubeId",
      type: "text",
      admin: { readOnly: true, description: "Extracted automatically from the URL" },
    },
    { name: "thumbnail", type: "upload", relationTo: "media", admin: { description: "Optional. Falls back to the YouTube thumbnail." } },
    { name: "category", type: "select", required: true, options: VIDEO_CATEGORIES, index: true },
    { name: "description", type: "textarea", localized: true },
  ],
};

/* -------------------------------------------------------------------------- */
/* Finance – restricted to finance roles, audited                             */
/* -------------------------------------------------------------------------- */

const financeAccess = {
  read: canManageFinance,
  create: canManageFinance,
  update: canManageFinance,
  delete: isAdmin,
};

export const Donors: CollectionConfig = {
  slug: "donors",
  admin: { group: "Finance", useAsTitle: "donorName", defaultColumns: ["donorName", "amount", "festivalYear"] },
  access: financeAccess,
  hooks: { afterChange: [auditAfterChange], afterDelete: [auditAfterDelete] },
  fields: [
    yearField,
    legacyIdField,
    { name: "donorName", type: "text", required: true },
    { name: "amount", type: "number", required: true, min: 0 },
    { name: "description", type: "textarea", localized: true },
  ],
};

export const Expenses: CollectionConfig = {
  slug: "expenses",
  admin: { group: "Finance", useAsTitle: "description", defaultColumns: ["description", "category", "amount", "date", "festivalYear"] },
  access: financeAccess,
  hooks: { afterChange: [auditAfterChange], afterDelete: [auditAfterDelete] },
  defaultSort: "-date",
  fields: [
    yearField,
    legacyIdField,
    { name: "category", type: "text", required: true, localized: true, admin: { description: "e.g. Decoration, Food, Prizes, Sound" } },
    { name: "amount", type: "number", required: true, min: 0 },
    { name: "date", type: "date", required: true, admin: { date: { pickerAppearance: "dayOnly" } } },
    { name: "description", type: "textarea", required: true, localized: true },
    {
      name: "responsiblePerson",
      type: "text",
      access: { read: ({ req }) => isAdminUser(req.user) || req.user?.role === "finance_manager" },
    },
    {
      name: "type",
      label: "Type",
      type: "select",
      required: true,
      defaultValue: "cash",
      options: [
        { label: "Cash", value: "cash" },
        { label: "In-kind", value: "in-kind" },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Audit logs (read-only in the admin)                                        */
/* -------------------------------------------------------------------------- */

export const AuditLogs: CollectionConfig = {
  slug: "audit-logs",
  labels: { singular: "Audit Log", plural: "Audit Logs" },
  admin: { group: "System", useAsTitle: "entityType", defaultColumns: ["createdAt", "action", "entityType", "userEmail"] },
  defaultSort: "-createdAt",
  access: {
    // Created only through hooks using the Local API (overrideAccess).
    create: () => false,
    update: () => false,
    delete: () => false,
    read: ({ req }) => isAdminUser(req.user),
  },
  fields: [
    { name: "action", type: "select", options: ["create", "update", "delete"], required: true },
    { name: "entityType", type: "text", required: true, index: true },
    { name: "entityId", type: "text", required: true, index: true },
    { name: "user", type: "relationship", relationTo: "users" },
    { name: "userEmail", type: "text" },
    { name: "oldValue", type: "json", access: { read: adminOnlyField } },
    { name: "newValue", type: "json", access: { read: adminOnlyField } },
  ],
};
