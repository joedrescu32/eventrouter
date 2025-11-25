'use client';
import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Inventory, Vehicle, VenueDifficulty } from '../types/database.types';
import { VehicleEditModal } from './VehicleEditModal';

export const WarehouseView: React.FC = () => {
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [venueDifficulties, setVenueDifficulties] = useState<VenueDifficulty[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [venueLoading, setVenueLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venueError, setVenueError] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchVehicles();
    fetchVenueDifficulties();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are missing. Please check your .env.local file.');
      }

      console.log('Fetching inventory from Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('inventory')
        .select('*')
        .order('product_name', { ascending: true });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        // Provide more helpful error messages
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Table "inventory" not found. Please run the SQL schema in your Supabase dashboard.');
        } else if (supabaseError.code === '42501') {
          throw new Error('Permission denied. Please check your RLS policies in Supabase.');
        } else if (supabaseError.message?.includes('JWT')) {
          throw new Error('Invalid API key. Please check your anon key in .env.local');
        }
        throw new Error(supabaseError.message || 'Failed to load inventory');
      }

      console.log('✅ Inventory loaded:', data?.length || 0, 'items');
      if (data && data.length > 0) {
        console.log('Sample inventory row:', data[0]);
        console.log('Columns found:', Object.keys(data[0]));
      } else {
        console.log('⚠️ No inventory data returned from Supabase');
        console.log('   This could mean:');
        console.log('   1. The table is empty');
        console.log('   2. RLS policies are blocking access');
        console.log('   3. The table name is incorrect');
      }
      setInventoryItems(data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setVehiclesLoading(true);
      
      const { data, error: supabaseError } = await supabase
        .from('vehicles')
        .select('*')
        .order('name', { ascending: true });

      if (supabaseError) {
        console.error('Error fetching vehicles:', supabaseError);
        return;
      }

      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleVehicleSave = () => {
    fetchVehicles(); // Refresh the vehicles list
  };

  const fetchVenueDifficulties = async () => {
    try {
      setVenueLoading(true);
      setVenueError(null);
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials are missing. Please check your .env.local file.');
      }

      console.log('Fetching venue difficulty from Supabase...');
      
      const { data, error: supabaseError } = await supabase
        .from('venue_difficulty')
        .select('*')
        .order('id', { ascending: true });

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Table "venue_difficulty" not found. Please run the SQL schema in your Supabase dashboard.');
        } else if (supabaseError.code === '42501') {
          throw new Error('Permission denied. Please check your RLS policies in Supabase.');
        } else if (supabaseError.message?.includes('JWT')) {
          throw new Error('Invalid API key. Please check your anon key in .env.local');
        }
        throw new Error(supabaseError.message || 'Failed to load venue difficulty');
      }

      console.log('✅ Venue difficulty loaded:', data?.length || 0, 'items');
      if (data && data.length > 0) {
        console.log('Sample venue difficulty row:', data[0]);
        console.log('Columns found:', Object.keys(data[0]));
      } else {
        console.log('⚠️ No venue difficulty data returned from Supabase');
        console.log('   This could mean:');
        console.log('   1. The table is empty');
        console.log('   2. RLS policies are blocking access');
        console.log('   3. The table name is incorrect');
      }
      setVenueDifficulties(data || []);
    } catch (err) {
      console.error('Error fetching venue difficulty:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load venue difficulty';
      setVenueError(errorMessage);
    } finally {
      setVenueLoading(false);
    }
  };


  return (
    <div className="h-full w-full overflow-y-auto pb-20 no-scrollbar animate-fade-in">
      
      {/* Header Section */}
      <div className="flex items-end justify-between mb-10 px-2">
          <div>
            <h1 className="text-5xl font-light tracking-tighter text-primary mb-2">Warehouse</h1>
            <p className="text-lg text-subtle">{vehicles.length} Vehicles Active</p>
          </div>
      </div>

      {/* Fleet Section (Horizontal Scroll Snap) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-sm font-bold text-subtle uppercase tracking-widest">Fleet Status</h3>
          {!vehiclesLoading && (
            <button 
              onClick={() => setIsCreatingNew(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <ArrowRight size={16} />
              Create Vehicle
            </button>
          )}
        </div>
        {vehiclesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="ml-3 text-sm text-subtle">Loading vehicles...</span>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 px-2 snap-x">
              {vehicles.map((v) => (
                  <div 
                    key={v.id} 
                    onClick={() => handleVehicleClick(v)}
                    className="min-w-[300px] bg-white rounded-3xl p-2 shadow-sm border border-white/50 snap-center group hover:shadow-xl transition-all duration-500 cursor-pointer"
                  >
                      <div className="h-48 rounded-2xl overflow-hidden relative mb-4 bg-slate-100 flex items-center justify-center">
                          {v.image_url ? (
                            <img 
                              src={v.image_url} 
                              alt={v.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                // Fallback to icon if image fails to load
                                console.warn('Image failed to load:', v.image_url);
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('svg')) {
                                  const icon = document.createElement('div');
                                  icon.className = 'flex items-center justify-center';
                                  icon.innerHTML = '<svg class="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>';
                                  parent.appendChild(icon);
                                }
                              }}
                            />
                          ) : (
                            <Truck size={64} className="text-slate-300" />
                          )}
                      </div>
                      <div className="px-4 pb-4">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xl font-medium text-primary">{v.name}</h4>
                              <Truck size={20} className="text-subtle" />
                          </div>
                          <div className="space-y-2 mt-4">
                              <div className="flex justify-between text-xs text-subtle">
                                  <span>Type</span>
                                  <span className="font-medium text-primary">{v.type}</span>
                              </div>
                              <div className="flex justify-between text-xs text-subtle">
                                  <span>Capacity</span>
                                  <span className="font-medium text-primary">{v.capacity_cu_ft} cu ft</span>
                              </div>
                              {(v as any).license_plate && (
                                  <div className="flex justify-between text-xs text-subtle">
                                      <span>License</span>
                                      <span className="font-medium text-primary">{(v as any).license_plate}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
        )}
      </div>

      {/* Vehicle Edit Modal */}
      {(selectedVehicle || isCreatingNew) && (
        <VehicleEditModal
          vehicle={selectedVehicle}
          onClose={() => {
            setSelectedVehicle(null);
            setIsCreatingNew(false);
          }}
          onSave={handleVehicleSave}
          isNew={isCreatingNew}
        />
      )}

      {/* Inventory Table */}
      <div className="px-2 mb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-primary">Inventory List</h3>
              <p className="text-sm text-subtle mt-1">Complete warehouse inventory overview</p>
            </div>
            <button
              onClick={fetchInventory}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="ml-3 text-sm text-subtle">Loading inventory...</span>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button
                  onClick={fetchInventory}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            ) : inventoryItems.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-subtle mb-4">No inventory items found. Add items to get started.</p>
                <button
                  onClick={fetchInventory}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(inventoryItems[0] || {})
                      .filter(column => column !== 'id')
                      .map((column) => (
                      <th 
                        key={column}
                        className="px-6 py-4 text-left text-xs font-bold text-subtle uppercase tracking-wider"
                      >
                        {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryItems.map((item, index) => {
                    const visibleColumns = Object.entries(item).filter(([key]) => key !== 'id');
                    const firstColumnKey = visibleColumns[0]?.[0];
                    return (
                      <tr key={item.id || index} className="hover:bg-slate-50 transition-colors">
                        {visibleColumns.map(([key, value]) => (
                          <td key={key} className="px-6 py-4 whitespace-nowrap">
                            {key === firstColumnKey ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <Package size={18} className="text-subtle" />
                                </div>
                                <span className="text-sm font-medium text-primary">{String(value || '—')}</span>
                              </div>
                            ) : typeof value === 'boolean' ? (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              value 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          ) : value === null || value === undefined ? (
                            <span className="text-sm text-subtle">—</span>
                          ) : typeof value === 'object' ? (
                            <span className="text-sm text-subtle">{JSON.stringify(value)}</span>
                          ) : key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('created') || key.toLowerCase().includes('updated') ? (
                            <span className="text-sm text-subtle">
                              {new Date(String(value)).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-primary">{String(value)}</span>
                          )}
                        </td>
                      ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Venue Difficulty Table */}
      <div className="px-2 mb-12">
        <div className="bg-white rounded-3xl shadow-sm border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-primary">Venue Difficulty</h3>
              <p className="text-sm text-subtle mt-1">Complete venue difficulty overview</p>
            </div>
            <button
              onClick={fetchVenueDifficulties}
              disabled={venueLoading}
              className="px-4 py-2 text-sm font-medium text-accent hover:text-accent/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Loader2 size={16} className={venueLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            {venueLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="ml-3 text-sm text-subtle">Loading venue difficulty...</span>
              </div>
            ) : venueError ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500 mb-4">{venueError}</p>
                <button
                  onClick={fetchVenueDifficulties}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            ) : venueDifficulties.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-subtle mb-4">No venue difficulty data found.</p>
                <button
                  onClick={fetchVenueDifficulties}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Refresh
                </button>
                <p className="text-xs text-subtle mt-4">
                  If you just added data, make sure RLS policies allow SELECT access.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {Object.keys(venueDifficulties[0] || {}).map((column) => (
                      <th 
                        key={column}
                        className="px-6 py-4 text-left text-xs font-bold text-subtle uppercase tracking-wider"
                      >
                        {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {venueDifficulties.map((venue, index) => (
                    <tr key={venue.id || index} className="hover:bg-slate-50 transition-colors">
                      {Object.entries(venue).map(([key, value]) => (
                        <td key={key} className="px-6 py-4 whitespace-nowrap">
                          {key === 'id' ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                <MapPin size={18} className="text-subtle" />
                              </div>
                              <span className="text-sm font-medium text-primary">{String(value)}</span>
                            </div>
                          ) : typeof value === 'boolean' ? (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              value 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {value ? 'Yes' : 'No'}
                            </span>
                          ) : value === null || value === undefined ? (
                            <span className="text-sm text-subtle">—</span>
                          ) : typeof value === 'object' ? (
                            <span className="text-sm text-subtle">{JSON.stringify(value)}</span>
                          ) : key.toLowerCase().includes('date') || key.toLowerCase().includes('time') || key.toLowerCase().includes('created') || key.toLowerCase().includes('updated') ? (
                            <span className="text-sm text-subtle">
                              {new Date(String(value)).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-primary">{String(value)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
