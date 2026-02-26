import 'dotenv/config'; // Universal hydration for Dev/Standalone
import Ably from 'ably';

// Standard pattern for universal environment access (SvelteKit + Standalone Node)
const ABLY_API_KEY = process.env.ABLY_API_KEY;

if (!ABLY_API_KEY) {
    console.warn('ABLY_API_KEY is not set. Real-time notifications will be disabled.');
}

export class AblyService {
    private static instance: Ably.Rest;

    private static getInstance() {
        if (!this.instance && ABLY_API_KEY) {
            this.instance = new Ably.Rest(ABLY_API_KEY);
        }
        return this.instance;
    }

    /**
     * Publishes a message to a user's private notification channel.
     */
    static async publish(userId: string, data: any) {
        const client = this.getInstance();
        if (!client) return;

        const channel = client.channels.get(`notifications:user:${userId}`);
        try {
            await channel.publish('update', data);
        } catch (error) {
            console.error(`Failed to publish to Ably for user ${userId}:`, error);
        }
    }

    /**
     * Creates a token request for the client to authenticate with Ably securely.
     */
    static async createTokenRequest(userId: string) {
        const client = this.getInstance();
        if (!client) throw new Error('Ably client not initialized');

        return await client.auth.createTokenRequest({
            clientId: userId,
            capability: {
                [`notifications:user:${userId}`]: ['subscribe']
            }
        });
    }
}
