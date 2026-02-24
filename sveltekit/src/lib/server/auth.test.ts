import { describe, it, expect, beforeEach } from "vitest";
import { createTestAuth } from "./auth.test-utils";

describe("Better Auth Integration", () => {
    let auth: any;
    let db: any;

    beforeEach(async () => {
        const setup = await createTestAuth();
        auth = setup.auth;
        db = setup.db;
    });

    it("should sign up a new user", async () => {
        const email = "test@example.com";
        const password = "password123";
        const name = "Test User";

        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                role: "USER_PROCUREMENT"
            }
        });

        expect(response).toBeDefined();
        expect(response.user).toBeDefined();
        expect(response.user.email).toBe(email);
        expect(response.user.name).toBe(name);
        expect(response.user.role).toBe("USER_PROCUREMENT");
    });

    it("should sign up with email and username", async () => {
        const email = "username-test@example.com";
        const username = "testuser123";
        const password = "password123";

        const response = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Username User",
                username
            }
        });

        expect(response).toBeDefined();
        expect(response.user.username).toBe(username);
    });

    it("should sign in with username", async () => {
        const email = "signin-username@example.com";
        const username = "signin_user";
        const password = "password123";

        // Pre-create user with username
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "SignIn Username User",
                username
            }
        });

        const response = await auth.api.signInUsername({
            body: {
                username,
                password
            }
        });

        expect(response).toBeDefined();
        expect(response.session || response.token).toBeDefined();
        expect(response.user.email).toBe(email);
    });

    it("should fail if username is already taken", async () => {
        const username = "duplicate_user";

        // Create first user
        await auth.api.signUpEmail({
            body: {
                email: "user1@example.com",
                password: "password123",
                name: "User 1",
                username
            }
        });

        // Try to create second user with same username
        try {
            await auth.api.signUpEmail({
                body: {
                    email: "user2@example.com",
                    password: "password123",
                    name: "User 2",
                    username
                }
            });
            expect(true).toBe(false); // Should fail
        } catch (error: any) {
            expect(error).toBeDefined();
        }
    });

    it("should sign in an existing user", async () => {
        const email = "signin@example.com";
        const password = "password123";

        // Pre-create user using API
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "SignIn User"
            }
        });

        const response = await auth.api.signInEmail({
            body: {
                email,
                password
            }
        });

        expect(response).toBeDefined();
        // Check for either session object or token
        expect(response.session || response.token).toBeDefined();

        // Verify session exists in database
        const token = response.session?.token || response.token;
        const sessionInDb = await db.query.session.findFirst({
            where: (s: any, { eq }: any) => eq(s.token, token)
        });

        expect(sessionInDb).toBeDefined();
        expect(sessionInDb?.userId).toBe(response.user.id);
        expect(response.user.email).toBe(email);
    });

    it("should fail sign in with wrong password", async () => {
        const email = "fail@example.com";
        const password = "password123";

        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: "Fail User"
            }
        });

        try {
            await auth.api.signInEmail({
                body: {
                    email,
                    password: "wrong-password"
                }
            });
            // Should not reach here
            expect(true).toBe(false);
        } catch (error: any) {
            expect(error).toBeDefined();
            // Better Auth throws or returns error depending on API call style
        }
    });

    it("should persist custom role field", async () => {
        const email = "admin@example.com";
        const role = "SUPER_ADMIN";

        const response = await auth.api.signUpEmail({
            body: {
                email,
                password: "password123",
                name: "Admin User",
                role: role
            }
        });

        expect(response.user.role).toBe(role);
    });
});
