import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { faker } from '@faker-js/faker';
import * as schema from './schema';

// Resource loading moved to factories


import {
    UserFactory,
    AccountFactory,
    LegacyUserFactory,
    ProcurementFactory,
    ProcurementItemFactory,
    ProcurementRuleFactory,
    SubmissionFactory,
    SubmissionItemFactory,
    NotificationFactory,
    KBLIFactory,
    KBKIFactory,
    CompanyProfileFactory,
    GovernmentProfileFactory,
    SubscriptionPlanFactory,
    SubscriptionFactory,
    SystemConfigFactory,
    ProcurementMethodFactory,
    ProcurementTypeFactory,
    BasFactory,
    BmnFactory,
    LocationFactory,
    SubmissionInaprocLinkFactory
} from './factories';


async function insertInBatches(db: any, table: any, data: any[], batchSize = 1000) {
    const tableName = table?.tableName || 'unknown';
    console.log(`\n    📂 Seeding table: ${tableName} (${data.length} records)`);
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        try {
            await db.insert(table).values(batch);
        } catch (err: any) {
            console.error(`\n❌ ERROR in table ${tableName} at batch starting at ${i}:`);
            console.error(err.message || err);
            if (err.detail) console.error('Detail:', err.detail);
            throw err;
        }
        process.stdout.write(`\r    ⏳ Progress: ${Math.min(i + batchSize, data.length)} / ${data.length}`);
    }
    console.log('\n    ✅ Chunk insert complete.');
}

