import { fakerID_ID as faker } from '@faker-js/faker';
import locations from '../../data/locations.json';
import kbliData from '../../data/kbli_data.json';
import kbkiData from '../../data/kbki_data.json';
import kbkiMappings from '../../data/kbki_mapping_data.json';
import legacyUsers from '../../data/legacy_users.json';
import bmnData from '../../data/bmn_data.json';

import { type NewUser } from './schema';

export class LegacyUserFactory {
    static getLegacyUsers(): NewUser[] {
        return legacyUsers.map((u: any) => ({
            id: faker.string.uuid(),
            name: u.name,
            username: u.username,
            displayUsername: u.displayUsername,
            email: u.email.toLowerCase(),
            emailVerified: true,
            role: 'ADMIN_PROCUREMENT' as const,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
            image: null,
            phone: null,
            lastActiveAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
    }

    static isLegacyUser(email: string): boolean {
        return legacyUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    }
}

import { hashPassword } from 'better-auth/crypto';

export class UserFactory {
    static create(overrides = {}): NewUser {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const email = faker.internet.email({ firstName, lastName });

        return {
            id: faker.string.uuid(),
            name: `${firstName} ${lastName}`,
            email: email.toLowerCase(),
            username: email.split('@')[0],
            displayUsername: `${firstName} ${lastName}`,
            emailVerified: true,
            role: 'USER_PROCUREMENT' as const,
            avatar: faker.image.avatar(),
            image: faker.image.avatar(),
            phone: faker.phone.number(),
            lastActiveAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        };
    }

    static async createWithAccount(overrides = {}, accountOverrides = {}) {
        const userData = this.create(overrides);
        const accountData = await AccountFactory.create(userData.id, accountOverrides);
        return { user: userData, account: accountData };
    }

    static getDefaultUsers() {
        return [
            this.create({
                id: 'super-admin-id',
                name: 'Super Admin BM',
                email: 'super.admin@bm.2026',
                role: 'SUPER_ADMIN',
                companyName: 'Procurify Indonesia HQ'
            }),
            this.create({
                id: 'admin-procurement-id',
                name: 'Admin Pengadaan',
                email: 'admin@bm.2026',
                role: 'ADMIN_PROCUREMENT',
                companyName: 'LPSE Kementerian'
            }),
            this.create({
                id: 'user-procurement-id',
                name: 'Vendor Utama',
                email: 'user@bm.2026',
                role: 'USER_PROCUREMENT',
                companyName: 'PT Teknologi Nusantara'
            })
        ];
    }

    static createAdmin(overrides = {}) {
        return this.create({
            role: 'ADMIN_PROCUREMENT',
            ...overrides
        });
    }

    static createSuperAdmin(overrides = {}) {
        return this.create({
            role: 'SUPER_ADMIN',
            ...overrides
        });
    }
}

export class AccountFactory {
    static async create(userId: string, overrides = {}) {
        const now = new Date();
        const { password: plainPasswordOverride, ...restOverrides } = overrides as any;
        const plainPassword = plainPasswordOverride || 'password123';
        const hashedPassword = await hashPassword(plainPassword);

        return {
            id: faker.string.uuid(),
            accountId: userId, // Link by userId for Better Auth credential provider
            providerId: 'credential', // Singular 'credential' as expected by Better Auth
            userId,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
            ...restOverrides
        };
    }

    static async createForDefaultUsers(userId: string, email: string) {
        // Mapping emails to a standard password for default users
        const passwordMap: Record<string, string> = {
            'super.admin@bm.2026': 'bm2026',
            'admin@bm.2026': 'bm2026',
            'user@bm.2026': 'bm2026'
        };

        const plainPassword = passwordMap[email] || 'bm2026';

        return this.create(userId, {
            password: plainPassword
        });
    }
}

export class CompanyProfileFactory {
    static create(userId: string, overrides: { provinceId?: string, regencyId?: string } & any = {}) {
        return {
            userId,
            companyName: faker.company.name(),
            website: faker.internet.url(),
            description: faker.lorem.paragraph(),
            foundedYear: faker.date.past({ years: 20 }).getFullYear().toString(),
            employeeCount: faker.number.int({ min: 10, max: 1000 }).toString(),
            address: faker.location.streetAddress(),
            nib: faker.string.numeric(13),
            provinceId: overrides.provinceId || null,
            regencyId: overrides.regencyId || null,
            usernameSiinas: faker.internet.username(),
            ...overrides
        };
    }
}


export class GovernmentProfileFactory {
    static create(userId: string, overrides = {}) {
        const institutions = [
            'Kementerian Kesehatan',
            'Kementerian Perhubungan',
            'Kementerian Pendidikan dan Kebudayaan',
            'Biro Pusat Statistik',
            'LKPP'
        ];
        return {
            userId,
            institutionName: faker.helpers.arrayElement(institutions),
            department: faker.commerce.department(),
            position: faker.person.jobTitle(),
            nip: faker.string.numeric(18),
            ...overrides
        };
    }
}

export class LocationFactory {
    static getProvinces() {
        return (locations as any).provinces.filter((p: any) => !p.id.toLowerCase().includes('kode'));
    }

    static getRegencies() {
        return (locations as any).regencies.filter((r: any) => !r.id.toLowerCase().includes('kode'));
    }
}

export class KBLIFactory {
    static create(id: string, name: string, level: number, parentId?: string) {
        return {
            id,
            name,
            level,
            parentId: parentId || null
        };
    }

    private static seedDataCache: any[] | null = null;
    static getSeedData() {
        if (this.seedDataCache) return this.seedDataCache;
        const unique = new Map();
        for (const item of kbliData) {
            const castItem = item as any;
            if (castItem.id && !unique.has(castItem.id)) {
                unique.set(castItem.id, item);
            }
        }
        this.seedDataCache = Array.from(unique.values());
        return this.seedDataCache;
    }
}

export class KBKIFactory {
    static create(id: string, name: string, level: number, parentId?: string) {
        return {
            id,
            name,
            level,
            parentId: parentId || null
        };
    }

    private static seedDataCache: any[] | null = null;
    static getSeedData() {
        if (this.seedDataCache) return this.seedDataCache;
        const unique = new Map();
        for (const item of kbkiData) {
            const castItem = item as any;
            if (castItem.id && castItem.id !== 'undefined' && castItem.name && !unique.has(castItem.id)) {
                unique.set(castItem.id, item);
            }
        }
        this.seedDataCache = Array.from(unique.values());
        return this.seedDataCache;
    }

    private static mappingsCache: any[] | null = null;
    static getMappings() {
        if (this.mappingsCache) return this.mappingsCache;
        const seedData = this.getSeedData();
        const kbkiIds = new Set(seedData.map((k: any) => k.id));
        const kbliIds = new Set(kbliData.map((k: any) => k.id));

        const unique = new Set();
        const result = [];
        for (const m of kbkiMappings) {
            const castM = m as any;
            const key = `${castM.kbkiId}|${castM.kbliId}`;
            if (
                castM.kbkiId && castM.kbkiId !== 'undefined' &&
                castM.kbliId && castM.kbliId !== 'undefined' &&
                kbkiIds.has(castM.kbkiId) &&
                kbliIds.has(castM.kbliId) &&
                !unique.has(key)
            ) {
                unique.add(key);
                result.push(m);
            }
        }
        this.mappingsCache = result;
        return this.mappingsCache;
    }
}

export class ProcurementMethodFactory {
    static getStandardMethods() {
        return [
            {
                id: 'tender-terbuka',
                name: 'Tender Terbuka',
                description: 'Proses pengadaan yang dilakukan secara terbuka untuk umum dengan pengumuman secara luas.',
                status: 'ACTIVE'
            },
            {
                id: 'tender-cepat',
                name: 'Tender Cepat',
                description: 'Proses pengadaan yang dilakukan secara cepat untuk kebutuhan yang mendesak atau spesifik.',
                status: 'ACTIVE'
            },
            {
                id: 'tender-dua-tahap',
                name: 'Tender Dua Tahap',
                description: 'Proses pengadaan yang dilakukan melalui dua tahap evaluasi.',
                status: 'ACTIVE'
            },
            {
                id: 'penunjukan-langsung',
                name: 'Penunjukan Langsung',
                description: 'Proses pengadaan dengan menunjuk langsung penyedia barang/jasa tertentu dalam kondisi tertentu.',
                status: 'ACTIVE'
            }
        ];
    }
}

export class ProcurementTypeFactory {
    static getStandardTypes() {
        return [
            {
                id: 'barang',
                name: 'Barang',
                description: 'Setiap benda baik berwujud maupun tidak berwujud, bergerak maupun tidak bergerak, yang dapat diperdagangkan, dipakai, dipergunakan atau dimanfaatkan oleh Pengguna Barang.',
                status: 'ACTIVE'
            },
            {
                id: 'pekerjaan-konstruksi',
                name: 'Pekerjaan Konstruksi',
                description: 'Keseluruhan atau sebagian kegiatan yang meliputi pembangunan, pengoperasian, pemeliharaan, pembongkaran, dan pembangunan kembali suatu bangunan.',
                status: 'ACTIVE'
            },
            {
                id: 'jasa-konsultasi',
                name: 'Jasa Konsultasi',
                description: 'Jasa layanan profesional yang membutuhkan keahlian tertentu di berbagai bidang keilmuan yang mengutamakan adanya olah pikir.',
                status: 'ACTIVE'
            },
            {
                id: 'jasa-lainnya',
                name: 'Jasa Lainnya',
                description: 'Jasa yang membutuhkan kemampuan tertentu yang mengutamakan keterampilan (skill-ware) dalam suatu sistem tata kelola yang telah dikenal luas di dunia usaha untuk menyelesaikan suatu pekerjaan.',
                status: 'ACTIVE'
            }
        ];
    }
}

export class ProcurementFactory {
    static create(userId: string, overrides = {}) {
        const indonesianTitles = [
            'Pembangunan Jembatan Beton Bertulang Tahap II',
            'Pengadaan Perangkat Lunak Server Cloud Nasional',
            'Renovasi Gedung Kantor Wilayah Jakarta Timur',
            'Pengadaan Alat Tulis Kantor dan Logistik Tahunan',
            'Konstruksi Jalan Tol Lintas Sumatera Seksi 5',
            'Implementasi Sistem ERP Terintegrasi BUMN',
            'Pengadaan Kendaraan Dinas Roda Empat (Hybrid)',
            'Penyediaan Jasa Kebersihan Gedung Pusat Data'
        ];

        return {
            id: faker.string.uuid(),
            title: faker.helpers.arrayElement(indonesianTitles),
            description: faker.lorem.paragraphs(2),
            budget: `Rp ${faker.number.int({ min: 500000000, max: 50000000000 }).toLocaleString('id-ID')}`,
            deadline: faker.date.future().toLocaleDateString('id-ID'),
            status: 'OPEN' as const,
            methodId: faker.helpers.arrayElement(['tender-terbuka', 'tender-cepat', 'tender-dua-tahap', 'penunjukan-langsung']),
            typeId: faker.helpers.arrayElement(['barang', 'pekerjaan-konstruksi', 'jasa-konsultasi', 'jasa-lainnya']),
            basId: null as string | null,
            bmnId: null as string | null,
            createdBy: userId,
            createdAt: new Date(),
            isPdn: true,
            isTkdn: false,
            tkdnPercentage: 0,
            sessionTag: faker.helpers.arrayElement([1, 2, 3, 4]),
            ...overrides
        };
    }
}

export class SubmissionFactory {
    static create(procurementId: string, userId: string, overrides = {}) {
        return {
            id: faker.string.uuid(),
            procurementId,
            userId,
            companyName: faker.company.name(),
            companyDescription: faker.lorem.sentence(),
            profileImage: null,
            flyerImage: null,
            flyerDescription: faker.lorem.paragraphs(1), // Default to some markdown-like text
            submittedAt: new Date(),
            status: 'PENDING' as const,
            ...overrides
        };
    }
}

export class ProcurementItemFactory {
    static create(procurementId: string, overrides = {}) {
        const items = [
            { name: 'Server Rack 42U', unit: 'Unit' },
            { name: 'Cat6 Ethernet Cable', unit: 'Meter' },
            { name: 'CCTV Outdoor 4K', unit: 'Unit' },
            { name: 'Jasa Instalasi Jaringan', unit: 'Lot' },
            { name: 'Lisensi OS Server', unit: 'Lisensi' },
            { name: 'Beton Ready Mix K-350', unit: 'm3' },
            { name: 'Besi Ulir D16', unit: 'Batang' },
            { name: 'Semen Portland 50kg', unit: 'Sack' }
        ];
        const selected = faker.helpers.arrayElement(items);

        return {
            id: faker.string.uuid(),
            procurementId,
            name: selected.name,
            description: faker.commerce.productDescription(),
            quantity: faker.number.int({ min: 1, max: 100 }),
            unit: selected.unit,
            bmnId: null as string | null,
            estimatedPrice: `Rp ${faker.number.int({ min: 100000, max: 10000000 }).toLocaleString('id-ID')}`,
            createdAt: new Date(),
            isPdn: true,
            isTkdn: false,
            tkdnPercentage: 0,
            ...overrides
        };
    }
}

export class SubmissionItemFactory {
    static create(submissionId: string, procurementItemId: string, overrides = {}) {
        return {
            id: faker.string.uuid(),
            submissionId,
            procurementItemId,
            offeredPrice: `Rp ${faker.number.int({ min: 100000, max: 10000000 }).toLocaleString('id-ID')}`,
            specification: faker.lorem.sentence(),
            createdAt: new Date(),
            isPdn: true,
            isTkdn: false,
            tkdnPercentage: 0,
            ...overrides
        };
    }
}

export class NotificationFactory {
    static create(userId: string, overrides = {}) {
        const types = ['INFO', 'SUCCESS', 'WARNING'] as const;
        return {
            id: faker.string.uuid(),
            userId,
            title: faker.helpers.arrayElement(['Update Pengajuan', 'Tender Baru Terbit', 'Audit Selesai']),
            message: faker.lorem.sentence(),
            type: faker.helpers.arrayElement(types),
            read: false,
            createdAt: new Date(),
            ...overrides
        };
    }
}

export class SubscriptionPlanFactory {
    static getDefaultPlans() {
        return [
            {
                id: 'starter-plan',
                name: 'Starter',
                price: 'Rp 250.000',
                maxSubmissions: 5,
                features: '- Access to all procurements\n- 5 Bid submissions per month\n- Email support',
                createdAt: new Date()
            },
            {
                id: 'pro-plan',
                name: 'Pro',
                price: 'Rp 750.000',
                maxSubmissions: 25,
                features: '- Access to all procurements\n- 25 Bid submissions per month\n- Priority support\n- Custom reports',
                createdAt: new Date()
            },
            {
                id: 'enterprise-plan',
                name: 'Enterprise',
                price: 'Rp 2.500.000',
                maxSubmissions: 0, // Unlimited
                features: '- Access to all procurements\n- Unlimited Bid submissions\n- Dedicated account manager\n- API Access',
                createdAt: new Date()
            }
        ];
    }
}

export class SubscriptionFactory {
    static create(userId: string, planId: string, overrides = {}) {
        return {
            id: faker.string.uuid(),
            userId,
            planId,
            status: 'ACTIVE' as const,
            expiresAt: faker.date.future(),
            createdAt: new Date(),
            ...overrides
        };
    }
}

export class SystemConfigFactory {
    static getDefaultConfigs() {
        return [
            {
                key: 'ENFORCE_SUBSCRIPTION',
                value: 'false',
                description: 'Whether to require an active subscription for company users to view/bid on procurements',
                updatedBy: 'super-admin-id',
                updatedAt: new Date()
            }
        ];
    }
}

export class BasFactory {
    static getStandardBas() {
        return [
            { id: '52', name: 'Belanja Barang', level: 1, parentId: null },
            { id: '521', name: 'Belanja Barang Operasional', level: 2, parentId: '52' },
            { id: '5211', name: 'Belanja Keperluan Perkantoran', level: 3, parentId: '521' },
            { id: '521111', name: 'Belanja Keperluan Sehari-hari Perkantoran', level: 4, parentId: '5211' },
            { id: '5212', name: 'Belanja Barang Operasional Lainnya', level: 2, parentId: '52' },
            { id: '521211', name: 'Belanja Bahan', level: 3, parentId: '5212' },
            { id: '53', name: 'Belanja Modal', level: 1, parentId: null },
            { id: '532', name: 'Belanja Modal Peralatan dan Mesin', level: 2, parentId: '53' },
            { id: '5321', name: 'Belanja Modal Alat Besar', level: 3, parentId: '532' }
        ];
    }
}

export class BmnFactory {
    private static seedDataCache: any[] | null = null;
    static getStandardBmn() {
        if (this.seedDataCache) return this.seedDataCache;
        const unique = new Map();
        for (const item of bmnData) {
            const castItem = item as any;
            if (castItem.id && !unique.has(castItem.id)) {
                unique.set(castItem.id, item);
            }
        }
        this.seedDataCache = Array.from(unique.values());
        return this.seedDataCache;
    }
}

export class ProcurementRuleFactory {
    static getStandardRules(procurementId: string) {
        return [
            { id: faker.string.uuid(), procurementId, rule: 'Memiliki Nomor Induk Berusaha (NIB) yang masih berlaku' },
            { id: faker.string.uuid(), procurementId, rule: 'Memiliki pengalaman pekerjaan sejenis dalam 3 tahun terakhir' },
            { id: faker.string.uuid(), procurementId, rule: 'Bukan merupakan perusahaan yang sedang dalam pengawasan pengadilan atau pailit' },
            { id: faker.string.uuid(), procurementId, rule: 'Memiliki NPWP dan telah memenuhi kewajiban perpajakan tahun terakhir' },
            { id: faker.string.uuid(), procurementId, rule: 'Menyanggupi syarat dan ketentuan yang berlaku dalam dokumen pengadaan' }
        ];
    }

    static create(procurementId: string, rule: string) {
        return {
            id: faker.string.uuid(),
            procurementId,
            rule
        };
    }
}

export class SubmissionInaprocLinkFactory {
    static create(submissionId: string, overrides = {}) {
        const labels = [
            'Dokumen Kualifikasi Inaproc',
            'Bukti Verifikasi Pajak',
            'Sertifikat Badan Usaha (SBU)',
            'Dokumen Penawaran Teknis',
            'Laporan Keuangan Terverifikasi'
        ];
        return {
            id: faker.string.uuid(),
            submissionId,
            url: `https://inaproc.id/v/submission/${faker.string.alphanumeric(12)}`,
            label: faker.helpers.arrayElement(labels),
            createdAt: new Date(),
            ...overrides
        };
    }
}
