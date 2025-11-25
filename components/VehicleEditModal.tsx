'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Vehicle, VehicleInsert, VehicleUpdate } from '../types/database.types';
import { supabase } from '../lib/supabase';

interface VehicleEditModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
  isNew?: boolean;
}

export const VehicleEditModal: React.FC<VehicleEditModalProps> = ({ vehicle, onClose, onSave, isNew = false }) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);
    } else if (isNew) {
      setFormData({});
    }
  }, [vehicle, isNew]);

  const handleChange = (field: keyof Vehicle, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isNew) {
        const { error: insertError } = await supabase
          .from('vehicles')
          .insert(formData as VehicleInsert);

        if (insertError) throw insertError;
      } else {
        if (!vehicle?.id) {
          throw new Error('Vehicle ID is required for update');
        }

        const { error: updateError } = await supabase
          .from('vehicles')
          .update(formData as VehicleUpdate)
          .eq('id', vehicle.id);

        if (updateError) throw updateError;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-primary">
            {isNew ? 'Create New Vehicle' : 'Edit Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} className="text-subtle" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Type
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
                disabled={loading}
              >
                <option value="">Select type</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Capacity (cu ft)
              </label>
              <input
                type="number"
                value={formData.capacity_cu_ft || ''}
                onChange={(e) => handleChange('capacity_cu_ft', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-subtle hover:text-primary transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {isNew ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isNew ? 'Create Vehicle' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

