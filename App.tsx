import React, { useState, useEffect, useRef } from 'react';
import StarBackground from './components/StarBackground';
import MarkdownRenderer from './components/MarkdownRenderer';
import { 
  loginUser, registerUser, logoutUser, getActiveUser, 
  saveChat, getChats, deleteChat, clearAllData, 
  getSafetyZones, saveSafetyZone, deleteSafetyZone, getAlerts, addAlert 
} from './services/storageService';
import { sendMessageToGemini, scanLocationSafety } from './services/geminiService';
import { AppState, ChatSession, Message, SafetyZone, Alert } from './types';

// Icons
const SendIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const DownloadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const WipeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ShieldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const ScanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ChatIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const PROMPTS = [
  { label: "🗺️ I am lost", text: "I am lost in an unfamiliar area" },
  { label: "🚪 Exit strategy", text: "I need a hidden exit strategy from my building" },
  { label: "📸 Preserve evidence", text: "How do I document cyberstalking evidence safely?" },
  { label: "✈️ Travel safety", text: "Create a travel safety checklist for a solo trip" },
];

const INITIAL_MSG: Message = {
  role: 'model',
  text: "**System Online.**\n\nI am your Digital Escape Planner. I can help with route safety, cyberstalking defense, and emergency protocols.\n\n_Note: I am an AI. In immediate life-threatening danger, always call emergency services._",
  timestamp: Date.now()
};

