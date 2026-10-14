import { UserProfile, HermitProject, ActionTask } from '@/types';

export const INITIAL_HERMIT_USERS: UserProfile[] = [
  {
    id: 'u-1',
    email: 'director@hermitinvestments.co.zw',
    full_name: 'Farai Chigumira',
    role: 'executive',
    title: 'Managing Director & CIO',
    avatar_url: ''
  },
  {
    id: 'u-2',
    email: 'legal@hermitinvestments.co.zw',
    full_name: 'Tariro Moyo',
    role: 'analyst',
    title: 'Senior Regulatory & Legal Officer',
    avatar_url: ''
  },
  {
    id: 'u-3',
    email: 'finance@hermitinvestments.co.zw',
    full_name: 'Simba Nyathi',
    role: 'director',
    title: 'Head of Project Finance & PPAs',
    avatar_url: ''
  },
  {
    id: 'u-4',
    email: 'engineering@hermitinvestments.co.zw',
    full_name: 'Eng. Rutendo Shumba',
    role: 'engineer',
    title: 'Lead Grid & BESS Project Engineer',
    avatar_url: ''
  }
];

export const INITIAL_HERMIT_PROJECTS: HermitProject[] = [
  {
    id: 1,
    name: 'Marondera Solar PV Park (Phase 1)',
    technology: 'Solar PV',
    capacity_mw: 25.0,
    location: 'Mashonaland East',
    status: 'pipeline',
    target_cod: '2027-06-30',
    lead_manager: 'Eng. Rutendo Shumba',
    key_tags: ['ZETDC Grid Tie', 'ZERA PPA', 'SEFA Blended Debt', 'BESS Co-location']
  },
  {
    id: 2,
    name: 'Bulawayo C&I Solar Peaking Hub',
    technology: 'Solar + BESS',
    capacity_mw: 10.0,
    location: 'Bulawayo Industrial',
    status: 'feasibility',
    target_cod: '2027-11-15',
    lead_manager: 'Simba Nyathi',
    key_tags: ['Private C&I PPA', 'Battery Storage', 'Mining Offtake']
  },
  {
    id: 3,
    name: 'Manicaland Mini-Grid Concession',
    technology: 'Hydro',
    capacity_mw: 3.5,
    location: 'Manicaland',
    status: 'under_construction',
    target_cod: '2026-12-15',
    lead_manager: 'Farai Chigumira',
    key_tags: ['Rural Electrification', 'ZINWA Offtake', 'AfDB Grant']
  }
];
