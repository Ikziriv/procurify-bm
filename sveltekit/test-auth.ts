import { auth } from "./src/lib/server/auth";

async function run() {
    try {
        const res = await auth.api.signUpEmail({
            body: {
                email: "test" + Date.now() + "@example.com",
                password: "password123!",
                name: "Test User",
                role: "USER_PROCUREMENT"
            } as any
        });
        console.log("Success:", res);
    } catch (e: any) {
        console.error("Error during sign up:", e);
        if (e.cause) {
            console.error("Cause:", e.cause);
        }
    }
}

run();
