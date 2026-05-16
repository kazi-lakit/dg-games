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
import { Match, MatchStatus, TeamInformation, TournamentInformation } from '../../types/match.types';

const STATUSES: MatchStatus[] = ['Scheduled', 'Live', 'Completed', 'Cancelled'];

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

  const setTeamField = (side: 'homeTeam' | 'awayTeam', key: keyof TeamInformation, value: string) =>
    setForm((f) => ({ ...f, [side]: { ...f[side], [key]: value } }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Match' : 'Schedule New Match'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="m-tournament-title">Tournament Title</Label>
            <Input
              id="m-tournament-title"
              placeholder="e.g. Premier League 2025"
              value={form.tournament.title}
              onChange={(e) => setForm((f) => ({ ...f, tournament: { ...f.tournament, title: e.target.value } }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="m-tournament-id">Tournament ID</Label>
            <Input
              id="m-tournament-id"
              placeholder="e.g. T1"
              value={form.tournament.tournamentId}
              onChange={(e) => setForm((f) => ({ ...f, tournament: { ...f.tournament, tournamentId: e.target.value } }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Home Team</Label>
            <Input
              placeholder="Team name"
              value={form.homeTeam.name}
              onChange={(e) => setTeamField('homeTeam', 'name', e.target.value)}
              required
            />
            <Input
              placeholder="Team ID"
              value={form.homeTeam.teamId}
              onChange={(e) => setTeamField('homeTeam', 'teamId', e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>Away Team</Label>
            <Input
              placeholder="Team name"
              value={form.awayTeam.name}
              onChange={(e) => setTeamField('awayTeam', 'name', e.target.value)}
              required
            />
            <Input
              placeholder="Team ID"
              value={form.awayTeam.teamId}
              onChange={(e) => setTeamField('awayTeam', 'teamId', e.target.value)}
              required
            />
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
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Schedule Match'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
