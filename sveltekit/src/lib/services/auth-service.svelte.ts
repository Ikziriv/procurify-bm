import { authClient } from "$lib/auth-client";
import { fromStore } from "svelte/store";


/**
 * AuthService provides a Svelte 5 Rune-native interface for authentication.
 * It encapsulates the Better Auth client and provides reactive state for the UI.
 * 
 * Built with Clean Code principles, it separates the auth delivery mechanism
 * from the application logic.
 */
class AuthService {
    // The session object from better-auth/svelte is a Nanostore Atom.
    // We bridge it to Svelte 5 Runes using fromStore for reactive access.
    #sessionStore = authClient.useSession();
    #session = fromStore(this.#sessionStore);


    /**
     * Reactive accessor for the current session data.
     */
    get session() {
        return this.#session.current.data;
    }


    /**
     * Reactive accessor for the current user.
     * Includes inferred fields like 'role'.
     */
    get user() {
        return this.#session.current.data?.user;
    }


    /**
     * Indicates if the session is currently loading.
     */
    get isPending() {
        return this.#session.current.isPending;
    }


    /**
     * Signs out the current user and clears the session.
     */
    async signOut() {
        try {
            await authClient.signOut();
        } catch (error) {
            console.error("[AuthService] Sign out failed:", error);
            throw error;
        }
    }

    /**
     * Checks if the current user has a specific role.
     * Useful for route guards and UI conditional rendering.
     */
    hasRole(role: "ADMIN_PROCUREMENT" | "USER_PROCUREMENT" | "MANUFACT_PROCUREMENT") {
        return this.user?.role === role;
    }
}

/**
 * Singleton instance of the AuthService.
 * Import this in components to access reactive auth state.
 */
export const authService = new AuthService();
