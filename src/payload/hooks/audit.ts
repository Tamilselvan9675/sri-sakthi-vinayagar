import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";

/**
 * Audit trail hooks. Entries are written to the `audit-logs` collection using
 * the server-side Local API (overrideAccess), so no browser user can forge or
 * edit them.
 */
const SENSITIVE_KEYS = new Set(["password", "salt", "hash", "apiKey", "resetPasswordToken"]);

function sanitize(doc: unknown) {
  if (!doc || typeof doc !== "object") return doc ?? null;
  return JSON.parse(
    JSON.stringify(doc, (key, value) => (SENSITIVE_KEYS.has(key) ? undefined : value)),
  );
}

export const auditAfterChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  if (collection.slug === "audit-logs") return doc;
  try {
    await req.payload.create({
      collection: "audit-logs",
      data: {
        action: operation === "create" ? "create" : "update",
        entityType: collection.slug,
        entityId: String(doc.id),
        user: req.user?.id ?? null,
        userEmail: req.user?.email ?? "system",
        oldValue: operation === "update" ? sanitize(previousDoc) : null,
        newValue: sanitize(doc),
      },
      overrideAccess: true,
      req,
    });
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "Failed to write audit log" });
  }
  return doc;
};

export const auditAfterDelete: CollectionAfterDeleteHook = async ({
  doc,
  req,
  collection,
}) => {
  try {
    await req.payload.create({
      collection: "audit-logs",
      data: {
        action: "delete",
        entityType: collection.slug,
        entityId: String(doc.id),
        user: req.user?.id ?? null,
        userEmail: req.user?.email ?? "system",
        oldValue: sanitize(doc),
        newValue: null,
      },
      overrideAccess: true,
      req,
    });
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "Failed to write audit log" });
  }
  return doc;
};
