import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { Dialog, DialogTrigger } from '@/components/ui-kit/dialog';
import { DataTable, ConfirmationModal } from '@/components/core';
import { Match, MatchStatus } from '../../types/match.types';
import { CreateMatch } from '../../components/create-match/create-match';
import { useGetMatches, useInsertMatch, useUpdateMatch, useDeleteMatch } from '../../hooks/use-matches';

const statusVariant: Record<MatchStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Live: 'default',
  Scheduled: 'outline',
  Completed: 'secondary',
  Cancelled: 'destructive',
};

const ScoreCell = ({ home, away, status }: { home: number | null; away: number | null; status: MatchStatus }) => {
  if (status === 'Scheduled') return <span className="text-muted-foreground text-sm">vs</span>;
  if (home === null || away === null) return <span className="text-muted-foreground text-sm">—</span>;
  return <span className="font-mono font-semibold">{home} – {away}</span>;
};

export const MatchesListPage = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);

  const { data, isLoading, error } = useGetMatches(page, pageSize);
  const { mutateAsync: insert, isPending: inserting } = useInsertMatch();
  const { mutateAsync: update, isPending: updating } = useUpdateMatch();
  const { mutateAsync: remove, isPending: deleting } = useDeleteMatch();

  const handleCreate = async (input: Omit<Match, 'id'>) => {
    await insert(input);
    setIsCreateOpen(false);
  };

  const handleEdit = async (input: Omit<Match, 'id'>) => {
    if (!editTarget) return;
    await update({ id: editTarget.id, input });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns: ColumnDef<Match>[] = [
    {
      id: 'homeTeam',
      header: 'Home Team',
      cell: ({ row }) => <span className="font-medium">{row.original.homeTeam.name}</span>,
    },
    {
      id: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <ScoreCell home={row.original.homeScore} away={row.original.awayScore} status={row.original.status} />
      ),
    },
    {
      id: 'awayTeam',
      header: 'Away Team',
      cell: ({ row }) => <span className="font-medium">{row.original.awayTeam.name}</span>,
    },
    {
      id: 'tournament',
      header: 'Tournament',
      cell: ({ row }) => row.original.tournament.title,
    },
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'venue', header: 'Venue' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>{row.original.status}</Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="ghost" size="icon" onClick={() => setEditTarget(row.original)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(row.original)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full w-full gap-6 md:gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Matches</h2>
          <p className="text-sm text-muted-foreground mt-1">View and schedule tournament matches</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Schedule Match
            </Button>
          </DialogTrigger>
          {isCreateOpen && (
            <CreateMatch
              onClose={() => setIsCreateOpen(false)}
              onSubmit={handleCreate}
              isLoading={inserting}
            />
          )}
        </Dialog>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        isLoading={isLoading}
        error={null}
        pagination={{ pageIndex: page, pageSize, totalCount: data?.totalCount ?? 0 }}
        onPaginationChange={({ pageIndex }) => setPage(pageIndex)}
        manualPagination
      />

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        {editTarget && (
          <CreateMatch
            initialData={editTarget}
            onClose={() => setEditTarget(null)}
            onSubmit={handleEdit}
            isLoading={updating}
          />
        )}
      </Dialog>

      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Match"
        description={`Are you sure you want to delete this match? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};
