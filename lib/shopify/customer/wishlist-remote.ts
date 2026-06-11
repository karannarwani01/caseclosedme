// Account-synced wishlist storage. The list is saved in Shopify as an
// app-owned metaobject (type "$app:wishlist"), one record per customer, keyed
// by a hash of the customer's stable id. This reuses the same Admin token /
// pattern as the refund flow — no extra customer scopes required.
import type { WishlistItem } from "components/wishlist/wishlist-context";
import { adminGraphQL, isAdminConfigured } from "lib/shopify-admin";
import { createHash } from "crypto";

const WISHLIST_TYPE = "$app:wishlist";

function handleFor(customerKey: string): string {
  const h = createHash("sha1").update(customerKey).digest("hex").slice(0, 24);
  return `wishlist-${h}`;
}

let definitionEnsured = false;

// Idempotently create the metaobject definition. metaobjectDefinitionCreate
// returns a userError (not a thrown error) if it already exists, so this is
// safe to call repeatedly.
async function ensureDefinition(): Promise<void> {
  if (definitionEnsured) return;
  try {
    await adminGraphQL(
      `mutation($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition { id }
          userErrors { field message code }
        }
      }`,
      {
        definition: {
          name: "Wishlist",
          type: WISHLIST_TYPE,
          access: { storefront: "NONE" },
          fieldDefinitions: [
            {
              key: "customer_key",
              name: "Customer key",
              type: "single_line_text_field",
            },
            { key: "email", name: "Email", type: "single_line_text_field" },
            { key: "items", name: "Items", type: "json" },
          ],
        },
      },
    );
  } catch {
    // Definition likely already exists, or insufficient perms — the upsert
    // below will surface a real problem if there is one.
  }
  definitionEnsured = true;
}

export async function getRemoteWishlist(
  customerKey: string,
): Promise<WishlistItem[]> {
  if (!isAdminConfigured()) return [];
  const data = await adminGraphQL<{
    metaobjectByHandle: { field: { value: string } | null } | null;
  }>(
    `query($handle: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $handle) {
        field(key: "items") { value }
      }
    }`,
    { handle: { type: WISHLIST_TYPE, handle: handleFor(customerKey) } },
  );
  const value = data.metaobjectByHandle?.field?.value;
  if (!value) return [];
  try {
    const arr = JSON.parse(value);
    return Array.isArray(arr) ? (arr as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export async function setRemoteWishlist(
  customerKey: string,
  email: string,
  items: WishlistItem[],
): Promise<void> {
  if (!isAdminConfigured()) return;
  await ensureDefinition();
  const data = await adminGraphQL<{
    metaobjectUpsert: {
      metaobject: { id: string } | null;
      userErrors: { field: string[]; message: string; code: string }[];
    };
  }>(
    `mutation($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message code }
      }
    }`,
    {
      handle: { type: WISHLIST_TYPE, handle: handleFor(customerKey) },
      metaobject: {
        fields: [
          { key: "customer_key", value: customerKey },
          { key: "email", value: email || "" },
          { key: "items", value: JSON.stringify(items) },
        ],
      },
    },
  );
  const errs = data.metaobjectUpsert.userErrors;
  if (errs?.length) {
    throw new Error(`wishlist upsert failed: ${JSON.stringify(errs)}`);
  }
}
