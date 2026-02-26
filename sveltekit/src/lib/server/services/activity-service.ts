import { db } from '../db';
import { activityLogs } from '../db/schema';

export interface LogParams {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: any;
    ipAddress?: string | null;
    userAgent?: string | null;
}

export class ActivityService {
    /**
     * Records an activity log entry in the database.
     */
    static async log(params: LogParams) {
        const logId = crypto.randomUUID();
        const now = new Date();

        try {
            await db.insert(activityLogs).values({
                id: logId,
                userId: params.userId || null,
                action: params.action,
                entityType: params.entityType || null,
                entityId: params.entityId || null,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                createdAt: now
            });

            return { id: logId, ...params, createdAt: now };
        } catch (error) {
            console.error('Failed to record activity log:', error);
            // We don't want to throw here as logging shouldn't break the main flow
            return null;
        }
    }

    /**
     * Helper to log from a Request object (extracts IP and User-Agent)
     */
    static async logRequest(request: Request, params: Omit<LogParams, 'ipAddress' | 'userAgent'>) {
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip');
        const userAgent = request.headers.get('user-agent');

        return this.log({
            ...params,
            ipAddress,
            userAgent
        });
    }
}
