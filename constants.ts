import { Vehicle, Venue, Order } from './types';

export const VEHICLES: Vehicle[] = [
  { id: 'v1', name: 'Unit 104', type: 'Truck', capacity: 85, status: 'Active', image: 'https://picsum.photos/200/150' },
  { id: 'v2', name: 'Unit 202', type: 'Truck', capacity: 12, status: 'En Route', image: 'https://picsum.photos/201/150' },
  { id: 'v3', name: 'Sprinter A', type: 'Van', capacity: 0, status: 'Active', image: 'https://picsum.photos/202/150' },
  { id: 'v4', name: 'Unit 105', type: 'Truck', capacity: 100, status: 'Maintenance', image: 'https://picsum.photos/203/150' },
];

export const VENUES: Venue[] = [
  { id: 'vn1', name: 'The Grand Hotel', difficulty: 8, notes: 'Narrow loading dock, strict timing.' },
  { id: 'vn2', name: 'Riverside Pavilion', difficulty: 2, notes: 'Direct ramp access, very easy.' },
  { id: 'vn3', name: 'Downtown Loft', difficulty: 9, notes: 'Freight elevator only, 2hr window.' },
];

export const RECENT_ORDERS: Order[] = [
  { id: 'o1', client: 'Smith Wedding', venue: 'The Grand Hotel', status: 'Routed', items: 145 },
  { id: 'o2', client: 'Tech Corp Gala', venue: 'Riverside Pavilion', status: 'Pending', items: 320 },
  { id: 'o3', client: 'Charity Auction', venue: 'Downtown Loft', status: 'Pending', items: 50 },
];