const ThreatBadge = ({ level }: { level: string }) => {
  const colors = {
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[level as keyof typeof colors] || colors.LOW}`}>
      {level}
    </span>
  );
};

function App() {
  // State
  const [state, setState] = useState<AppState>({
    view: 'login',
    currentUser: null,
    currentChatId: null,
    chats: {},
    sidebarOpen: false,
    safetyZones: [],
    alerts: []
  });
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Safety Monitor State
  const [scanning, setScanning] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneThreshold, setNewZoneThreshold] = useState<'LOW'|'MEDIUM'|'HIGH'>('MEDIUM');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const alertsEndRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const activeUser = getActiveUser();
    if (activeUser) {
      const chats = getChats();
      const zones = getSafetyZones();
      const alerts = getAlerts();
      // Find latest chat or create new
      let chatId = Object.keys(chats).sort((a,b) => chats[b].createdAt - chats[a].createdAt)[0];
      
      setState(prev => ({
        ...prev,
        currentUser: activeUser,
        view: 'chat',
        chats,
        currentChatId: chatId || null,
        safetyZones: zones,
        alerts: alerts
      }));

      if (!chatId) {
        createNewChat(chats);
      }
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (state.view === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.chats, state.currentChatId, isTyping, state.view]);

  // Actions
  const handleAuth = (
    type: 'login' | 'signup', 
    user: string, 
    pass: string, 
    email?: string, 
    phone?: string, 
    emergencyContact?: string
  ) => {
    setAuthError('');
    if (type === 'login') {
      const found = loginUser(user, pass);
      if (found) {
        const chats = getChats();
        const zones = getSafetyZones();
        const alerts = getAlerts();
        setState(prev => ({ ...prev, currentUser: found, view: 'chat', chats, safetyZones: zones, alerts }));
        if (Object.keys(chats).length === 0) createNewChat(chats);
      } else {
        setAuthError('Invalid username or password');
      }
    } else {
      const success = registerUser(user, pass, email, phone, emergencyContact);
      if (success) {
        setState(prev => ({ ...prev, view: 'login' })); // Redirect to login after signup
        setAuthError('Account created! Please login.');
      } else {
        setAuthError('Username already exists');
      }
    }
  };

  const createNewChat = (currentChats = state.chats) => {
    const newId = Date.now().toString();
    const newChat: ChatSession = {
      id: newId,
      title: 'New Safety Plan',
      messages: [INITIAL_MSG],
      createdAt: Date.now()
    };
    saveChat(newChat);
    setState(prev => ({
      ...prev,
      chats: { ...currentChats, [newId]: newChat },
      currentChatId: newId,
      view: 'chat',
      sidebarOpen: false 
    }));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !state.currentChatId) return;
    
    const chatId = state.currentChatId;
    const userMsg: Message = { role: 'user', text, timestamp: Date.now() };
    
    // Optimistic Update
    const updatedChats = { ...state.chats };
    updatedChats[chatId].messages = [...updatedChats[chatId].messages, userMsg];
    
    // Update title if it's the first user message
    if (updatedChats[chatId].messages.filter(m => m.role === 'user').length === 1) {
      updatedChats[chatId].title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    setState(prev => ({ ...prev, chats: updatedChats }));
    saveChat(updatedChats[chatId]);
    setInput('');
    setIsTyping(true);

    // AI Call
    const history = updatedChats[chatId].messages;
    const responseText = await sendMessageToGemini(text, history);

    const botMsg: Message = { role: 'model', text: responseText, timestamp: Date.now() };
    
    setState(prev => {
        const finalChats = { ...prev.chats };
        finalChats[chatId].messages = [...finalChats[chatId].messages, botMsg];
        saveChat(finalChats[chatId]);
        return { ...prev, chats: finalChats };
    });
    setIsTyping(false);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Delete this plan?')) {
      deleteChat(chatId);
      const remainingChats = { ...state.chats };
      delete remainingChats[chatId];
      
      let nextId = state.currentChatId;
      if (chatId === state.currentChatId) {
        nextId = Object.keys(remainingChats)[0] || null;
      }
      
      setState(prev => ({
        ...prev,
        chats: remainingChats,
        currentChatId: nextId
      }));

      if (!nextId) createNewChat(remainingChats);
    }
  };

  const handleExportPDF = () => {
    if (!state.currentChatId || !state.currentUser) return;
    const chat = state.chats[state.currentChatId];
    
    // Password construction logic
    const username = state.currentUser.username || "";
    const password = state.currentUser.password || "";
    
    if (!password) {
        alert("For security, please logout and login again to enable PDF encryption.");
        return;
    }

    const firstFour = username.substring(0, 4);
    const lastFour = password.length >= 4 ? password.slice(-4) : password;
    const pdfPassword = `${firstFour}${lastFour}`;

    if (window.jspdf) {
      const { jsPDF } = window.jspdf;
      
      // Initialize with encryption
      const doc = new jsPDF({
          encryption: {
              userPassword: pdfPassword,
              ownerPassword: pdfPassword,
              userPermissions: ["print", "modify", "copy", "annot-forms"]
          }
      });
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Digital Escape Planner - Confidential", 20, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      let y = 40;
      
      chat.messages.forEach(msg => {
         if (y > 270) {
            doc.addPage();
            y = 20;
         }
         const role = msg.role === 'user' ? "YOU" : "DEP AI";
         const date = new Date(msg.timestamp).toLocaleTimeString();
         
         doc.setFont("helvetica", "bold");
         doc.text(`${role} [${date}]`, 20, y);
         y += 7;
         
         doc.setFont("helvetica", "normal");
         const lines = doc.splitTextToSize(msg.text.replace(/\*\*/g, ''), 170);
         doc.text(lines, 20, y);
         y += (lines.length * 5) + 10;
      });
      
      alert(`Your PDF is encrypted.\nPassword: ${firstFour}${lastFour}\n(First 4 letters of Username + Last 4 letters of Password)`);
      doc.save(`SafetyPlan_${Date.now()}.pdf`);
    } else {
      alert("PDF library not loaded.");
    }
  };

  const handleWipeData = () => {
      if(confirm("This will delete all local chat history and logout. This cannot be undone.")) {
          clearAllData();
          window.location.reload();
      }
  };

  // --- Safety Monitor Logic ---
  
  const handleAddZone = () => {
    if(!newZoneName.trim()) return;
    const newZone: SafetyZone = {
      id: Date.now().toString(),
      name: newZoneName,
      threshold: newZoneThreshold,
      lastChecked: Date.now()
    };
    saveSafetyZone(newZone);
    setState(prev => ({...prev, safetyZones: [...prev.safetyZones, newZone]}));
    setNewZoneName('');
  };

  const handleDeleteZone = (id: string) => {
    deleteSafetyZone(id);
    setState(prev => ({...prev, safetyZones: prev.safetyZones.filter(z => z.id !== id)}));
  };

  const handleScanZones = async () => {
    setScanning(true);
    const zones = state.safetyZones;
    const newAlerts: Alert[] = [];
    const threatMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };

    for(const zone of zones) {
      const result = await scanLocationSafety(zone.name);
      
      // Update last checked
      zone.lastChecked = Date.now();
      saveSafetyZone(zone);

      // Check threshold
      if (threatMap[result.level] >= threatMap[zone.threshold]) {
        const alert: Alert = {
          id: Date.now().toString() + Math.random(),
          zoneId: zone.id,
          zoneName: zone.name,
          level: result.level,
          message: result.message,
          timestamp: Date.now()
        };
        addAlert(alert);
        newAlerts.push(alert);
      }
    }

    // Refresh state
    const allAlerts = getAlerts();
    setState(prev => ({...prev, alerts: allAlerts, safetyZones: [...getSafetyZones()]}));
    setScanning(false);
  };

  // Views
  if (state.view === 'login' || state.view === 'signup') {
    return (
      <StarBackground>
        <div className="w-full h-full overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(0,188,212,0.25)] animate-fade-in my-auto">
              <h1 className="text-3xl font-display font-bold text-brand-teal text-center mb-2">
                {state.view === 'login' ? 'Digital Escape Planner' : 'Create Account'}
              </h1>
              <p className="text-brand-accent/80 text-center text-sm mb-8">
                {state.view === 'login' ? 'Your AI-powered guide to safety and peace' : 'Begin your journey to safety'}
              </p>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleAuth(
                    state.view as 'login'|'signup', 
                    fd.get('username') as string, 
                    fd.get('password') as string,
                    fd.get('email') as string,
                    fd.get('phone') as string,
                    fd.get('emergencyContact') as string
                  );
                }} 
                className="space-y-4"
              >
                <input 
                  name="username" 
                  type="text" 
                  placeholder="Username" 
                  required
                  className="w-full bg-white/10 border border-transparent focus:border-brand-teal focus:bg-white/20 rounded-xl px-4 py-3 outline-none transition-all placeholder-white/50 text-center"
                />
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Password" 
                  required
                  className="w-full bg-white/10 border border-transparent focus:border-brand-teal focus:bg-white/20 rounded-xl px-4 py-3 outline-none transition-all placeholder-white/50 text-center"
                />

                {state.view === 'signup' && (
                  <>
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="Email Address" 
                      required
                      className="w-full bg-white/10 border border-transparent focus:border-brand-teal focus:bg-white/20 rounded-xl px-4 py-3 outline-none transition-all placeholder-white/50 text-center"
                    />
                    <input 
                      name="phone" 
                      type="tel" 
                      placeholder="Phone Number" 
                      required
                      className="w-full bg-white/10 border border-transparent focus:border-brand-teal focus:bg-white/20 rounded-xl px-4 py-3 outline-none transition-all placeholder-white/50 text-center"
                    />
                    <input 
                      name="emergencyContact" 
                      type="tel" 
                      placeholder="Emergency Alternate Number" 
                      required
                      className="w-full bg-white/10 border border-transparent focus:border-brand-teal focus:bg-white/20 rounded-xl px-4 py-3 outline-none transition-all placeholder-white/50 text-center"
                    />
                  </>
                )}
                
                {authError && <div className="text-red-400 text-xs text-center">{authError}</div>}

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-brand-teal to-blue-600 hover:from-brand-teal/80 hover:to-blue-600/80 py-3 rounded-xl font-bold shadow-lg shadow-brand-teal/20 transition-transform active:scale-95"
                >
                  {state.view === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <button 
                  onClick={() => {
                      setAuthError('');
                      setState(prev => ({ ...prev, view: state.view === 'login' ? 'signup' : 'login' }));
                  }}
                  className="text-brand-teal hover:underline"
                >
                  {state.view === 'login' ? 'New here? Create Account' : 'Already have an account? Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </StarBackground>
    );
  }

  // Dashboard Wrapper
  return (
    <StarBackground>
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                absolute md:relative z-30 w-64 h-full bg-[#050505]/95 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300
                ${state.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <span className="font-bold text-brand-teal tracking-wider">DEP</span>
                    <button onClick={() => setState(p => ({...p, sidebarOpen: false}))} className="md:hidden text-white/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="p-4 space-y-2">
                    <button 
                        onClick={() => createNewChat()}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${state.view === 'chat' && !state.currentChatId ? 'bg-brand-teal text-brand-darker font-bold' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <PlusIcon /> New Plan
                    </button>
                    <button 
                         onClick={() => setState(p => ({...p, view: 'safety', sidebarOpen: false}))}
                         className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${state.view === 'safety' ? 'bg-brand-teal text-brand-darker font-bold' : 'text-white/60 hover:bg-white/5'}`}
                    >
                        <ShieldIcon /> Safety Monitor
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1">
                    <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Recent Plans</div>
                    {(Object.values(state.chats) as ChatSession[])
                        .sort((a,b) => b.createdAt - a.createdAt)
                        .map(chat => (
                        <div 
                            key={chat.id}
                            onClick={() => {
                                setState(prev => ({ ...prev, currentChatId: chat.id, view: 'chat', sidebarOpen: false }));
                            }}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                                state.view === 'chat' && state.currentChatId === chat.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="truncate flex-1 pr-2">{chat.title}</span>
                            <button 
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 space-y-2">
                     <button onClick={handleWipeData} className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">
                        <WipeIcon /> Wipe Data
                    </button>
                    <button onClick={() => { logoutUser(); setState(prev => ({...prev, view: 'login'})); }} className="w-full flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-colors">
                        <LogoutIcon /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col relative w-full h-full bg-[#0b0b0b]/80">
                {state.view === 'chat' ? (
                  <>
                    {/* CHAT VIEW */}
                    <header className="h-16 border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setState(p => ({...p, sidebarOpen: true}))} className="md:hidden text-white/70">
                                <MenuIcon />
                            </button>
                            <h2 className="font-display font-semibold text-white/90">
                              {state.currentChatId && state.chats[state.currentChatId]?.title}
                            </h2>
                        </div>
                        <button onClick={handleExportPDF} title="Export PDF" className="p-2 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors">
                            <DownloadIcon />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        {state.currentChatId && state.chats[state.currentChatId]?.messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white/5 border border-white/10 text-gray-100 rounded-bl-none'
                                }`}>
                                    <MarkdownRenderer content={msg.text} />
                                    <div className="text-[10px] opacity-50 text-right mt-2">
                                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex gap-1">
                                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-white/10 bg-[#0b0b0b]/90 backdrop-blur-md p-4 space-y-3">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {PROMPTS.map(p => (
                                <button 
                                    key={p.label}
                                    onClick={() => handleSendMessage(p.text)}
                                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 hover:border-brand-teal hover:text-brand-teal transition-colors"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-brand-teal/50 transition-colors">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(input);
                                    }
                                }}
                                placeholder="Describe your situation..."
                                className="w-full bg-transparent border-none outline-none text-white resize-none max-h-32 min-h-[44px] py-2 px-2 scrollbar-hide"
                                rows={1}
                            />
                            <button 
                                disabled={!input.trim() || isTyping}
                                onClick={() => handleSendMessage(input)}
                                className="p-2.5 bg-brand-teal rounded-lg text-brand-darker font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* SAFETY MONITOR VIEW */}
                    <header className="h-16 border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setState(p => ({...p, sidebarOpen: true}))} className="md:hidden text-white/70">
                                <MenuIcon />
                            </button>
                            <h2 className="font-display font-semibold text-white/90">Safety Monitor</h2>
                        </div>
                        <button 
                            onClick={handleScanZones}
                            disabled={scanning}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${scanning ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30'}`}
                        >
                            <ScanIcon /> {scanning ? 'Scanning...' : 'Scan All Zones'}
                        </button>
                    </header>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                        {/* Zones Column */}
                        <div className="p-6 overflow-y-auto border-b md:border-b-0 md:border-r border-white/10">
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex justify-between items-center">
                                Monitored Zones
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{state.safetyZones.length} Active</span>
                            </h3>

                            {/* Add Zone Form */}
                            <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                                <div className="flex flex-col gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="Location (e.g., 'Paris', 'My Hotel')" 
                                        value={newZoneName}
                                        onChange={(e) => setNewZoneName(e.target.value)}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-teal"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={newZoneThreshold} 
                                            onChange={(e) => setNewZoneThreshold(e.target.value as any)}
                                            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/80"
                                        >
                                            <option value="LOW">Alert: Low+</option>
                                            <option value="MEDIUM">Alert: Med+</option>
                                            <option value="HIGH">Alert: High Only</option>
                                        </select>
                                        <button 
                                            onClick={handleAddZone}
                                            disabled={!newZoneName.trim()}
                                            className="flex-1 bg-brand-teal text-brand-darker font-bold rounded-lg text-sm hover:brightness-110 disabled:opacity-50"
                                        >
                                            Add Zone
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                {state.safetyZones.length === 0 && (
                                    <div className="text-white/30 text-center py-8 text-sm italic">No zones monitored. Add one to begin.</div>
                                )}
                                {state.safetyZones.map(zone => (
                                    <div key={zone.id} className="group bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between hover:border-brand-teal/50 transition-colors">
                                        <div>
                                            <div className="font-semibold text-white/90">{zone.name}</div>
                                            <div className="text-xs text-white/50 mt-1 flex gap-2">
                                                <span>Threshold: <span className="text-brand-accent">{zone.threshold}</span></span>
                                                {zone.lastChecked && <span>Last scan: {new Date(zone.lastChecked).toLocaleTimeString()}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteZone(zone.id)} className="text-white/30 hover:text-red-400 p-2">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alerts Column */}
                        <div className="p-6 overflow-y-auto bg-[#050505]/50 flex flex-col">
                             <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                Live Alerts
                                <AlertIcon />
                            </h3>
                            
                            <div className="flex-1 space-y-4">
                                {state.alerts.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-white/20 text-sm italic">
                                        All systems clear. No active alerts.
                                    </div>
                                ) : (
                                    state.alerts.map(alert => (
                                        <div key={alert.id} className="bg-white/5 border border-white/10 rounded-lg p-4 animate-fade-in relative overflow-hidden">
                                            {/* Accent line based on level */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.level === 'HIGH' ? 'bg-red-500' : alert.level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                            
                                            <div className="flex justify-between items-start mb-2 pl-2">
                                                <div className="font-bold text-sm text-white/90">{alert.zoneName}</div>
                                                <ThreatBadge level={alert.level} />
                                            </div>
                                            <p className="text-sm text-white/70 pl-2 mb-2 leading-relaxed">{alert.message}</p>
                                            <div className="text-[10px] text-white/30 pl-2 text-right">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={alertsEndRef} />
                            </div>
                        </div>
                    </div>
                  </>
                )}
            </main>
        </div>
    </StarBackground>
  );
}

export default App;