async function main() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('❌ DATABASE_URL is not set in .env');
    }

    const sql = neon(url);
    const db = drizzle(sql, { schema });

    console.log('\n--- 🚀 PROCURIFY ENTERPRISE SEEDING (V4 - SUBSCRIPTIONS) ---');

    // 1. Clear existing data (Ordered for FK constraints)
    console.log('🧹 Action: cleaning the slate...');
    await db.delete(schema.sharedProfiles);
    await db.delete(schema.userKblis);
    await db.delete(schema.userKbkis);
    await db.delete(schema.kbliKbkiMapping);
    await db.delete(schema.procurementKblis);
    await db.delete(schema.procurementKbkis);
    await db.delete(schema.submissionKblis);
    await db.delete(schema.submissionKbkis);
    await db.delete(schema.submissionInaprocLinks);
    await db.delete(schema.submissionItems);
    await db.delete(schema.procurementRules);
    await db.delete(schema.procurementItems);
    await db.delete(schema.notifications);
    await db.delete(schema.subscriptions);
    await db.delete(schema.activityLogs);
    await db.delete(schema.statusHistory);
    await db.delete(schema.contactPersons);
    await db.delete(schema.bmnImages);
    await db.delete(schema.submissions);
    await db.delete(schema.procurements);
    await db.delete(schema.companyProfiles);
    await db.delete(schema.governmentProfiles);
    await db.delete(schema.account);
    await db.delete(schema.session);
    await db.delete(schema.systemConfigs);
    await db.delete(schema.userRoles);
    await db.delete(schema.user);
    await db.delete(schema.subscriptionPlans);
    await db.delete(schema.procurementMethods);
    await db.delete(schema.procurementTypes);
    await db.delete(schema.kbli);
    await db.delete(schema.kbki);
    await db.delete(schema.regencies);
    await db.delete(schema.provinces);
    await db.delete(schema.bas);
    await db.delete(schema.bmn);
    await db.delete(schema.rolePermissions);
    await db.delete(schema.roles);
    await db.delete(schema.permissions);
    console.log('✨ Success: Database cleared.');


    // 2. Seed KBLI Hierarchy
    console.log('🌳 Action: Building KBLI Tree (Resource-based)...');
    const kbliData = KBLIFactory.getSeedData();
    await insertInBatches(db, schema.kbli, kbliData, 500);
    console.log('✅ Success: KBLI hierarchy established.');

    // 3. Seed KBKI Hierarchy
    console.log('📦 Action: Building KBKI Tree (Resource-based)...');
    const kbkiData = KBKIFactory.getSeedData();
    await insertInBatches(db, schema.kbki, kbkiData, 500);
    console.log('✅ Success: KBKI hierarchy established.');

    // 4. Seed Mapping
    console.log('🔗 Action: Mapping KBLI to KBKI (Resource-based)...');
    console.log('   (Step A: Generating data...)');
    const mappings = KBKIFactory.getMappings();
    console.log(`   (Step B: Inserting ${mappings.length} mappings...)`);
    await insertInBatches(db, schema.kbliKbkiMapping, mappings, 1000);
    console.log('✅ Success: Classification sync-mapping created.');

    // 4.a Seed BAS Hierarchy
    console.log('💰 Action: Building BAS Hierarchy...');
    const basData = BasFactory.getStandardBas();
    await insertInBatches(db, schema.bas, basData, 100);
    console.log('✅ Success: BAS hierarchy established.');

    // 4.b Seed BMN Hierarchy
    console.log('📁 Action: Building BMN Hierarchy...');
    const bmnData = BmnFactory.getStandardBmn();
    await insertInBatches(db, schema.bmn, bmnData, 500);
    console.log('✅ Success: BMN hierarchy established.');

    // 4.1 Seed Procurement Methods
    console.log('📝 Action: Seeding Standard Procurement Methods...');
    const methods = ProcurementMethodFactory.getStandardMethods();
    await insertInBatches(db, schema.procurementMethods, methods, 50);
    console.log(`✅ Success: ${methods.length} procurement methods established.`);

    // 4.2 Seed Procurement Types
    console.log('📋 Action: Seeding Standard Procurement Types...');
    const types = ProcurementTypeFactory.getStandardTypes();
    await insertInBatches(db, schema.procurementTypes, types, 50);
    console.log(`✅ Success: ${types.length} procurement types established.`);

    // 4.5. Seed Provinces & Regencies from Factories
    console.log('🗺️ Action: Seeding Provinces & Regencies...');
    const provinceData = LocationFactory.getProvinces();
    const regencyData = LocationFactory.getRegencies();

    if (provinceData.length) await insertInBatches(db, schema.provinces, provinceData, 100);
    if (regencyData.length) await insertInBatches(db, schema.regencies, regencyData, 500);
    console.log(`✅ Success: ${provinceData.length} provinces and ${regencyData.length} regencies established.`);



    // 5. Seed Users & Profiles
    console.log('👤 Action: Seeding Users & Profiles...');
    const defaultUsers: schema.NewUser[] = UserFactory.getDefaultUsers();

    console.log('🏛️ Action: Preparing Legacy Users...');
    const legacyUsers: schema.NewUser[] = LegacyUserFactory.getLegacyUsers();

    const additionalUsers: schema.NewUser[] = Array.from({ length: 5 }).map(() => UserFactory.create());

    // Use concat or loop to avoid stack overflow with spread operator on large arrays
    const allUsers: schema.NewUser[] = defaultUsers.concat(legacyUsers).concat(additionalUsers);

    console.log(`👤 Action: Inserting ${allUsers.length} users...`);
    await insertInBatches(db, schema.user, allUsers, 100);

    // 5.a Seed Accounts (Credentials)
    console.log('🔑 Action: Seeding User Accounts...');
    const allAccounts: any[] = [];
    const defaultUserIds = new Set(defaultUsers.map(u => u.id));

    for (const user of allUsers) {
        if (defaultUserIds.has(user.id)) {
            allAccounts.push(await AccountFactory.createForDefaultUsers(user.id, user.email!));
        } else {
            // Legacy or Additional users get default 'password123' via AccountFactory.create
            // accountId now defaults to userId in AccountFactory.create
            allAccounts.push(await AccountFactory.create(user.id));
        }
    }
    await insertInBatches(db, schema.account, allAccounts, 100);

    const compProfiles: any[] = [];
    const govtProfiles: any[] = [];

    for (const user of allUsers) {
        if (user.role === 'USER_PROCUREMENT' || user.role === 'MANUFACT_PROCUREMENT') {
            const randomProv = faker.helpers.arrayElement(provinceData) as any;
            const provRegencies = regencyData.filter((r: any) => r.provinceId === randomProv.id);
            const randomReg = provRegencies.length > 0 ? faker.helpers.arrayElement(provRegencies) as any : null;

            compProfiles.push(CompanyProfileFactory.create(user.id, {
                provinceId: randomProv.id,
                regencyId: randomReg?.id
            }));
        } else {
            if (LegacyUserFactory.isLegacyUser(user.email!)) {
                govtProfiles.push(GovernmentProfileFactory.create(user.id, {
                    institutionName: 'Kementerian PU (RI)',
                    department: user.name
                }));
            } else {
                govtProfiles.push(GovernmentProfileFactory.create(user.id));
            }
        }
    }


    if (compProfiles.length) await insertInBatches(db, schema.companyProfiles, compProfiles, 100);
    if (govtProfiles.length) await insertInBatches(db, schema.governmentProfiles, govtProfiles, 100);
    console.log(`✅ Success: ${allUsers.length} users with specialized profiles created.`);

    // 6. Seed Subscription Plans & System Config
    console.log('💳 Action: Initializing Subscription Engine...');
    const plans = SubscriptionPlanFactory.getDefaultPlans();
    await insertInBatches(db, schema.subscriptionPlans, plans, 50);

    const configs = SystemConfigFactory.getDefaultConfigs();
    await insertInBatches(db, schema.systemConfigs, configs, 50);

    const userSubscriptions: any[] = [];
    for (const profile of compProfiles) {
        // Assign plans randomly to 70% of companies
        if (Math.random() > 0.3) {
            const plan = faker.helpers.arrayElement(plans);
            userSubscriptions.push(SubscriptionFactory.create(profile.userId, plan.id));
        }
    }
    if (userSubscriptions.length) await insertInBatches(db, schema.subscriptions, userSubscriptions, 100);
    console.log(`✅ Success: ${plans.length} plans created and ${userSubscriptions.length} subscriptions assigned.`);

    // 7. Seed User Junctions
    console.log('🎯 Action: Mapping Companies to Business Classifications...');
    const userKblis: any[] = [];
    const userKbkis: any[] = [];

    for (const profile of compProfiles) {
        const randomKblis = kbliData.filter(k => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);
        const randomKbkis = kbkiData.filter(k => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);

        for (const k of randomKblis) userKblis.push({ userId: profile.userId, kbliId: k.id });
        for (const k of randomKbkis) userKbkis.push({ userId: profile.userId, kbkiId: k.id });
    }
    if (userKblis.length) await insertInBatches(db, schema.userKblis, userKblis, 500);
    if (userKbkis.length) await insertInBatches(db, schema.userKbkis, userKbkis, 500);
    console.log(`✅ Success: ${compProfiles.length} companies linked to KBLI/KBKI.`);

    // 8. Seed Procurements
    console.log('📦 Action: Generating Procurement Opportunities...');
    const admins = allUsers.filter(u => u.role !== 'USER_PROCUREMENT' && u.role !== 'MANUFACT_PROCUREMENT');
    const procurements: any[] = [];
    const procurementItems: any[] = [];

    for (const admin of admins) {
        for (let i = 0; i < 2; i++) {
            const p = ProcurementFactory.create(admin.id);
            p.basId = faker.helpers.arrayElement(basData.filter(b => b.level >= 3)).id;
            procurements.push(p);

            const itemCount = Math.floor(Math.random() * 3) + 3;
            for (let j = 0; j < itemCount; j++) {
                const item = ProcurementItemFactory.create(p.id);
                item.bmnId = faker.helpers.arrayElement(bmnData.filter(b => b.level >= 4)).id;
                procurementItems.push(item);
            }
        }
    }
    await insertInBatches(db, schema.procurements, procurements, 100);
    if (procurementItems.length) await insertInBatches(db, schema.procurementItems, procurementItems, 500);

    // 8.a Seed Procurement Rules
    console.log('📜 Action: Generating Procurement Rules...');
    const procurementRules: any[] = [];
    for (const p of procurements) {
        procurementRules.push(...ProcurementRuleFactory.getStandardRules(p.id));
    }
    if (procurementRules.length) await insertInBatches(db, schema.procurementRules, procurementRules, 500);

    // 9. Seed Procurement Junctions
    const procKblis: any[] = [];
    const procKbkis: any[] = [];
    for (const p of procurements) {
        const randomKblis = kbliData.filter(k => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);
        const randomKbkis = kbkiData.filter(k => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);

        for (const k of randomKblis) procKblis.push({ procurementId: p.id, kbliId: k.id });
        for (const k of randomKbkis) procKbkis.push({ procurementId: p.id, kbkiId: k.id });
    }
    if (procKblis.length) await insertInBatches(db, schema.procurementKblis, procKblis, 500);
    if (procKbkis.length) await insertInBatches(db, schema.procurementKbkis, procKbkis, 500);
    console.log(`✅ Success: ${procurements.length} procurements with items and classification links.`);

    // 10. Seed Submissions
    console.log('📝 Action: Logging Vendor Submissions...');
    const submissions: any[] = [];
    const submissionItems: any[] = [];
    const subInaprocLinks: any[] = [];
    const subKblis: any[] = [];
    const subKbkis: any[] = [];

    for (const p of procurements) {
        const vendorList = compProfiles.sort(() => 0.5 - Math.random()).slice(0, 3);
        const pItems = procurementItems.filter(item => item.procurementId === p.id);

        for (const v of vendorList) {
            const s = SubmissionFactory.create(p.id, v.userId);
            submissions.push(s);

            for (const pItem of pItems) {
                submissionItems.push(SubmissionItemFactory.create(s.id, pItem.id));
            }

            const randomKblis = kbliData.filter((k: any) => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);
            const randomKbkis = kbkiData.filter((k: any) => k.level === 5).sort(() => 0.5 - Math.random()).slice(0, 1);

            for (const k of randomKblis) subKblis.push({ submissionId: s.id, kbliId: k.id });
            for (const k of randomKbkis) subKbkis.push({ submissionId: s.id, kbkiId: k.id });

            // Generate 1-3 Inaproc links per submission
            const linkCount = faker.number.int({ min: 1, max: 3 });
            for (let i = 0; i < linkCount; i++) {
                subInaprocLinks.push(SubmissionInaprocLinkFactory.create(s.id));
            }
        }
    }
    if (submissions.length) await insertInBatches(db, schema.submissions, submissions, 100);
    if (submissionItems.length) await insertInBatches(db, schema.submissionItems, submissionItems, 500);
    if (subInaprocLinks.length) await insertInBatches(db, schema.submissionInaprocLinks, subInaprocLinks, 500);
    if (subKblis.length) await insertInBatches(db, schema.submissionKblis, subKblis, 500);
    if (subKbkis.length) await insertInBatches(db, schema.submissionKbkis, subKbkis, 500);
    console.log(`✅ Success: ${submissions.length} submissions recorded with items and Inaproc links.`);

    // 11. Seed Notifications
    console.log('🔔 Action: Initializing Notification Engine...');
    const notifications = allUsers.flatMap(u =>
        Array.from({ length: 3 }).map(() => NotificationFactory.create(u.id))
    );
    await insertInBatches(db, schema.notifications, notifications, 500);
    console.log(`✅ Success: ${notifications.length} notifications dispatched.`);

    console.log('\n-----------------------------------------');
    console.log('📢 STATUS: DEPLOYMENT READY (V4 - SUBSCRIPTIONS)');
    console.log('✅ SEEDING COMPLETE');
    console.log('-----------------------------------------\n');

    process.exit(0);
}

main().catch((err) => {
    console.error('❌ CRITICAL ERROR: Seeding failed:', err);
    process.exit(1);
});
