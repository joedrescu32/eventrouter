export enum ViewState {
  INGEST = 'INGEST',
  SCHEDULE = 'SCHEDULE',
  ANALYSIS = 'ANALYSIS',
  WAREHOUSE = 'WAREHOUSE',
}

export interface Message {
  id: string;
  role: 'user' | 'system' | 'assistant';
  content: string;
  timestamp: Date;
  action?: ViewState; // If a message triggers a view change
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Truck' | 'Van';
  capacity: number; // percentage
  status: 'Active' | 'Maintenance' | 'En Route';
  image: string;
}

export interface Venue {
  id: string;
  name: string;
  difficulty: number; // 1-10
  notes: string;
}

export interface Order {
  id: string;
  client: string;
  venue: string;
  status: 'Pending' | 'Routed' | 'Delivered';
  items: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'ready';
}

// Document Parsing Types
export interface ParsedOrderItem {
  file_id: string;
  order_name: string;
  event_date: string;
  pickup_time: string;
  dropoff_time: string;
  venue_name: string;
  venue_address: string;
  item_name: string;
  quantity: number;
  rack_count?: number;
  // Cross-reference results (added after parsing)
  venue_match?: any | null; // VenueDifficulty type
  product_match?: any | null; // Inventory type
  needs_venue_input: boolean;
  needs_product_input: boolean;
  // UI state
  id?: string; // Generated for React keys
}

export interface ParsedOrderResponse {
  success: boolean;
  items: ParsedOrderItem[];
  errors?: string[];
}
