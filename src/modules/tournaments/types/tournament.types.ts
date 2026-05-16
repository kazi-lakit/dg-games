import { Sport } from '@/modules/teams/types/team.types';

export type TournamentStatus = 'Upcoming' | 'Ongoing' | 'Completed';
export type TournamentFormat = 'Round Robin' | 'Knockout' | 'League' | 'Group Stage';

export interface Tournament {
  id: string;
  name: string;
  sport: Sport;
  format: TournamentFormat;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  teamCount: number;
  location: string;
}
