import { IPLMatch } from './types';

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
  { id: 'm1', matchNumber: 1, team1: 'SRH', team2: 'RCB', date: '2026-03-28', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { id: 'm2', matchNumber: 2, team1: 'KKR', team2: 'MI', date: '2026-03-29', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm3', matchNumber: 3, team1: 'CSK', team2: 'RR', date: '2026-03-30', venue: 'Barsapara Cricket Stadium, Guwahati' },
  { id: 'm4', matchNumber: 4, team1: 'GT', team2: 'PBKS', date: '2026-03-31', venue: 'Maharaja Yadavindra Singh Intl Stadium, Mullanpur' },
  { id: 'm5', matchNumber: 5, team1: 'LSG', team2: 'DC', date: '2026-04-01', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm6', matchNumber: 6, team1: 'SRH', team2: 'KKR', date: '2026-04-02', venue: 'Eden Gardens, Kolkata' },
  { id: 'm7', matchNumber: 7, team1: 'CSK', team2: 'PBKS', date: '2026-04-03', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm8', matchNumber: 8, team1: 'DC', team2: 'MI', date: '2026-04-04', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm9', matchNumber: 9, team1: 'GT', team2: 'RR', date: '2026-04-04', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm10', matchNumber: 10, team1: 'SRH', team2: 'LSG', date: '2026-04-05', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm11', matchNumber: 11, team1: 'RCB', team2: 'CSK', date: '2026-04-05', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { id: 'm12', matchNumber: 12, team1: 'KKR', team2: 'PBKS', date: '2026-04-06', venue: 'Eden Gardens, Kolkata' },
  { id: 'm13', matchNumber: 13, team1: 'RR', team2: 'MI', date: '2026-04-07', venue: 'Barsapara Cricket Stadium, Guwahati' },
  { id: 'm14', matchNumber: 14, team1: 'DC', team2: 'GT', date: '2026-04-08', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm15', matchNumber: 15, team1: 'KKR', team2: 'LSG', date: '2026-04-09', venue: 'Eden Gardens, Kolkata' },
  { id: 'm16', matchNumber: 16, team1: 'RR', team2: 'RCB', date: '2026-04-10', venue: 'Barsapara Cricket Stadium, Guwahati' },
  { id: 'm17', matchNumber: 17, team1: 'PBKS', team2: 'SRH', date: '2026-04-11', venue: 'Maharaja Yadavindra Singh Intl Stadium, Mullanpur' },
  { id: 'm18', matchNumber: 18, team1: 'CSK', team2: 'DC', date: '2026-04-11', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm19', matchNumber: 19, team1: 'LSG', team2: 'GT', date: '2026-04-12', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm20', matchNumber: 20, team1: 'MI', team2: 'RCB', date: '2026-04-12', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm21', matchNumber: 21, team1: 'SRH', team2: 'RR', date: '2026-04-13', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm22', matchNumber: 22, team1: 'CSK', team2: 'KKR', date: '2026-04-14', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm23', matchNumber: 23, team1: 'RCB', team2: 'LSG', date: '2026-04-15', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { id: 'm24', matchNumber: 24, team1: 'MI', team2: 'PBKS', date: '2026-04-16', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm25', matchNumber: 25, team1: 'GT', team2: 'KKR', date: '2026-04-17', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm26', matchNumber: 26, team1: 'RCB', team2: 'DC', date: '2026-04-18', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { id: 'm27', matchNumber: 27, team1: 'SRH', team2: 'CSK', date: '2026-04-18', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm28', matchNumber: 28, team1: 'KKR', team2: 'RR', date: '2026-04-19', venue: 'Eden Gardens, Kolkata' },
  { id: 'm29', matchNumber: 29, team1: 'PBKS', team2: 'LSG', date: '2026-04-19', venue: 'Maharaja Yadavindra Singh Intl Stadium, Mullanpur' },
  { id: 'm30', matchNumber: 30, team1: 'GT', team2: 'MI', date: '2026-04-20', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm31', matchNumber: 31, team1: 'SRH', team2: 'DC', date: '2026-04-21', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm32', matchNumber: 32, team1: 'LSG', team2: 'RR', date: '2026-04-22', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm33', matchNumber: 33, team1: 'MI', team2: 'CSK', date: '2026-04-23', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm34', matchNumber: 34, team1: 'RCB', team2: 'GT', date: '2026-04-24', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  { id: 'm35', matchNumber: 35, team1: 'DC', team2: 'PBKS', date: '2026-04-25', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm36', matchNumber: 36, team1: 'RR', team2: 'SRH', date: '2026-04-25', venue: 'Sawai Mansingh Stadium, Jaipur' },
  { id: 'm37', matchNumber: 37, team1: 'GT', team2: 'CSK', date: '2026-04-26', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm38', matchNumber: 38, team1: 'LSG', team2: 'KKR', date: '2026-04-26', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm39', matchNumber: 39, team1: 'DC', team2: 'RCB', date: '2026-04-27', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm40', matchNumber: 40, team1: 'PBKS', team2: 'RR', date: '2026-04-28', venue: 'Maharaja Yadavindra Singh Intl Stadium, Mullanpur' },
  { id: 'm41', matchNumber: 41, team1: 'MI', team2: 'SRH', date: '2026-04-29', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm42', matchNumber: 42, team1: 'GT', team2: 'RCB', date: '2026-04-30', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm43', matchNumber: 43, team1: 'RR', team2: 'DC', date: '2026-05-01', venue: 'Sawai Mansingh Stadium, Jaipur' },
  { id: 'm44', matchNumber: 44, team1: 'CSK', team2: 'MI', date: '2026-05-02', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm45', matchNumber: 45, team1: 'SRH', team2: 'KKR', date: '2026-05-03', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm46', matchNumber: 46, team1: 'GT', team2: 'PBKS', date: '2026-05-03', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm47', matchNumber: 47, team1: 'MI', team2: 'LSG', date: '2026-05-04', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm48', matchNumber: 48, team1: 'DC', team2: 'CSK', date: '2026-05-05', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm49', matchNumber: 49, team1: 'SRH', team2: 'PBKS', date: '2026-05-06', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm50', matchNumber: 50, team1: 'LSG', team2: 'RCB', date: '2026-05-07', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm51', matchNumber: 51, team1: 'DC', team2: 'KKR', date: '2026-05-08', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm52', matchNumber: 52, team1: 'RR', team2: 'GT', date: '2026-05-09', venue: 'Sawai Mansingh Stadium, Jaipur' },
  { id: 'm53', matchNumber: 53, team1: 'CSK', team2: 'LSG', date: '2026-05-10', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm54', matchNumber: 54, team1: 'RCB', team2: 'MI', date: '2026-05-10', venue: 'Shaheed Veer Narayan Singh Intl Stadium, Raipur' },
  { id: 'm55', matchNumber: 55, team1: 'PBKS', team2: 'DC', date: '2026-05-11', venue: 'HPCA Stadium, Dharamsala' },
  { id: 'm56', matchNumber: 56, team1: 'GT', team2: 'SRH', date: '2026-05-12', venue: 'Narendra Modi Stadium, Ahmedabad' },
  { id: 'm57', matchNumber: 57, team1: 'RCB', team2: 'KKR', date: '2026-05-13', venue: 'Shaheed Veer Narayan Singh Intl Stadium, Raipur' },
  { id: 'm58', matchNumber: 58, team1: 'PBKS', team2: 'MI', date: '2026-05-14', venue: 'HPCA Stadium, Dharamsala' },
  { id: 'm59', matchNumber: 59, team1: 'LSG', team2: 'CSK', date: '2026-05-15', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm60', matchNumber: 60, team1: 'KKR', team2: 'GT', date: '2026-05-16', venue: 'Eden Gardens, Kolkata' },
  { id: 'm61', matchNumber: 61, team1: 'PBKS', team2: 'RCB', date: '2026-05-17', venue: 'HPCA Stadium, Dharamsala' },
  { id: 'm62', matchNumber: 62, team1: 'DC', team2: 'RR', date: '2026-05-17', venue: 'Arun Jaitley Stadium, Delhi' },
  { id: 'm63', matchNumber: 63, team1: 'CSK', team2: 'SRH', date: '2026-05-18', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm64', matchNumber: 64, team1: 'RR', team2: 'LSG', date: '2026-05-19', venue: 'Sawai Mansingh Stadium, Jaipur' },
  { id: 'm65', matchNumber: 65, team1: 'KKR', team2: 'MI', date: '2026-05-20', venue: 'Eden Gardens, Kolkata' },
  { id: 'm66', matchNumber: 66, team1: 'CSK', team2: 'GT', date: '2026-05-21', venue: 'MA Chidambaram Stadium, Chennai' },
  { id: 'm67', matchNumber: 67, team1: 'SRH', team2: 'RCB', date: '2026-05-22', venue: 'Rajiv Gandhi Intl Stadium, Hyderabad' },
  { id: 'm68', matchNumber: 68, team1: 'LSG', team2: 'PBKS', date: '2026-05-23', venue: 'BRSABV Ekana Cricket Stadium, Lucknow' },
  { id: 'm69', matchNumber: 69, team1: 'MI', team2: 'RR', date: '2026-05-24', venue: 'Wankhede Stadium, Mumbai' },
  { id: 'm70', matchNumber: 70, team1: 'KKR', team2: 'DC', date: '2026-05-24', venue: 'Eden Gardens, Kolkata' },
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
