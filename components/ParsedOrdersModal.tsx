'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle2, Edit2, Upload, Send, Zap, CheckCircle } from 'lucide-react';
import { ParsedOrder, ParsedOrderItem } from '../types';

type LoadingStage = 'idle' | 'uploading' | 'sending' | 'processing' | 'complete';

interface ParsedOrdersModalProps {
  items: ParsedOrder[] | ParsedOrderItem[];
  loadingStage?: LoadingStage;
  onClose: () => void;
  onSave: (items: ParsedOrder[] | ParsedOrderItem[]) => void;
}

export const ParsedOrdersModal: React.FC<ParsedOrdersModalProps> = ({ items, loadingStage = 'idle', onClose, onSave }) => {
  const [processedItems, setProcessedItems] = useState<ParsedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  useEffect(() => {
    // If items array is empty and we're not in a loading stage, we're still loading
    if (items.length === 0 && loadingStage !== 'complete') {
      setLoading(true);
      setProcessedItems([]);
      return;
    }

    // If we have items, process them
    if (items.length > 0) {
      // Check if it's the new format (ParsedOrder) or old format (ParsedOrderItem)
      const isNewFormat = items[0] && 'order_id' in items[0];
      
      if (isNewFormat) {
        // New format: ParsedOrder[]
        const ordersWithIds = (items as ParsedOrder[]).map((item, index) => ({
          ...item,
          id: item.id || `order-${index}`,
        }));
        setProcessedItems(ordersWithIds);
      } else {
        // Old format: ParsedOrderItem[] - convert to new format for display
        // Group by order and convert to new format
        const orderMap = new Map<string, ParsedOrder>();
        
        (items as ParsedOrderItem[]).forEach((item) => {
          const orderKey = item.order_name || item.file_id;
          if (!orderMap.has(orderKey)) {
            orderMap.set(orderKey, {
              order_id: item.order_name || item.file_id,
              client_name: item.order_name || 'Unknown Client',
              pickup_datetime: item.pickup_time || '',
              dropoff_datetime: item.dropoff_time || '',
              venue_name: item.venue_name || '',
              venue_address: item.venue_address || '',
              items: [],
              item_quantities: {},
              id: `order-${orderMap.size}`,
            });
          }
          const order = orderMap.get(orderKey)!;
          if (item.item_name) {
            order.items.push(item.item_name);
            order.item_quantities[item.item_name] = item.quantity || 0;
          }
        });
        
        setProcessedItems(Array.from(orderMap.values()));
      }
      
      setLoading(false);
    }
  }, [items, loadingStage]);

  // Update polling attempts counter when in processing stage
  useEffect(() => {
    if (loadingStage === 'processing') {
      const interval = setInterval(() => {
        setPollingAttempts(prev => prev + 1);
      }, 5000); // Update every 5 seconds (polling interval)
      return () => clearInterval(interval);
    } else {
      setPollingAttempts(0);
    }
  }, [loadingStage]);

  // Get progress percentage based on stage
  const getProgress = (): number => {
    switch (loadingStage) {
      case 'uploading': return 20;
      case 'sending': return 40;
      case 'processing': return Math.min(40 + (pollingAttempts * 2), 95); // Gradually increase up to 95%
      case 'complete': return 100;
      default: return 0;
    }
  };

  // Get stage message
  const getStageMessage = (): string => {
    switch (loadingStage) {
      case 'uploading': return 'Preparing files for upload...';
      case 'sending': return 'Sending files to Zapier...';
      case 'processing': return `Processing with AI... (${pollingAttempts * 5}s)`;
      case 'complete': return 'Processing complete!';
      default: return 'Loading...';
    }
  };

  // Get stage icon
  const getStageIcon = () => {
    switch (loadingStage) {
      case 'uploading': return <Upload className="w-5 h-5" />;
      case 'sending': return <Send className="w-5 h-5" />;
      case 'processing': return <Zap className="w-5 h-5 animate-pulse" />;
      case 'complete': return <CheckCircle className="w-5 h-5" />;
      default: return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Validate all orders have required data
      const invalidOrders = processedItems.filter(
        order => !order.venue_name || !order.client_name || order.items.length === 0
      );

      if (invalidOrders.length > 0) {
        alert(`Please fill in missing data for ${invalidOrders.length} order(s) before saving.`);
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

  const updateOrder = (orderId: string, field: keyof ParsedOrder, value: any) => {
    setProcessedItems(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, [field]: value }
          : order
      )
    );
  };

  const updateItemQuantity = (orderId: string, itemName: string, quantity: number) => {
    setProcessedItems(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const newQuantities = { ...order.item_quantities };
          newQuantities[itemName] = quantity;
          return { ...order, item_quantities: newQuantities };
        }
        return order;
      })
    );
  };

  // Show loading state with progress bar
  if (loading || loadingStage !== 'complete') {
    const progress = getProgress();
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
          <div className="flex flex-col items-center gap-6">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              loadingStage === 'complete' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-accent/10 text-accent'
            }`}>
              {getStageIcon()}
            </div>

            {/* Title */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary mb-1">
                Processing Your Files
              </h3>
              <p className="text-sm text-subtle">
                {getStageMessage()}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full">
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    loadingStage === 'complete'
                      ? 'bg-green-500'
                      : 'bg-accent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-4 text-xs text-subtle">
                  <span className={`flex items-center gap-1 ${loadingStage === 'uploading' || loadingStage === 'sending' || loadingStage === 'processing' || loadingStage === 'complete' ? 'text-accent font-medium' : ''}`}>
                    {loadingStage !== 'idle' && loadingStage !== 'uploading' && <CheckCircle className="w-3 h-3" />}
                    Upload
                  </span>
                  <span className={`flex items-center gap-1 ${loadingStage === 'sending' || loadingStage === 'processing' || loadingStage === 'complete' ? 'text-accent font-medium' : ''}`}>
                    {loadingStage !== 'idle' && loadingStage !== 'uploading' && loadingStage !== 'sending' && <CheckCircle className="w-3 h-3" />}
                    Send
                  </span>
                  <span className={`flex items-center gap-1 ${loadingStage === 'processing' || loadingStage === 'complete' ? 'text-accent font-medium' : ''}`}>
                    {loadingStage === 'complete' && <CheckCircle className="w-3 h-3" />}
                    Process
                  </span>
                </div>
                <span className="text-xs text-subtle font-medium">{progress}%</span>
              </div>
            </div>

            {/* Status message for processing */}
            {loadingStage === 'processing' && (
              <div className="text-center">
                <p className="text-xs text-subtle">
                  AI is extracting order information from your documents...
                </p>
                <p className="text-xs text-subtle mt-1">
                  This usually takes 10-30 seconds
                </p>
              </div>
            )}
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

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {processedItems.map((order) => (
              <div
                key={order.id}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
              >
                {/* Order Header */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Order ID</label>
                    <input
                      type="text"
                      value={order.order_id}
                      onChange={(e) => updateOrder(order.id!, 'order_id', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Client Name</label>
                    <input
                      type="text"
                      value={order.client_name}
                      onChange={(e) => updateOrder(order.id!, 'client_name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Pickup Date/Time</label>
                    <input
                      type="text"
                      value={order.pickup_datetime}
                      onChange={(e) => updateOrder(order.id!, 'pickup_datetime', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      placeholder="YYYY-MM-DD HH:MM"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Dropoff Date/Time</label>
                    <input
                      type="text"
                      value={order.dropoff_datetime}
                      onChange={(e) => updateOrder(order.id!, 'dropoff_datetime', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                      placeholder="YYYY-MM-DD HH:MM"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Venue Name</label>
                    <input
                      type="text"
                      value={order.venue_name}
                      onChange={(e) => updateOrder(order.id!, 'venue_name', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-subtle uppercase tracking-wider">Venue Address</label>
                    <input
                      type="text"
                      value={order.venue_address}
                      onChange={(e) => updateOrder(order.id!, 'venue_address', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    />
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <label className="text-xs font-medium text-subtle uppercase tracking-wider mb-2 block">Items</label>
                  <div className="space-y-2">
                    {order.items.map((itemName, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-primary">{itemName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-subtle">Quantity:</label>
                          <input
                            type="number"
                            value={order.item_quantities[itemName] || 0}
                            onChange={(e) => updateItemQuantity(order.id!, itemName, parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                            min="0"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200">
          <div className="text-sm text-subtle">
            {processedItems.length} order(s) ready to save
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

