'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { ParsedOrderItem } from '../types';

interface ParsedOrdersModalProps {
  items: ParsedOrderItem[];
  onClose: () => void;
  onSave: (items: ParsedOrderItem[]) => void;
}

export const ParsedOrdersModal: React.FC<ParsedOrdersModalProps> = ({ items, onClose, onSave }) => {
  const [processedItems, setProcessedItems] = useState<ParsedOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    // If items array is empty, we're still loading
    if (items.length === 0) {
      setLoading(true);
      setProcessedItems([]);
      return;
    }

    // Add IDs to items for React keys
    const itemsWithIds = items.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`,
      needs_venue_input: false,
      needs_product_input: false,
    }));

    setProcessedItems(itemsWithIds);
    setLoading(false);
  }, [items]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Validate all items have required data
      const invalidItems = processedItems.filter(
        item => !item.venue_match || !item.product_match
      );

      if (invalidItems.length > 0) {
        alert(`Please fill in missing venue or product data for ${invalidItems.length} item(s) before saving.`);
        setSaving(false);
        return;
      }

      // Save to database (you'll need to create an orders table)
      // For now, just call onSave callback
      onSave(processedItems);
      onClose();
    } catch (error) {
      console.error('Error saving orders:', error);
      alert('Failed to save orders. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (itemId: string, field: keyof ParsedOrderItem, value: any) => {
    setProcessedItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-sm text-subtle">Loading parsed orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-medium text-primary">
              Parsed Orders ({processedItems.length})
            </h2>
            <p className="text-sm text-subtle mt-1">
              Review and confirm extracted order data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X size={20} className="text-subtle" />
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Event Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Rack Count</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-subtle uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    item.needs_venue_input || item.needs_product_input
                      ? 'bg-yellow-50/50'
                      : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-primary">{item.order_name}</div>
                    <div className="text-xs text-subtle">{item.file_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-primary">{item.event_date}</div>
                    <div className="text-xs text-subtle">
                      {item.pickup_time} - {item.dropoff_time}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-primary">{item.venue_name}</div>
                        <div className="text-xs text-subtle">{item.venue_address}</div>
                      </div>
                      {item.venue_match ? (
                        <div title="Venue matched">
                          <CheckCircle2 size={16} className="text-green-500" />
                        </div>
                      ) : (
                        <div title="Venue needs input">
                          <AlertCircle size={16} className="text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-primary">{item.item_name}</div>
                      {item.product_match ? (
                        <div title="Product matched">
                          <CheckCircle2 size={16} className="text-green-500" />
                        </div>
                      ) : (
                        <div title="Product needs input">
                          <AlertCircle size={16} className="text-yellow-500" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id!, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.rack_count || ''}
                      onChange={(e) => updateItem(item.id!, 'rack_count', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="—"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {item.needs_venue_input || item.needs_product_input ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        Needs Input
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Ready
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div className="text-sm text-subtle">
            {processedItems.filter(item => item.needs_venue_input || item.needs_product_input).length} item(s) need attention
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-subtle hover:text-primary transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

