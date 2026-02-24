
import { Role, User, Procurement } from './types';

export const DUMMY_USERS: User[] = [
  {
    id: '1',
    name: 'Super Admin One',
    email: 'super@procurify.com',
    role: Role.SUPER_ADMIN,
    avatar: 'https://picsum.photos/seed/admin1/200'
  },
  {
    id: '2',
    name: 'Sarah Procurement',
    email: 'sarah.p@company.com',
    role: Role.ADMIN_PROCUREMENT,
    avatar: 'https://picsum.photos/seed/admin2/200'
  },
  {
    id: '3',
    name: 'John Vendor',
    email: 'john@vendorph.com',
    role: Role.USER_PROCUREMENT,
    companyName: 'Vendor PH Solutions',
    avatar: 'https://picsum.photos/seed/user1/200',
    phone: '+63 917 123 4567',
    website: 'www.vendorphsolutions.com',
    foundedYear: '2015',
    employeeCount: '250-500',
    history: 'Vendor PH Solutions started as a small tech collective in Manila. Over the last decade, we have expanded into a full-scale enterprise partner, specializing in logistics, cloud infrastructure, and sustainable supply chain management. We pride ourselves on our 98% project completion rate and our commitment to carbon-neutral operations.',
    ratings: [5, 4, 5, 5]
  }
];

export const DUMMY_PROCUREMENTS: Procurement[] = [
  {
    id: 'p1',
    title: 'Cloud Infrastructure Upgrade 2024',
    description: 'Bidding for enterprise-grade cloud migration and support services for our primary data center.',
    budget: '$500,000',
    deadline: '2024-12-31',
    status: 'OPEN',
    createdBy: '2',
    createdAt: '2024-01-15'
  },
  {
    id: 'p2',
    title: 'Office Sustainable Furniture Supply',
    description: 'Procuring eco-friendly workstations and ergonomic seating for the new satellite office in downtown.',
    budget: '$85,000',
    deadline: '2024-11-20',
    status: 'OPEN',
    createdBy: '2',
    createdAt: '2024-02-10'
  }
];
