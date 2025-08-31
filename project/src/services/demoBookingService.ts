import { supabase } from '../lib/supabase';

export interface DemoBooking {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  product_interest?: string;
  preferred_date?: string; // ISO string
  message?: string;
  status?: string;
  assigned_to?: string;
  demo_date?: string; // ISO string
}

export async function createDemoBooking(booking: DemoBooking) {
  const { data, error } = await supabase
    .from('demo_bookings')
    .insert([booking])
    .select();
  if (error) throw error;
  return data?.[0];
}
