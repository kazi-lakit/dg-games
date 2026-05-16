export type MatchStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';

export interface TeamInformation {
  name: string;
  teamId: string;
}

export interface TournamentInformation {
  title: string;
  tournamentId: string;
}

export interface Match {
  id: string;
  tournament: TournamentInformation;
  homeTeam: TeamInformation;
  awayTeam: TeamInformation;
  date: string;
  venue: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}
