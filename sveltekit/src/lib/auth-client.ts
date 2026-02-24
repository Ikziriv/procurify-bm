import { createAuthClient } from "better-auth/svelte";
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins";
import type { auth } from "./server/auth";

/**
 * Enterprise-grade Better Auth client.
 * Configured with type-safe field inference for custom schema fields.
 */
export const authClient = createAuthClient({
    // Use baseURL if needed, otherwise it defaults to /api/auth
    // baseURL: window.location.origin, 

    // Enables type safety for custom fields (like 'role') defined on the server.
    // This works by analyzing the Better Auth server configuration.
    plugins: [
        inferAdditionalFields<typeof auth>(),
        usernameClient()
    ]
});
