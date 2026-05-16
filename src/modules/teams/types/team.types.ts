export type Sport = 'Football' | 'Cricket' | 'Basketball' | 'Tennis' | 'Baseball';

export interface Team {
  id: string;
  name: string;
  sport: Sport;
  city: string;
  foundedYear: number;
  playerCount: number;
  status: 'Active' | 'Inactive';
}
