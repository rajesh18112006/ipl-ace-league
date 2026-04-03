import { IPLMatch } from './types';

// IPL 2026 tentative schedule (March-May)
export const IPL_TEAMS: Record<string, { short: string; color: string; logo: string }> = {
  'CSK': { short: 'CSK', color: '#f9cd05', logo: '🦁' },
  'MI': { short: 'MI', color: '#004ba0', logo: '🛡️' },
  'RCB': { short: 'RCB', color: '#d4213d', logo: '👑' },
  'KKR': { short: 'KKR', color: '#3a225d', logo: '⚔️' },
  'DC': { short: 'DC', color: '#0078bc', logo: '🏛️' },
  'PBKS': { short: 'PBKS', color: '#ed1b24', logo: '🗡️' },
  'RR': { short: 'RR', color: '#ea1a85', logo: '💎' },
  'SRH': { short: 'SRH', color: '#f7a721', logo: '☀️' },
  'GT': { short: 'GT', color: '#1c1c2b', logo: '🏔️' },
  'LSG': { short: 'LSG', color: '#00b7eb', logo: '🐘' },
};

export const IPL_SCHEDULE: IPLMatch[] = [
  { id: 'm1', matchNumber: 1, team1: 'KKR', team2: 'RCB', date: '2026-03-20', venue: 'Eden Gardens, Kolkata' },
  { id: 'm2', matchNumber: 2, team1: 'CSK', team2: 'MI', date: '2026-03-21', venue: 'MA Chidambaram, Chennai' },
  { id: 'm3', matchNumber: 3, team1: 'SRH', team2: 'RR', date: '2026-03-22', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm4', matchNumber: 4, team1: 'DC', team2: 'LSG', date: '2026-03-22', venue: 'Arun Jaitley, Delhi' },
  { id: 'm5', matchNumber: 5, team1: 'GT', team2: 'PBKS', date: '2026-03-23', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm6', matchNumber: 6, team1: 'RCB', team2: 'CSK', date: '2026-03-24', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm7', matchNumber: 7, team1: 'MI', team2: 'KKR', date: '2026-03-25', venue: 'Wankhede, Mumbai' },
  { id: 'm8', matchNumber: 8, team1: 'LSG', team2: 'SRH', date: '2026-03-25', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm9', matchNumber: 9, team1: 'RR', team2: 'DC', date: '2026-03-26', venue: 'SMS, Jaipur' },
  { id: 'm10', matchNumber: 10, team1: 'PBKS', team2: 'RCB', date: '2026-03-27', venue: 'IS Bindra, Mohali' },
  { id: 'm11', matchNumber: 11, team1: 'CSK', team2: 'GT', date: '2026-03-28', venue: 'MA Chidambaram, Chennai' },
  { id: 'm12', matchNumber: 12, team1: 'KKR', team2: 'DC', date: '2026-03-29', venue: 'Eden Gardens, Kolkata' },
  { id: 'm13', matchNumber: 13, team1: 'MI', team2: 'RR', date: '2026-03-29', venue: 'Wankhede, Mumbai' },
  { id: 'm14', matchNumber: 14, team1: 'SRH', team2: 'PBKS', date: '2026-03-30', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm15', matchNumber: 15, team1: 'LSG', team2: 'GT', date: '2026-03-30', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm16', matchNumber: 16, team1: 'RCB', team2: 'MI', date: '2026-03-31', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm17', matchNumber: 17, team1: 'DC', team2: 'CSK', date: '2026-04-01', venue: 'Arun Jaitley, Delhi' },
  { id: 'm18', matchNumber: 18, team1: 'RR', team2: 'KKR', date: '2026-04-01', venue: 'SMS, Jaipur' },
  { id: 'm19', matchNumber: 19, team1: 'PBKS', team2: 'LSG', date: '2026-04-02', venue: 'IS Bindra, Mohali' },
  { id: 'm20', matchNumber: 20, team1: 'GT', team2: 'SRH', date: '2026-04-03', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm21', matchNumber: 21, team1: 'CSK', team2: 'RR', date: '2026-04-04', venue: 'MA Chidambaram, Chennai' },
  { id: 'm22', matchNumber: 22, team1: 'MI', team2: 'DC', date: '2026-04-05', venue: 'Wankhede, Mumbai' },
  { id: 'm23', matchNumber: 23, team1: 'KKR', team2: 'PBKS', date: '2026-04-05', venue: 'Eden Gardens, Kolkata' },
  { id: 'm24', matchNumber: 24, team1: 'RCB', team2: 'GT', date: '2026-04-06', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm25', matchNumber: 25, team1: 'SRH', team2: 'LSG', date: '2026-04-06', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm26', matchNumber: 26, team1: 'DC', team2: 'PBKS', date: '2026-04-07', venue: 'Arun Jaitley, Delhi' },
  { id: 'm27', matchNumber: 27, team1: 'RR', team2: 'MI', date: '2026-04-08', venue: 'SMS, Jaipur' },
  { id: 'm28', matchNumber: 28, team1: 'GT', team2: 'KKR', date: '2026-04-09', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm29', matchNumber: 29, team1: 'CSK', team2: 'SRH', date: '2026-04-10', venue: 'MA Chidambaram, Chennai' },
  { id: 'm30', matchNumber: 30, team1: 'LSG', team2: 'RCB', date: '2026-04-10', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm31', matchNumber: 31, team1: 'MI', team2: 'GT', date: '2026-04-11', venue: 'Wankhede, Mumbai' },
  { id: 'm32', matchNumber: 32, team1: 'PBKS', team2: 'RR', date: '2026-04-12', venue: 'IS Bindra, Mohali' },
  { id: 'm33', matchNumber: 33, team1: 'DC', team2: 'RCB', date: '2026-04-12', venue: 'Arun Jaitley, Delhi' },
  { id: 'm34', matchNumber: 34, team1: 'KKR', team2: 'CSK', date: '2026-04-13', venue: 'Eden Gardens, Kolkata' },
  { id: 'm35', matchNumber: 35, team1: 'SRH', team2: 'MI', date: '2026-04-14', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm36', matchNumber: 36, team1: 'LSG', team2: 'DC', date: '2026-04-14', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm37', matchNumber: 37, team1: 'GT', team2: 'RR', date: '2026-04-15', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm38', matchNumber: 38, team1: 'RCB', team2: 'PBKS', date: '2026-04-16', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm39', matchNumber: 39, team1: 'CSK', team2: 'LSG', date: '2026-04-17', venue: 'MA Chidambaram, Chennai' },
  { id: 'm40', matchNumber: 40, team1: 'MI', team2: 'PBKS', date: '2026-04-18', venue: 'Wankhede, Mumbai' },
  { id: 'm41', matchNumber: 41, team1: 'KKR', team2: 'SRH', date: '2026-04-19', venue: 'Eden Gardens, Kolkata' },
  { id: 'm42', matchNumber: 42, team1: 'RR', team2: 'RCB', date: '2026-04-19', venue: 'SMS, Jaipur' },
  { id: 'm43', matchNumber: 43, team1: 'DC', team2: 'GT', date: '2026-04-20', venue: 'Arun Jaitley, Delhi' },
  { id: 'm44', matchNumber: 44, team1: 'LSG', team2: 'MI', date: '2026-04-21', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm45', matchNumber: 45, team1: 'PBKS', team2: 'CSK', date: '2026-04-22', venue: 'IS Bindra, Mohali' },
  { id: 'm46', matchNumber: 46, team1: 'SRH', team2: 'DC', date: '2026-04-22', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm47', matchNumber: 47, team1: 'RCB', team2: 'KKR', date: '2026-04-23', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm48', matchNumber: 48, team1: 'GT', team2: 'CSK', date: '2026-04-24', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm49', matchNumber: 49, team1: 'RR', team2: 'LSG', date: '2026-04-25', venue: 'SMS, Jaipur' },
  { id: 'm50', matchNumber: 50, team1: 'MI', team2: 'SRH', date: '2026-04-25', venue: 'Wankhede, Mumbai' },
  { id: 'm51', matchNumber: 51, team1: 'PBKS', team2: 'KKR', date: '2026-04-26', venue: 'IS Bindra, Mohali' },
  { id: 'm52', matchNumber: 52, team1: 'DC', team2: 'RR', date: '2026-04-27', venue: 'Arun Jaitley, Delhi' },
  { id: 'm53', matchNumber: 53, team1: 'CSK', team2: 'RCB', date: '2026-04-27', venue: 'MA Chidambaram, Chennai' },
  { id: 'm54', matchNumber: 54, team1: 'GT', team2: 'MI', date: '2026-04-28', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm55', matchNumber: 55, team1: 'LSG', team2: 'PBKS', date: '2026-04-29', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm56', matchNumber: 56, team1: 'SRH', team2: 'KKR', date: '2026-04-30', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm57', matchNumber: 57, team1: 'RCB', team2: 'DC', date: '2026-05-01', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm58', matchNumber: 58, team1: 'RR', team2: 'GT', date: '2026-05-02', venue: 'SMS, Jaipur' },
  { id: 'm59', matchNumber: 59, team1: 'CSK', team2: 'KKR', date: '2026-05-03', venue: 'MA Chidambaram, Chennai' },
  { id: 'm60', matchNumber: 60, team1: 'MI', team2: 'LSG', date: '2026-05-03', venue: 'Wankhede, Mumbai' },
  { id: 'm61', matchNumber: 61, team1: 'PBKS', team2: 'SRH', date: '2026-05-04', venue: 'IS Bindra, Mohali' },
  { id: 'm62', matchNumber: 62, team1: 'DC', team2: 'MI', date: '2026-05-05', venue: 'Arun Jaitley, Delhi' },
  { id: 'm63', matchNumber: 63, team1: 'RCB', team2: 'RR', date: '2026-05-06', venue: 'M Chinnaswamy, Bengaluru' },
  { id: 'm64', matchNumber: 64, team1: 'GT', team2: 'LSG', date: '2026-05-07', venue: 'Narendra Modi, Ahmedabad' },
  { id: 'm65', matchNumber: 65, team1: 'KKR', team2: 'MI', date: '2026-05-08', venue: 'Eden Gardens, Kolkata' },
  { id: 'm66', matchNumber: 66, team1: 'SRH', team2: 'CSK', date: '2026-05-09', venue: 'Rajiv Gandhi, Hyderabad' },
  { id: 'm67', matchNumber: 67, team1: 'PBKS', team2: 'DC', date: '2026-05-10', venue: 'IS Bindra, Mohali' },
  { id: 'm68', matchNumber: 68, team1: 'RR', team2: 'PBKS', date: '2026-05-11', venue: 'SMS, Jaipur' },
  { id: 'm69', matchNumber: 69, team1: 'LSG', team2: 'KKR', date: '2026-05-12', venue: 'BRSABV Ekana, Lucknow' },
  { id: 'm70', matchNumber: 70, team1: 'MI', team2: 'RCB', date: '2026-05-13', venue: 'Wankhede, Mumbai' },
];

export function getTodayMatch(): IPLMatch | undefined {
  const today = new Date().toISOString().split('T')[0];
  return IPL_SCHEDULE.find(m => m.date === today);
}

export function getUpcomingMatches(count = 5): IPLMatch[] {
  const today = new Date().toISOString().split('T')[0];
  return IPL_SCHEDULE.filter(m => m.date >= today).slice(0, count);
}

export function getPastMatches(): IPLMatch[] {
  const today = new Date().toISOString().split('T')[0];
  return IPL_SCHEDULE.filter(m => m.date < today).reverse();
}
