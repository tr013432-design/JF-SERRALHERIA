
export enum ProjectStatus {
  NEW = 'Novo',
  MEASUREMENT = 'Medição',
  PRODUCTION = 'Produção',
  INSTALLATION = 'Instalação',
  COMPLETED = 'Concluído'
}

export type InteractionType = 'Call' | 'Email' | 'Meeting' | 'Whatsapp' | 'Note';

export interface Interaction {
  id: string;
  date: string;
  type: InteractionType;
  notes: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  interactions?: Interaction[];
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  value: number;
  status: ProjectStatus;
  deadline: string;
  lastUpdate: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  total: number;
  items: QuoteItem[];
  notes: string;
  aiGeneratedProposal?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
}

export type EventType = 'TechnicalVisit' | 'Installation';

export interface CalendarEvent {
  id: string;
  clientId: string;
  title: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  time: string; // HH:mm
  type: EventType;
  notes?: string;
}
