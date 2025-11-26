'use client';
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, Server, Globe, Send, Sparkles, Bot, User, X, File, Route, FileText, Loader2 } from 'lucide-react';
import { Message, UploadedFile, ParsedOrder, ParsedOrderItem } from '../types';
import { ParsedOrdersModal } from './ParsedOrdersModal';

interface IngestViewProps {
  input: string;
  setInput: (value: string) => void;
  onCommand: (e: React.FormEvent) => void;
  isAiThinking: boolean;
  messages: Message[];
}

type LoadingStage = 'idle' | 'uploading' | 'sending' | 'processing' | 'complete';

export const IngestView: React.FC<IngestViewProps> = ({ input, setInput, onCommand, isAiThinking, messages }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [parsing, setParsing] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [parsedItems, setParsedItems] = useState<ParsedOrder[] | ParsedOrderItem[]>([]);
  const [showParsedModal, setShowParsedModal] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Allowed file types
  const allowedTypes = ['application/pdf', 'image/png', 'text/csv', 'application/json', 'application/vnd.ms-excel'];
  const allowedExtensions = ['.pdf', '.png', '.csv', '.json'];

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isValidFileType = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(file.type) || allowedExtensions.includes(extension);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files)
      .filter(file => isValidFileType(file))
      .map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'ready' as const
      }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const handlePlanRoutes = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file before planning routes.');
      return;
    }

    console.log('🚀 Sending files to webhook...');
    console.log(`Files to send: ${uploadedFiles.length}`, uploadedFiles.map(f => f.name));
    setParsing(true);
    setLoadingStage('uploading');

    try {
      // Create FormData with all files
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file.file);
      });

      // Show modal immediately with loading state
      setParsedItems([]); // Empty items = loading state
      setShowParsedModal(true);
      setLoadingStage('sending');

      // Send files to our API route which will forward to webhook
      console.log('📤 Sending files to API route...');
      const response = await fetch('/api/send-to-webhook', {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(error.error || 'Failed to send files to webhook');
      }

      const data = await response.json();
      console.log('Webhook response:', data);

      if (!data.success) {
        const errorMsg = data.errors && data.errors.length > 0
          ? `Failed to send some files: ${data.errors.map((e: any) => e.filename).join(', ')}`
          : data.error || 'Failed to send files to webhook';
        throw new Error(errorMsg);
      }

      // Files sent successfully, now waiting for Zapier to process
      setLoadingStage('processing');
      
      // Start polling for parsed results
      pollForParsedResults();
      
      // Clear uploaded files after successful send
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error sending files to webhook:', error);
      setLoadingStage('idle');
      setShowParsedModal(false);
      alert(`Failed to send files to webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setParsing(false);
    }
  };

  // Poll for parsed results from API (where Zapier sends them)
  const pollForParsedResults = async () => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        console.log(`[Poll ${attempts + 1}/${maxAttempts}] Checking for session_id: ${sessionId}`);
        
        // Poll API endpoint for parsed orders with this session_id
        const response = await fetch(`/api/receive-parsed-orders?session_id=${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Not found yet, keep polling
            const errorData = await response.json().catch(() => ({}));
            console.log(`[Poll ${attempts + 1}] Not found yet. Available sessions:`, errorData.available_sessions);
            
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000);
            } else {
              console.warn('❌ Polling timeout: No parsed results received after', maxAttempts * 5, 'seconds');
              console.warn('Session ID was:', sessionId);
              setParsing(false);
              setLoadingStage('idle');
              setShowParsedModal(false);
              alert('Parsing is taking longer than expected. Please check the browser console for details or try again.');
            }
            return;
          }
          // Other error
          const errorData = await response.json().catch(() => ({}));
          console.error(`[Poll ${attempts + 1}] Error polling API:`, response.status, errorData);
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setParsing(false);
            setLoadingStage('idle');
            setShowParsedModal(false);
            alert('Error receiving parsed data. Please check the browser console.');
          }
          return;
        }

        const result = await response.json();
        console.log(`[Poll ${attempts + 1}] Response:`, result);
        
        if (result.success && result.items) {
          // Items can be in new format (ParsedOrder[]) or old format (ParsedOrderItem[])
          const items: ParsedOrder[] | ParsedOrderItem[] = result.items;

          if (items.length > 0) {
            console.log('✅ Received parsed orders from API:', items);
            setParsedItems(items);
            setShowParsedModal(true);
            setLoadingStage('complete');
            setParsing(false);
            
            return; // Stop polling
          } else {
            console.warn(`[Poll ${attempts + 1}] Items array is empty. Response:`, result);
            // Keep polling if items array is empty but success is true (might be processing)
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000);
            } else {
              console.warn('❌ Polling timeout: Items array remained empty');
              setParsing(false);
              setLoadingStage('idle');
              setShowParsedModal(false);
              alert('Received response but no items found. Please check Zapier output format.');
            }
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          // Poll again in 5 seconds
          setTimeout(poll, 5000);
        } else {
          console.warn('Polling timeout: No parsed results received');
          setParsing(false);
          setLoadingStage('idle');
          setShowParsedModal(false);
          alert('Parsing is taking longer than expected. Please check back later or try again.');
        }
      } catch (error) {
        console.error('Error polling for results:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000);
        } else {
          setParsing(false);
          setLoadingStage('idle');
          setShowParsedModal(false);
        }
      }
    };

    // Start polling after 5 seconds
    setTimeout(poll, 5000);
  };

  const handleSaveParsedOrders = async (items: ParsedOrder[] | ParsedOrderItem[]) => {
    console.log('Saving confirmed parsed orders:', items);
    // TODO: Save to database/orders table if needed
    // For now, just close modal and clear the stored data
    setShowParsedModal(false);
    setParsedItems([]);
    
    // Clear the stored data from the API
    try {
      await fetch(`/api/receive-parsed-orders?session_id=${sessionId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing parsed orders:', error);
    }
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.includes('pdf') || name.endsWith('.pdf')) return FileText;
    if (type.includes('image') || name.endsWith('.png')) return File;
    if (type.includes('csv') || type.includes('excel') || name.endsWith('.csv')) return FileSpreadsheet;
    if (type.includes('json') || name.endsWith('.json')) return File;
    return File;
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-6 animate-scale-in">
      
      {/* Left: Interactive Drop Zone */}
      <div 
        className={`
            flex-1 relative rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2
            ${isDragging 
                ? 'border-accent bg-accent/5 scale-[0.99] shadow-inner' 
                : 'border-white/40 bg-white/40 backdrop-blur-xl shadow-sm hover:border-white/60 hover:shadow-md'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Animated Background Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
             <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
        </div>

        {/* Scanning Line Effect */}
        {!isDragging && uploadedFiles.length === 0 && (
            <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-[slideUp_4s_ease-in-out_infinite]" />
        )}

        {/* Drop Zone Content - Only show when no files */}
        {uploadedFiles.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                <div className={`
                    w-32 h-32 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500
                    ${isDragging ? 'bg-accent text-white scale-110 rotate-3' : 'bg-white text-accent shadow-xl'}
                `}>
                    <UploadCloud size={48} strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-light text-primary mb-3">
                    {isDragging ? 'Drop Files Here' : 'Drop Orders Here'}
                </h2>
                <p className="text-subtle max-w-sm mx-auto mb-10 leading-relaxed">
                    Support for .PDF, .PNG, .CSV, and .JSON. <br/> 
                    Drag multiple files or select from your device.
                </p>

                {/* Manual Action Chips */}
                <div className="flex gap-3 flex-wrap justify-center">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white rounded-xl border border-white/20 shadow-sm hover:shadow text-sm font-medium text-primary transition-all active:scale-95"
                    >
                        <FileSpreadsheet size={16} className="text-subtle" />
                        Select Files
                    </button>
                    {[
                        { label: 'Connect API', icon: Server },
                        { label: 'Cloud Drive', icon: Globe },
                    ].map((action, i) => (
                        <button key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white/60 hover:bg-white rounded-xl border border-white/20 shadow-sm hover:shadow text-sm font-medium text-primary transition-all active:scale-95">
                            <action.icon size={16} className="text-subtle" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* File List - Show when files are uploaded */}
        {uploadedFiles.length > 0 && (
            <div className="absolute inset-0 flex flex-col p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-primary">
                        Uploaded Files ({uploadedFiles.length})
                    </h3>
                    <button 
                        onClick={() => setUploadedFiles([])}
                        className="text-xs font-bold text-subtle hover:text-primary hover:bg-white/40 px-3 py-1 rounded-full transition-colors"
                    >
                        CLEAR ALL
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
                    {uploadedFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type, file.name);
                        return (
                            <div key={file.id} className="group p-3 bg-white/50 hover:bg-white rounded-2xl border border-transparent hover:border-white/50 transition-all flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-green-100 text-green-600">
                                    <FileIcon size={18} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-primary truncate">{file.name}</h4>
                                    <p className="text-xs text-subtle flex items-center gap-1.5">
                                        {formatFileSize(file.size)} • <span className="opacity-70">Ready</span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                                    title="Remove file"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Plan Routes Button */}
                <div className="mt-4 pt-4 border-t border-white/20">
                    <button
                        onClick={handlePlanRoutes}
                        disabled={parsing}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-accent hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {parsing ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Sending to webhook...
                            </>
                        ) : (
                            <>
                                <Route size={18} />
                                Plan my routes
                            </>
                        )}
                    </button>
                </div>
            </div>
        )}

        {/* Hidden file input */}
        <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.csv,.json"
            onChange={handleFileInput}
            className="hidden"
        />
      </div>

      {/* Right: Info & AI Column */}
      <div className="w-full md:w-96 flex flex-col gap-6 h-full">
        
        {/* Top: Recent Activity */}
        <div className="flex-1 glass-panel bg-white/60 rounded-[2.5rem] p-6 flex flex-col min-h-0 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 z-10">
                <h3 className="text-lg font-medium text-primary pl-2">Recent Activity</h3>
                <button className="text-xs font-bold text-accent hover:bg-accent/10 px-3 py-1 rounded-full transition-colors">VIEW ALL</button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar z-10">
                <div className="text-center text-subtle text-sm mt-8 opacity-60">
                    Recent uploads and activity will appear here.
                </div>
            </div>
        </div>

        {/* Bottom: Ask AI */}
        <div className="h-[45%] glass-panel bg-white/80 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-6 shadow-lg flex flex-col relative overflow-hidden ring-1 ring-white/50">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] pointer-events-none" />
             
             <div className="flex items-center gap-2 mb-4 z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <Sparkles size={14} />
                </div>
                <h3 className="text-lg font-medium text-primary">Routing Assistant</h3>
             </div>

             <div ref={scrollRef} className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 no-scrollbar z-10">
                 {messages.length === 0 && (
                     <div className="text-center text-subtle text-sm mt-8 opacity-60">
                         Ask to route specific orders or check schedule conflicts...
                     </div>
                 )}
                 {messages.map((msg) => (
                     <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`
                             w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1
                             ${msg.role === 'assistant' ? 'bg-accent/10 text-accent' : 'bg-slate-200 text-slate-500'}
                         `}>
                             {msg.role === 'assistant' ? <Bot size={12}/> : <User size={12}/>}
                         </div>
                         <div className={`
                             p-3 rounded-2xl text-xs sm:text-sm max-w-[80%] leading-relaxed shadow-sm
                             ${msg.role === 'user' 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-white border border-slate-100 text-primary rounded-tl-none'}
                         `}>
                             {msg.content}
                         </div>
                     </div>
                 ))}
                 {isAiThinking && (
                     <div className="flex gap-3">
                         <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                             <Bot size={12} />
                         </div>
                         <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                             <div className="flex gap-1">
                                 <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                                 <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                                 <div className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                             </div>
                         </div>
                     </div>
                 )}
             </div>

             <form onSubmit={onCommand} className="relative z-10">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI to route..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-inner"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isAiThinking}
                    className="absolute right-2 top-2 p-1.5 bg-accent text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                    <Send size={14} />
                </button>
             </form>
        </div>

      </div>

      {/* Parsed Orders Modal */}
      {showParsedModal && (
        <ParsedOrdersModal
          items={parsedItems}
          loadingStage={loadingStage}
          onClose={() => {
            setShowParsedModal(false);
            setParsedItems([]);
            setLoadingStage('idle');
          }}
          onSave={handleSaveParsedOrders}
        />
      )}

    </div>
  );
};
