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
import { Team, Sport } from '../../types/team.types';

const SPORTS: Sport[] = ['Football', 'Cricket', 'Basketball', 'Tennis', 'Baseball'];

type TeamInput = Omit<Team, 'id'>;

interface CreateTeamProps {
  initialData?: Team;
  onClose: () => void;
  onSubmit: (data: TeamInput) => void;
  isLoading?: boolean;
}

export const CreateTeam = ({ initialData, onClose, onSubmit, isLoading }: CreateTeamProps) => {
  const isEdit = !!initialData;
  const [form, setForm] = useState<TeamInput>({
    name: initialData?.name ?? '',
    sport: initialData?.sport ?? 'Football',
    city: initialData?.city ?? '',
    foundedYear: initialData?.foundedYear ?? new Date().getFullYear(),
    playerCount: initialData?.playerCount ?? 11,
    status: initialData?.status ?? 'Active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <DialogContent className="sm:max-w-[480px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Team' : 'Create New Team'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="team-name">Team Name</Label>
          <Input
            id="team-name"
            placeholder="e.g. Thunder Hawks"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sport">Sport</Label>
          <select
            id="sport"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.sport}
            onChange={(e) => setForm((f) => ({ ...f, sport: e.target.value as Sport }))}
          >
            {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="e.g. New York"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="founded">Founded Year</Label>
            <Input
              id="founded"
              type="number"
              min={1801}
              max={new Date().getFullYear()}
              value={form.foundedYear}
              onChange={(e) => setForm((f) => ({ ...f, foundedYear: Number(e.target.value) }))}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="players">Player Count</Label>
            <Input
              id="players"
              type="number"
              min={1}
              max={100}
              value={form.playerCount}
              onChange={(e) => setForm((f) => ({ ...f, playerCount: Number(e.target.value) }))}
              required
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Team['status'] }))}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Team'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
