import { pgTable, serial, integer, text, timestamp, boolean, varchar, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'ADMIN_TBP', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT', 'MANUFACT_PROCUREMENT']);
export const statusEnum = pgEnum('status', ['OPEN', 'CLOSED', 'DRAFT']);
export const submissionStatusEnum = pgEnum('submission_status', ['PENDING', 'ACCEPTED', 'REJECTED']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['ACTIVE', 'EXPIRED', 'CANCELED']);

export const kbli = pgTable('kbli', {
	id: text('id').primaryKey(), // Full code (e.g., '01111')
	name: text('name').notNull(), // Indonesian description
	level: integer('level').notNull(), // 1 to 5
	parentId: text('parent_id').references((): any => kbli.id)
});

export const kbki = pgTable('kbki', {
	id: text('id').primaryKey(), // Full code (e.g., '1.11.111')
	name: text('name').notNull(),
	level: integer('level').notNull(),
	parentId: text('parent_id').references((): any => kbki.id)
});

export const bas = pgTable('bas', {
	id: text('id').primaryKey(), // Account code (e.g., '521211')
	name: text('name').notNull(),
	level: integer('level').notNull(),
	parentId: text('parent_id').references((): any => bas.id)
});

export const bmn = pgTable('bmn', {
	id: text('id').primaryKey(), // Kodefikasi BMN (e.g., '3.01.01.01.001')
	kodefikasiBmn: text('kodefikasi_bmn'), // Initial code (e.g., '11110')
	gol: text('gol'), // Golongan
	bid: text('bid'), // Bidang
	kel: text('kel'), // Kelompok
	subKel: text('sub_kel'), // Sub Kelompok
	subSubKel: text('sub_sub_kel'), // Sub-Sub Kelompok
	name: text('name').notNull(), // Uraian
	description: text('description'), // Keterangan (Ket)
	unit: text('unit'), // Satuan
	level: integer('level').notNull(),
	parentId: text('parent_id').references((): any => bmn.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const bmnImages = pgTable('bmn_images', {
	id: text('id').primaryKey(),
	bmnId: text('bmn_id')
		.notNull()
		.references(() => bmn.id),
	storagePath: text('storage_path').notNull(),
	fileName: text('file_name').notNull(),
	contentType: text('content_type').notNull(),
	size: integer('size').notNull(),
	isPrimary: boolean('is_primary').notNull().default(false),
	alt: text('alt'),
	uploadedBy: text('uploaded_by').references(() => user.id),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const provinces = pgTable('provinces', {
	id: text('id').primaryKey(), // Internal code (e.g., '11')
	name: text('name').notNull()
});

export const regencies = pgTable('regencies', {
	id: text('id').primaryKey(), // Internal code (e.g., '11.10')
	name: text('name').notNull(),
	provinceId: text('province_id')
		.references(() => provinces.id)
		.notNull()
});


export const user = pgTable('users', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	username: text('username').unique(),
	displayUsername: text('display_username'),
	emailVerified: boolean('email_verified').notNull().default(false),
	role: roleEnum('role').notNull().default('USER_PROCUREMENT'),
	avatar: text('avatar'),
	image: text('image'),
	phone: text('phone'),
	lastActiveAt: timestamp('last_active_at', { mode: 'date' }),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id)
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'date' }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'date' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }),
	updatedAt: timestamp('updated_at', { mode: 'date' })
});

// Merged into 'user' table

export const companyProfiles = pgTable('company_profiles', {
	userId: text('user_id').primaryKey().references(() => user.id),
	companyName: text('company_name').notNull(),
	website: text('website'),
	description: text('description'), // formerly history
	foundedYear: text('founded_year'),
	employeeCount: text('employee_count'),
	address: text('address'),
	nib: text('nib'), // Nomor Induk Berusaha
	provinceId: text('province_id').references(() => provinces.id),
	regencyId: text('regency_id').references(() => regencies.id),
	usernameSiinas: text('username_siinas').default('-')
});


export const governmentProfiles = pgTable('government_profiles', {
	userId: text('user_id').primaryKey().references(() => user.id),
	institutionName: text('institution_name').notNull(),
	department: text('department'),
	position: text('position'),
	nip: text('nip') // Official ID for Indonesian Govt
});

export const contactPersons = pgTable('contact_persons', {
	id: text('id').primaryKey(),
	companyId: text('company_id')
		.references(() => companyProfiles.userId)
		.notNull(),
	name: text('name').notNull(),
	position: text('position'),
	email: text('email'),
	phone: text('phone'),
	status: text('status').notNull().default('ACTIVE'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const roles = pgTable('roles', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(), // e.g., 'Super Admin', 'Procurement Officer'
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const permissions = pgTable('permissions', {
	id: text('id').primaryKey(),
	name: text('name').notNull().unique(), // e.g., 'procurement:create', 'user:delete'
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rolePermissions = pgTable('role_permissions', {
	roleId: text('role_id')
		.references(() => roles.id)
		.notNull(),
	permissionId: text('permission_id')
		.references(() => permissions.id)
		.notNull()
});

export const userRoles = pgTable('user_roles', {
	userId: text('user_id')
		.references(() => user.id)
		.notNull(),
	roleId: text('role_id')
		.references(() => roles.id)
		.notNull()
});

export const activityLogs = pgTable('activity_logs', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id), // Nullable for system actions or anon? Usually tracked.
	action: text('action').notNull(), // e.g., 'LOGIN', 'CREATE_PROCUREMENT'
	entityType: text('entity_type'), // e.g., 'PROCUREMENT', 'SUBMISSION'
	entityId: text('entity_id'),
	metadata: text('metadata'), // JSON string for extra context
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const statusHistory = pgTable('status_history', {
	id: text('id').primaryKey(),
	entityType: text('entity_type').notNull(), // 'PROCUREMENT', 'SUBMISSION'
	entityId: text('entity_id').notNull(),
	statusFrom: text('status_from'),
	statusTo: text('status_to').notNull(),
	changedBy: text('changed_by').references(() => user.id).notNull(),
	notes: text('notes'),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const procurementMethods = pgTable('procurement_methods', {
	id: text('id').primaryKey(), // e.g., 'tender-terbuka'
	name: text('name').notNull(), // e.g., 'Tender Terbuka'
	description: text('description'),
	status: text('status').notNull().default('ACTIVE') // e.g., 'ACTIVE', 'INACTIVE'
});

export const procurementTypes = pgTable('procurement_types', {
	id: text('id').primaryKey(), // e.g., 'barang'
	name: text('name').notNull(), // e.g., 'Barang'
	description: text('description'),
	status: text('status').notNull().default('ACTIVE') // e.g., 'ACTIVE', 'INACTIVE'
});

export const procurements = pgTable('procurements', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	budget: text('budget').notNull(),
	deadline: text('deadline').notNull(),
	status: statusEnum('status').notNull().default('OPEN'),
	currency: text('currency').default('IDR').notNull(),
	methodId: text('method_id').references(() => procurementMethods.id),
	typeId: text('type_id').references(() => procurementTypes.id),
	basId: text('bas_id').references(() => bas.id),
	bmnId: text('bmn_id').references(() => bmn.id),
	provinceId: text('province_id').references(() => provinces.id),
	regencyId: text('regency_id').references(() => regencies.id),
	location: text('location'),
	isPdn: boolean('is_pdn').default(true).notNull(),
	isTkdn: boolean('is_tkdn').default(false).notNull(),
	tkdnPercentage: integer('tkdn_percentage').default(0).notNull(),
	sessionTag: integer('session_tag').default(1).notNull(), // Sequences 1, 2, 3, 4
	createdBy: text('created_by').references(() => user.id).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const submissions = pgTable('submissions', {
	id: text('id').primaryKey(),
	procurementId: text('procurement_id')
		.references(() => procurements.id)
		.notNull(),
	userId: text('user_id')
		.references(() => user.id)
		.notNull(),
	companyName: text('company_name').notNull(),
	companyDescription: text('company_description').notNull(),
	profileImage: text('profile_image'), // Base64
	flyerImage: text('flyer_image'), // Base64
	flyerDescription: text('flyer_description'), // Markdown
	submittedAt: timestamp('submitted_at').defaultNow().notNull(),
	status: submissionStatusEnum('status').notNull().default('PENDING')
});

export const procurementItems = pgTable('procurement_items', {
	id: text('id').primaryKey(),
	procurementId: text('procurement_id')
		.references(() => procurements.id)
		.notNull(),
	name: text('name').notNull(),
	description: text('description'),
	quantity: integer('quantity').notNull().default(1),
	unit: text('unit').notNull().default('Unit'), // e.g., 'Lot', 'Kg', 'Unit'
	bmnId: text('bmn_id').references(() => bmn.id),
	isPdn: boolean('is_pdn').default(true).notNull(),
	isTkdn: boolean('is_tkdn').default(false).notNull(),
	tkdnPercentage: integer('tkdn_percentage').default(0).notNull(),
	estimatedPrice: text('estimated_price'), // Optional budget info per line item
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const procurementRules = pgTable('procurement_rules', {
	id: text('id').primaryKey(),
	procurementId: text('procurement_id')
		.references(() => procurements.id)
		.notNull(),
	rule: text('rule').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const submissionItems = pgTable('submission_items', {
	id: text('id').primaryKey(),
	submissionId: text('submission_id')
		.references(() => submissions.id)
		.notNull(),
	procurementItemId: text('procurement_item_id')
		.references(() => procurementItems.id)
		.notNull(),
	isPdn: boolean('is_pdn').default(true).notNull(),
	isTkdn: boolean('is_tkdn').default(false).notNull(),
	tkdnPercentage: integer('tkdn_percentage').default(0).notNull(),
	offeredPrice: text('offered_price').notNull(),
	specification: text('specification'), // Vendor's detailed spec for this item
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const submissionInaprocLinks = pgTable('submission_inaproc_links', {
	id: text('id').primaryKey(),
	submissionId: text('submission_id')
		.references(() => submissions.id)
		.notNull(),
	url: text('url').notNull(),
	label: text('label').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const notifications = pgTable('notifications', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	title: text('title').notNull(),
	message: text('message').notNull(),
	type: text('type').notNull().default('INFO'), // INFO, SUCCESS, WARNING, ACTION_REQUIRED
	read: boolean('read').notNull().default(false),
	// Actionable fields
	referenceId: text('reference_id'), // ID of the related procurement or submission
	referenceType: text('reference_type'), // 'PROCUREMENT', 'SUBMISSION'
	actionUrl: text('action_url'), // Link to take action
	metadata: text('metadata'), // JSON string for extra data (e.g., procurement title)
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const procurementKblis = pgTable('procurement_kblis', {
	procurementId: text('procurement_id').references(() => procurements.id).notNull(),
	kbliId: text('kbli_id').references(() => kbli.id).notNull()
});

export const procurementKbkis = pgTable('procurement_kbkis', {
	procurementId: text('procurement_id').references(() => procurements.id).notNull(),
	kbkiId: text('kbki_id').references(() => kbki.id).notNull()
});

export const submissionKblis = pgTable('submission_kblis', {
	submissionId: text('submission_id').references(() => submissions.id).notNull(),
	kbliId: text('kbli_id').references(() => kbli.id).notNull()
});

export const submissionKbkis = pgTable('submission_kbkis', {
	submissionId: text('submission_id').references(() => submissions.id).notNull(),
	kbkiId: text('kbki_id').references(() => kbki.id).notNull()
});

export const userKblis = pgTable('user_kblis', {
	userId: text('user_id').references(() => companyProfiles.userId).notNull(),
	kbliId: text('kbli_id').references(() => kbli.id).notNull()
});

export const userKbkis = pgTable('user_kbkis', {
	userId: text('user_id').references(() => companyProfiles.userId).notNull(),
	kbkiId: text('kbki_id').references(() => kbki.id).notNull()
});

export const kbliKbkiMapping = pgTable('kbli_kbki_mapping', {
	kbliId: text('kbli_id').references(() => kbli.id).notNull(),
	kbkiId: text('kbki_id').references(() => kbki.id).notNull()
});

export const subscriptionPlans = pgTable('subscription_plans', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	price: text('price').notNull(), // Per month, e.g., 'Rp 500.000'
	maxSubmissions: integer('max_submissions').notNull().default(0), // 0 for unlimited or specific limit
	features: text('features'), // Markdown or JSON list of features
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const subscriptions = pgTable('subscriptions', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id).notNull(),
	planId: text('plan_id').references(() => subscriptionPlans.id).notNull(),
	status: subscriptionStatusEnum('status').notNull().default('ACTIVE'),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const systemConfigs = pgTable('system_configs', {
	key: text('key').primaryKey(), // e.g., 'ENFORCE_SUBSCRIPTION'
	value: text('value').notNull(), // 'true', 'false', or other stringified config
	description: text('description'),
	updatedBy: text('updated_by').references(() => user.id), // Tracks which Super Admin last changed it
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sharedProfiles = pgTable('shared_profiles', {
	id: text('id').primaryKey(),
	vendorId: text('vendor_id')
		.references(() => user.id)
		.notNull(),
	adminId: text('admin_id')
		.references(() => user.id)
		.notNull(),
	procurementId: text('procurement_id').references(() => procurements.id),
	sharedAt: timestamp('shared_at').defaultNow().notNull()
});

// export * from './auth.schema'; // Removed in favor of managed Neon Auth

export const userRelations = relations(user, ({ one, many }) => ({
	sessions: many(session),
	accounts: many(account),
	companyProfile: one(companyProfiles, {
		fields: [user.id],
		references: [companyProfiles.userId]
	}),
	governmentProfile: one(governmentProfiles, {
		fields: [user.id],
		references: [governmentProfiles.userId]
	}),
	procurements: many(procurements),
	submissions: many(submissions),
	notifications: many(notifications),
	subscriptions: many(subscriptions),
	sharedAsVendor: many(sharedProfiles, { relationName: 'shared_as_vendor' }),
	sharedAsAdmin: many(sharedProfiles, { relationName: 'shared_as_admin' })
}));

// Merged into 'userRelations'

export const companyProfilesRelations = relations(companyProfiles, ({ one, many }) => ({
	user: one(user, {
		fields: [companyProfiles.userId],
		references: [user.id]
	}),
	province: one(provinces, {
		fields: [companyProfiles.provinceId],
		references: [provinces.id]
	}),
	regency: one(regencies, {
		fields: [companyProfiles.regencyId],
		references: [regencies.id]
	}),
	kblis: many(userKblis),
	kbkis: many(userKbkis),
	submissions: many(submissions),
	contactPersons: many(contactPersons)
}));

export const provincesRelations = relations(provinces, ({ many }) => ({
	regencies: many(regencies),
	companies: many(companyProfiles)
}));

export const contactPersonsRelations = relations(contactPersons, ({ one }) => ({
	companyProfile: one(companyProfiles, {
		fields: [contactPersons.companyId],
		references: [companyProfiles.userId]
	})
}));

export const regenciesRelations = relations(regencies, ({ one, many }) => ({
	province: one(provinces, {
		fields: [regencies.provinceId],
		references: [provinces.id]
	}),
	companies: many(companyProfiles)
}));


export const governmentProfilesRelations = relations(governmentProfiles, ({ one, many }) => ({
	user: one(user, {
		fields: [governmentProfiles.userId],
		references: [user.id]
	}),
	procurements: many(procurements)
}));

export const kbliRelations = relations(kbli, ({ one, many }) => ({
	parent: one(kbli, {
		fields: [kbli.parentId],
		references: [kbli.id],
		relationName: 'kbli_hierarchy'
	}),
	children: many(kbli, {
		relationName: 'kbli_hierarchy'
	}),
	procurements: many(procurementKblis),
	submissions: many(submissionKblis),
	kbkiMappings: many(kbliKbkiMapping),
	companies: many(userKblis)
}));

export const kbkiRelations = relations(kbki, ({ one, many }) => ({
	parent: one(kbki, {
		fields: [kbki.parentId],
		references: [kbki.id],
		relationName: 'kbki_hierarchy'
	}),
	children: many(kbki, {
		relationName: 'kbki_hierarchy'
	}),
	procurements: many(procurementKbkis),
	submissions: many(submissionKbkis),
	kbkiMappings: many(kbliKbkiMapping),
	companies: many(userKbkis)
}));

export const basRelations = relations(bas, ({ one, many }) => ({
	parent: one(bas, {
		fields: [bas.parentId],
		references: [bas.id],
		relationName: 'bas_hierarchy'
	}),
	children: many(bas, {
		relationName: 'bas_hierarchy'
	}),
	procurements: many(procurements)
}));

export const bmnRelations = relations(bmn, ({ one, many }) => ({
	parent: one(bmn, {
		fields: [bmn.parentId],
		references: [bmn.id],
		relationName: 'bmn_hierarchy'
	}),
	children: many(bmn, {
		relationName: 'bmn_hierarchy'
	}),
	images: many(bmnImages),
	procurements: many(procurements),
	procurementItems: many(procurementItems)
}));

export const bmnImagesRelations = relations(bmnImages, ({ one }) => ({
	bmn: one(bmn, {
		fields: [bmnImages.bmnId],
		references: [bmn.id]
	}),
	uploader: one(user, {
		fields: [bmnImages.uploadedBy],
		references: [user.id]
	})
}));

export const procurementItemsRelations = relations(procurementItems, ({ one, many }) => ({
	procurement: one(procurements, {
		fields: [procurementItems.procurementId],
		references: [procurements.id]
	}),
	bmn: one(bmn, {
		fields: [procurementItems.bmnId],
		references: [bmn.id]
	}),
	submissions: many(submissionItems)
}));

export const submissionItemsRelations = relations(submissionItems, ({ one }) => ({
	submission: one(submissions, {
		fields: [submissionItems.submissionId],
		references: [submissions.id]
	}),
	procurementItem: one(procurementItems, {
		fields: [submissionItems.procurementItemId],
		references: [procurementItems.id]
	})
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
	procurement: one(procurements, {
		fields: [submissions.procurementId],
		references: [procurements.id]
	}),
	user: one(user, {
		fields: [submissions.userId],
		references: [user.id]
	}),
	kblis: many(submissionKblis),
	kbkis: many(submissionKbkis),
	items: many(submissionItems)
}));

export const procurementsRelations = relations(procurements, ({ one, many }) => ({
	user: one(user, {
		fields: [procurements.createdBy],
		references: [user.id]
	}),
	method: one(procurementMethods, {
		fields: [procurements.methodId],
		references: [procurementMethods.id]
	}),
	type: one(procurementTypes, {
		fields: [procurements.typeId],
		references: [procurementTypes.id]
	}),
	bas: one(bas, {
		fields: [procurements.basId],
		references: [bas.id]
	}),
	bmn: one(bmn, {
		fields: [procurements.bmnId],
		references: [bmn.id]
	}),
	province: one(provinces, {
		fields: [procurements.provinceId],
		references: [provinces.id]
	}),
	regency: one(regencies, {
		fields: [procurements.regencyId],
		references: [regencies.id]
	}),
	submissions: many(submissions),
	kblis: many(procurementKblis),
	kbkis: many(procurementKbkis),
	items: many(procurementItems),
	rules: many(procurementRules)
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
	changedBy: one(user, {
		fields: [statusHistory.changedBy],
		references: [user.id]
	})
}));

export const procurementMethodsRelations = relations(procurementMethods, ({ many }) => ({
	procurements: many(procurements)
}));

export const procurementTypesRelations = relations(procurementTypes, ({ many }) => ({
	procurements: many(procurements)
}));

export const procurementKblisRelations = relations(procurementKblis, ({ one }) => ({
	procurement: one(procurements, { fields: [procurementKblis.procurementId], references: [procurements.id] }),
	kbli: one(kbli, { fields: [procurementKblis.kbliId], references: [kbli.id] })
}));

export const procurementKbkisRelations = relations(procurementKbkis, ({ one }) => ({
	procurement: one(procurements, { fields: [procurementKbkis.procurementId], references: [procurements.id] }),
	kbki: one(kbki, { fields: [procurementKbkis.kbkiId], references: [kbki.id] })
}));

export const submissionKblisRelations = relations(submissionKblis, ({ one }) => ({
	submission: one(submissions, { fields: [submissionKblis.submissionId], references: [submissions.id] }),
	kbli: one(kbli, { fields: [submissionKblis.kbliId], references: [kbli.id] })
}));

export const submissionKbkisRelations = relations(submissionKbkis, ({ one }) => ({
	submission: one(submissions, { fields: [submissionKbkis.submissionId], references: [submissions.id] }),
	kbki: one(kbki, { fields: [submissionKbkis.kbkiId], references: [kbki.id] })
}));

export const kbliKbkiMappingRelations = relations(kbliKbkiMapping, ({ one }) => ({
	kbli: one(kbli, { fields: [kbliKbkiMapping.kbliId], references: [kbli.id] }),
	kbki: one(kbki, { fields: [kbliKbkiMapping.kbkiId], references: [kbki.id] })
}));

export const userKblisRelations = relations(userKblis, ({ one }) => ({
	company: one(companyProfiles, { fields: [userKblis.userId], references: [companyProfiles.userId] }),
	kbli: one(kbli, { fields: [userKblis.kbliId], references: [kbli.id] })
}));

export const userKbkisRelations = relations(userKbkis, ({ one }) => ({
	company: one(companyProfiles, { fields: [userKbkis.userId], references: [companyProfiles.userId] }),
	kbki: one(kbki, { fields: [userKbkis.kbkiId], references: [kbki.id] })
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
	subscriptions: many(subscriptions)
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(user, {
		fields: [subscriptions.userId],
		references: [user.id]
	}),
	plan: one(subscriptionPlans, {
		fields: [subscriptions.planId],
		references: [subscriptionPlans.id]
	})
}));

export const systemConfigsRelations = relations(systemConfigs, ({ one }) => ({
	admin: one(user, {
		fields: [systemConfigs.updatedBy],
		references: [user.id]
	})
}));

export const sharedProfilesRelations = relations(sharedProfiles, ({ one }) => ({
	vendor: one(user, {
		fields: [sharedProfiles.vendorId],
		references: [user.id],
		relationName: 'shared_as_vendor'
	}),
	admin: one(user, {
		fields: [sharedProfiles.adminId],
		references: [user.id],
		relationName: 'shared_as_admin'
	}),
	procurement: one(procurements, {
		fields: [sharedProfiles.procurementId],
		references: [procurements.id]
	})
}));

export const procurementRulesRelations = relations(procurementRules, ({ one }) => ({
	procurement: one(procurements, { fields: [procurementRules.procurementId], references: [procurements.id] })
}));

export type NewUser = typeof user.$inferInsert;
export type User = typeof user.$inferSelect;
export type Procurement = typeof procurements.$inferSelect;
export type ProcurementMethod = typeof procurementMethods.$inferSelect;
export type ProcurementItem = typeof procurementItems.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type ContactPerson = typeof contactPersons.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type Regency = typeof regencies.$inferSelect;
export type ProcurementRule = typeof procurementRules.$inferSelect;
export type ProcurementWithItems = Procurement & {
	items: ProcurementItem[];
	province?: Province | null;
	regency?: Regency | null;
};
export type ProcurementWithDetails = ProcurementWithItems & { rules: ProcurementRule[] };
export type SubmissionInaprocLink = typeof submissionInaprocLinks.$inferSelect;

export const submissionInaprocLinksRelations = relations(submissionInaprocLinks, ({ one }) => ({
	submission: one(submissions, {
		fields: [submissionInaprocLinks.submissionId],
		references: [submissions.id]
	})
}));

