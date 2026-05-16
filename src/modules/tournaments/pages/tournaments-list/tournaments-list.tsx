import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { Dialog, DialogTrigger } from '@/components/ui-kit/dialog';
import { DataTable, ConfirmationModal } from '@/components/core';
import { Tournament, TournamentStatus } from '../../types/tournament.types';
import { CreateTournament } from '../../components/create-tournament/create-tournament';
import { useGetTournaments, useInsertTournament, useUpdateTournament, useDeleteTournament } from '../../hooks/use-tournaments';

const statusVariant: Record<TournamentStatus, 'default' | 'secondary' | 'outline'> = {
  Ongoing: 'default',
  Upcoming: 'outline',
  Completed: 'secondary',
};

export const TournamentsListPage = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Tournament | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);

  const { data, isLoading, error } = useGetTournaments(page, pageSize);
  const { mutateAsync: insert, isPending: inserting } = useInsertTournament();
  const { mutateAsync: update, isPending: updating } = useUpdateTournament();
  const { mutateAsync: remove, isPending: deleting } = useDeleteTournament();

  const handleCreate = async (input: Omit<Tournament, 'id'>) => {
    await insert(input);
    setIsCreateOpen(false);
  };

  const handleEdit = async (input: Omit<Tournament, 'id'>) => {
    if (!editTarget) return;
    await update({ id: editTarget.id, input });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns: ColumnDef<Tournament>[] = [
    {
      accessorKey: 'name',
      header: 'Tournament',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: 'sport', header: 'Sport' },
    { accessorKey: 'format', header: 'Format' },
    { accessorKey: 'location', header: 'Location' },
    { accessorKey: 'teamCount', header: 'Teams' },
    { accessorKey: 'startDate', header: 'Start Date' },
    { accessorKey: 'endDate', header: 'End Date' },
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
          <h2 className="text-2xl font-bold tracking-tight">Tournaments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all tournaments across sports</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Create Tournament
            </Button>
          </DialogTrigger>
          {isCreateOpen && (
            <CreateTournament
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
          <CreateTournament
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
        title="Delete Tournament"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};
