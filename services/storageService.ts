import { ChatSession, User, SafetyZone, Alert } from '../types';

const STORAGE_KEY = 'dep_app_data_v2'; 

interface StoredData {
  users: User[];
  chats: Record<string, ChatSession>;
  activeUser: User | null;
  safetyZones: SafetyZone[];
  alerts: Alert[];
}

const getStorage = (): StoredData => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { users: [], chats: {}, activeUser: null, safetyZones: [], alerts: [] };
  }
  const data = JSON.parse(raw);
  // Migration for older data structure
  if (!data.safetyZones) data.safetyZones = [];
  if (!data.alerts) data.alerts = [];
  return data;
};

const setStorage = (data: StoredData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const registerUser = (
  username: string, 
  password: string, 
  email?: string, 
  phone?: string, 
  emergencyContact?: string
): boolean => {
  const data = getStorage();
  if (data.users.find((u) => u.username === username)) {
    return false; // User exists
  }
  const newUser: User = { 
    username, 
    password, 
    email,
    phone,
    emergencyContact,
    token: `mock-token-${Date.now()}` 
  };
  data.users.push(newUser);
  setStorage(data);
  return true;
};

export const loginUser = (username: string, password: string): User | null => {
  const data = getStorage();
  const user = data.users.find((u) => u.username === username);
  // Check password (if user has one stored)
  if (user && (!user.password || user.password === password)) {
    data.activeUser = user;
    setStorage(data);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  const data = getStorage();
  data.activeUser = null;
  setStorage(data);
};

export const getActiveUser = (): User | null => {
  return getStorage().activeUser;
};

export const saveChat = (chat: ChatSession) => {
  const data = getStorage();
  data.chats[chat.id] = chat;
  setStorage(data);
};

export const getChats = (): Record<string, ChatSession> => {
  return getStorage().chats;
};

export const deleteChat = (chatId: string) => {
  const data = getStorage();
  delete data.chats[chatId];
  setStorage(data);
};

// Safety Features
export const getSafetyZones = (): SafetyZone[] => {
  return getStorage().safetyZones;
};

export const saveSafetyZone = (zone: SafetyZone) => {
  const data = getStorage();
  const index = data.safetyZones.findIndex(z => z.id === zone.id);
  if (index >= 0) {
    data.safetyZones[index] = zone;
  } else {
    data.safetyZones.push(zone);
  }
  setStorage(data);
};

export const deleteSafetyZone = (id: string) => {
  const data = getStorage();
  data.safetyZones = data.safetyZones.filter(z => z.id !== id);
  setStorage(data);
};

export const getAlerts = (): Alert[] => {
  return getStorage().alerts;
};

export const addAlert = (alert: Alert) => {
  const data = getStorage();
  data.alerts.unshift(alert); // Newest first
  if (data.alerts.length > 50) data.alerts.pop(); // Keep limit
  setStorage(data);
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};