export type TicketStatus = 'available' | 'reserved' | 'paid';

export interface Ticket {
  id: string; // Used to uniquely identify the ticket (the physical ticket number)
  numbers: string[]; // All assigned numbers, including the main one
  status: TicketStatus;
  ownerName?: string;
  ownerPhone?: string;
  reservedAt?: string;
  paidAt?: string;
}

export interface Raffle {
  id: string;
  name: string;
  description: string;
  pricePerTicket: number;
  totalTickets: number; // e.g. physical tickets sold
  opportunities: number; // e.g. 1, 2, 3...
  distribution: 'lineal' | 'aleatoria';
  totalUniverse: number;
  columnsPreference?: number;
  themeColor?: string;
  tickets: Record<string, Ticket>;
  createdAt: string;
  drawDate: string;
}

export interface TandaParticipant {
  id: string; // The slot number (e.g., '1', '2')
  name: string;
  phone: string;
  status: 'available' | 'reserved';
  reservedAt?: string;
  payments: (string | null)[]; // Array of ISO payment dates or null, length = numberOfWeeks
}

export interface Tanda {
  id: string;
  name: string;
  description: string;
  pricePerWeek: number;
  numberOfWeeks: number;
  numberOfParticipants: number;
  startDate: string;
  createdAt: string;
  themeColor?: string;
  participants: Record<string, TandaParticipant>;
}
