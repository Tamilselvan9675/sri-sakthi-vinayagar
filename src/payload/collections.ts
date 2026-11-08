import { APIError, type CollectionBeforeChangeHook, type CollectionBeforeValidateHook, type CollectionConfig, type Field } from "payload";
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
import { resolveStorageFolder } from "../lib/storage/folders.ts";
import { sendContactReply } from "../lib/email/contact-mail.ts";

/**
 * Routes every new upload to its R2 folder (stored in the adapter's `prefix`
 * field). Existing documents keep their stored prefix on metadata-only edits.
 */
const setStorageFolder =
  (slug: string): CollectionBeforeValidateHook =>
  ({ data, req }) => {
    if (req.file && data) {
      data.prefix = resolveStorageFolder(slug, req.file.mimetype);
    }
    return data;
  };

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
    // Images are stored in media/gallery, videos in media/videos. PDFs belong
    // to the Finance collections (financial-reports) and are not accepted here.
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/avif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
    // If imageSizes is omitted, Payload only stores the original image in Cloudflare R2
    // without creating and uploading extra resized variants (-400x300, -800x600).
    adminThumbnail: ({ doc }) => (doc?.url as string) || null,
    
  },
  hooks: { beforeValidate: [setStorageFolder("media")] },
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
  read: () => true,
  create: canManageFinance,
  update: canManageFinance,
  delete: isAdmin,
};

/**
 * Finance: year-wise file uploads only. Files are stored exactly as uploaded
 * (no parsing, generation or rewriting) and only .pdf / .xlsx are accepted.
 */
const FINANCE_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const financeFileCollection = (
  slug: string,
  singular: string,
  plural: string,
  hidden = false,
): CollectionConfig => ({
  slug,
  labels: { singular, plural },
  admin: {
    group: "Finance",
    useAsTitle: "filename",
    defaultColumns: ["festivalYear", "filename", "updatedAt"],
    description: "Upload the yearly Donors and Expenses file (PDF or Excel .xlsx).",
    hidden,
  },
  access: financeAccess,
  upload: {
    staticDir: slug,
    mimeTypes: FINANCE_MIME_TYPES,
    // Keep the original bytes: no resizing, cropping or other processing.
    crop: false,
    focalPoint: false,
  },
  hooks: {
    beforeValidate: [
      setStorageFolder(slug),
      ({ req, data }) => {
        const name = req.file?.name?.toLowerCase();
        if (name && !name.endsWith(".pdf") && !name.endsWith(".xlsx")) {
          throw new APIError("Only .pdf and .xlsx files are allowed.", 400, undefined, true);
        }
        return data;
      },
    ],
    afterChange: [auditAfterChange],
    afterDelete: [auditAfterDelete],
  },
  fields: [
    { ...yearField, unique: true, admin: { description: "One file per year." } },
    // Bookkeeping columns used by the R2 (S3) storage adapter.
    { name: "prefix", type: "text", admin: { hidden: true, readOnly: true, disableListColumn: true, disableListFilter: true, disableBulkEdit: true } },
    { name: "_objectKey", type: "text", admin: { hidden: true, readOnly: true, disableListColumn: true, disableListFilter: true, disableBulkEdit: true } },
  ],
});

export const Donors = financeFileCollection("donor-files", "Donors", "Donors", true);
export const Expenses = financeFileCollection(
  "expense-files",
  "Donors and Expenses",
  "Donors and Expenses",
);
/* -------------------------------------------------------------------------- */
/* Contact messages (submitted from the public Contact page)                  */
/* -------------------------------------------------------------------------- */

/**
 * Sends the admin's reply through Resend when "send" is ticked. Throws on
 * failure so the admin sees the error and nothing is marked as sent.
 */
const sendAdminReply: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  if (operation !== "update" || !data?.sendReply) return data;

  const reply = String(data.replyMessage ?? originalDoc?.replyMessage ?? "").trim();
  if (!reply) throw new APIError("Write a reply message before sending.", 400, undefined, true);
  if (!originalDoc?.email) throw new APIError("This message has no visitor email.", 400, undefined, true);

  try {
    await sendContactReply({
      to: originalDoc.email,
      visitorName: originalDoc.name,
      subject:
        String(data.replySubject ?? originalDoc.replySubject ?? "").trim() ||
        "Re: your message to Sri Sakthi Vinayagar Temple",
      reply,
      originalMessage: originalDoc.message,
    });
  } catch (error) {
    throw new APIError(
      `Reply not sent: ${error instanceof Error ? error.message : "unknown error"}`,
      502,
      undefined,
      true,
    );
  }

  data.sendReply = false;
  data.repliedAt = new Date().toISOString();
  data.repliedBy = req.user?.email ?? null;
  return data;
};
// Visitor data and delivery status are never editable, not even by admins (API included).
const readOnlyField = { admin: { readOnly: true }, access: { update: () => false } } as const;

export const ContactMessages: CollectionConfig = {
  slug: "contact-messages",
  labels: { singular: "Contact Message", plural: "Contact Messages" },
  admin: {
    group: "System",
    useAsTitle: "name",
    defaultColumns: ["createdAt", "name", "email", "phone", "rating", "repliedAt"],
    description: "Messages sent from the website contact form. Use the Reply section to email the visitor.",
  },
  defaultSort: "-createdAt",
  hooks: {
    beforeChange: [sendAdminReply],
  },
  access: {
    // Created only by the /api/contact route through the Local API (overrideAccess).
    // Update is admin-only and limited (via field access) to the reply fields below.
    create: () => false,
    update: ({ req }) => isAdminUser(req.user),
    read: ({ req }) => isAdminUser(req.user),
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true, ...readOnlyField },
    { name: "email", type: "email", required: true, ...readOnlyField },
    { name: "phone", type: "text", required: true, ...readOnlyField },
    { name: "rating", type: "number", min: 1, max: 5, ...readOnlyField },
    { name: "message", type: "textarea", required: true, ...readOnlyField },
    { name: "visitorLocale", label: "Language", type: "text", ...readOnlyField },
    { name: "confirmationSent", label: "Confirmation email sent", type: "checkbox", defaultValue: false, ...readOnlyField },
    { name: "notificationSent", label: "Temple notification sent", type: "checkbox", defaultValue: false, ...readOnlyField },
    { name: "emailError", label: "Email error", type: "text", ...readOnlyField },
    {
      type: "collapsible",
      label: "Reply / Feedback to Visitor",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "replySubject",
          label: "Subject",
          type: "text",
          admin: { description: "Defaults to: Re: your message to Sri Sakthi Vinayagar Temple" },
        },
        {
          name: "replyMessage",
          label: "Reply / Feedback Message",
          type: "textarea",
        },
        {
          name: "sendReply",
          label: "Send this reply by email when I save",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Sends the custom feedback email to the visitor's submitted email address via Resend. Resets after sending." },
        },
        {
          name: "repliedAt",
          label: "Last replied at",
          type: "date",
          admin: { readOnly: true, date: { pickerAppearance: "dayAndTime" } },
          access: { update: () => false },
        },
        { name: "repliedBy", label: "Last replied by", type: "text", ...readOnlyField },
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

