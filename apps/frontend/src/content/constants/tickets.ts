// content/constants/tickets.ts
// Ticket status values referenced by both the UI and Convex backend logic.

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'ESCALATED';

export const ticketStatuses: TicketStatus[] = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'ESCALATED',
];
