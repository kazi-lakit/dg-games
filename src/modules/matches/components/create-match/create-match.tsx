import { useState } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui-kit/dialog';
import { Button } from '@/components/ui-kit/button';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Match, MatchStatus, TournamentInformation, TeamInformation } from '../../types/match.types';
import { useGetTournaments } from '@/modules/tournaments/hooks/use-tournaments';
import { useGetTeams } from '@/modules/teams/hooks/use-teams';

const STATUSES: MatchStatus[] = ['Scheduled', 'Live', 'Completed', 'Cancelled'];
const SELECT_CLS = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50';

type MatchInput = Omit<Match, 'id'>;

interface CreateMatchProps {
  initialData?: Match;
  onClose: () => void;
  onSubmit: (data: MatchInput) => void;
  isLoading?: boolean;
}

const emptyTeam = (): TeamInformation => ({ name: '', teamId: '' });
const emptyTournament = (): TournamentInformation => ({ title: '', tournamentId: '' });

export const CreateMatch = ({ initialData, onClose, onSubmit, isLoading }: CreateMatchProps) => {
  const isEdit = !!initialData;
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState<MatchInput>({
    tournament: initialData?.tournament ?? emptyTournament(),
    homeTeam: initialData?.homeTeam ?? emptyTeam(),
    awayTeam: initialData?.awayTeam ?? emptyTeam(),
    date: initialData?.date ?? today,
    venue: initialData?.venue ?? '',
    homeScore: initialData?.homeScore ?? null,
    awayScore: initialData?.awayScore ?? null,
    status: initialData?.status ?? 'Scheduled',
  });

  const { data: tournamentsData, isLoading: loadingTournaments } = useGetTournaments(0, 100);
  const { data: teamsData, isLoading: loadingTeams } = useGetTeams(0, 100);

  const handleTournamentChange = (id: string) => {
    const t = tournamentsData?.data.find((t) => t.id === id);
    if (t) setForm((f) => ({ ...f, tournament: { title: t.name, tournamentId: t.id } }));
  };

  const handleTeamChange = (side: 'homeTeam' | 'awayTeam', id: string) => {
    const t = teamsData?.data.find((t) => t.id === id);
    if (t) setForm((f) => ({ ...f, [side]: { name: t.name, teamId: t.id } }));
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isBusy = isLoading || loadingTournaments || loadingTeams;

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">

        <div className="grid gap-2">
          <Label htmlFor="m-tournament">Tournament</Label>
          <select
            id="m-tournament"
            className={SELECT_CLS}
            value={form.tournament.tournamentId}
            onChange={(e) => handleTournamentChange(e.target.value)}
            disabled={loadingTournaments}
            required
          >
            <option value="">{loadingTournaments ? 'Loading…' : 'Select a tournament'}</option>
            {tournamentsData?.data.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-home">Home Team</Label>
            <select
              id="m-home"
              className={SELECT_CLS}
              value={form.homeTeam.teamId}
              onChange={(e) => handleTeamChange('homeTeam', e.target.value)}
              disabled={loadingTeams}
              required
            >
              <option value="">{loadingTeams ? 'Loading…' : 'Select home team'}</option>
              {teamsData?.data.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-away">Away Team</Label>
            <select
              id="m-away"
              className={SELECT_CLS}
              value={form.awayTeam.teamId}
              onChange={(e) => handleTeamChange('awayTeam', e.target.value)}
              disabled={loadingTeams}
              required
            >
              <option value="">{loadingTeams ? 'Loading…' : 'Select away team'}</option>
              {teamsData?.data.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-date">Match Date</Label>
            <Input
              id="m-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-status">Status</Label>
            <select
              id="m-status"
              className={SELECT_CLS}
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as MatchStatus }))}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="m-venue">Venue</Label>
          <Input
            id="m-venue"
            placeholder="e.g. Wembley Stadium"
            value={form.venue}
            onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
            required
          />
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>Cancel</Button>
          <Button type="submit" disabled={isBusy}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Schedule Match'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
