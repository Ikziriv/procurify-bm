import 'dotenv/config';
// The import above runs before everything else in ESM

// Use relative paths for standalone scripts to avoid alias resolution issues
import { NotificationService } from './src/lib/server/services/notification-service';
import { db } from './src/lib/server/db';
import { user, procurements } from './src/lib/server/db/schema';
import { desc } from 'drizzle-orm';

async function runProcurementTests() {
    console.log('--- 🚀 Starting Procurement Notification Tests ---');

    // 1. Setup participants
    const allUsers = await db.select().from(user).limit(2);
    if (allUsers.length === 0) {
        console.error('❌ No users found in database.');
        return;
    }
    const targetUser = allUsers[0];

    // 2. Find a procurement to reference
    const latestProcurement = await db
        .select()
        .from(procurements)
        .orderBy(desc(procurements.createdAt))
        .limit(1);

    const procurement = latestProcurement[0];

    if (procurement) {
        console.log(`📡 Using procurement: ${procurement.title} (${procurement.id})`);

        // Scenario A: New Procurement Published
        console.log(`📤 Sending Scenario A: New Procurement to ${targetUser.name}...`);
        await NotificationService.create({
            userId: targetUser.id,
            title: '📢 Tender Baru Terbit',
            message: `Pengadaan "${procurement.title}" telah dipulikasikan. Segera cek detail dan ajukan penawaran Anda.`,
            type: 'INFO',
            referenceId: procurement.id,
            referenceType: 'PROCUREMENT',
            actionUrl: `/procurements/${procurement.id}`
        });

        // Scenario B: Procurement Status Update
        console.log(`📤 Sending Scenario B: Status Update to ${targetUser.name}...`);
        await NotificationService.create({
            userId: targetUser.id,
            title: '✅ Pengadaan Disetujui',
            message: `Permohonan pengadaan "${procurement.title}" Anda telah disetujui oleh tim procurement.`,
            type: 'SUCCESS',
            referenceId: procurement.id,
            referenceType: 'PROCUREMENT',
            actionUrl: `/procurements/${procurement.id}`
        });
    } else {
        console.log('⚠️ No procurement found. Sending general success test...');
        await NotificationService.create({
            userId: targetUser.id,
            title: '🔄 Sistem Sinkronisasi Selesai',
            message: 'Sinkronisasi data pengadaan dengan sistem pusat telah berhasil.',
            type: 'SUCCESS'
        });
    }

    console.log('✨ All test scenarios sent successfully!');
}

runProcurementTests()
    .then(() => {
        console.log('🏁 Test completed.');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Test failed:', err);
        process.exit(1);
    });
