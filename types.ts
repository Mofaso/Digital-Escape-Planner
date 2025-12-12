export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface User {
  username: string;
  token: string;
  password?: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
}

export interface SafetyZone {
  id: string;
  name: string;
  threshold: 'LOW' | 'MEDIUM' | 'HIGH';
  lastChecked?: number;
}

export interface Alert {
  id: string;
  zoneId: string;
  zoneName: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  timestamp: number;
}

export interface AppState {
  view: 'login' | 'signup' | 'chat' | 'safety';
  currentUser: User | null;
  currentChatId: string | null;
  chats: Record<string, ChatSession>;
  sidebarOpen: boolean;
  safetyZones: SafetyZone[];
  alerts: Alert[];
}

// Augment window for external libraries loaded via CDN
declare global {
  interface Window {
    marked: {
      parse: (text: string) => string;
    };
    jspdf: {
      jsPDF: new (options?: any) => any;
    };
  }
}