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
import { Sport } from '@/modules/teams/types/team.types';
import { Tournament, TournamentFormat, TournamentStatus } from '../../types/tournament.types';

const SPORTS: Sport[] = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball'];
const FORMATS: TournamentFormat[] = ['Round Robin', 'Knockout', 'League', 'Group Stage'];
const STATUSES: TournamentStatus[] = ['Upcoming', 'Ongoing', 'Completed'];

type TournamentInput = Omit<Tournament, 'id'>;

interface CreateTournamentProps {
  initialData?: Tournament;
  onClose: () => void;
  onSubmit: (data: TournamentInput) => void;
  isLoading?: boolean;
}

export const CreateTournament = ({ initialData, onClose, onSubmit, isLoading }: CreateTournamentProps) => {
  const isEdit = !!initialData;
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<TournamentInput>({
    name: initialData?.name ?? '',
    sport: initialData?.sport ?? 'Football',
    format: initialData?.format ?? 'Round Robin',
    startDate: initialData?.startDate ?? today,
    endDate: initialData?.endDate ?? today,
    status: initialData?.status ?? 'Upcoming',
    teamCount: initialData?.teamCount ?? 8,
    location: initialData?.location ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Tournament' : 'Create New Tournament'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="t-name">Tournament Name</Label>
          <Input
            id="t-name"
            placeholder="e.g. World Cup 2025"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="t-sport">Sport</Label>
            <select
              id="t-sport"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.sport}
              onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as Sport }))}
            >
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-format">Format</Label>
            <select
              id="t-format"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.format}
              onChange={(e) => setForm((f) => ({ ...f, format: e.target.value as TournamentFormat }))}
            >
              {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="t-location">Location</Label>
          <Input
            id="t-location"
            placeholder="e.g. Wembley Stadium, London"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="t-start">Start Date</Label>
            <Input
              id="t-start"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-end">End Date</Label>
            <Input
              id="t-end"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="t-teams">Number of Teams</Label>
            <Input
              id="t-teams"
              type="number"
              min={2}
              max={64}
              value={form.teamCount}
              onChange={(e) => setForm((f) => ({ ...f, teamCount: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="t-status">Status</Label>
            <select
              id="t-status"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TournamentStatus }))}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Tournament'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
