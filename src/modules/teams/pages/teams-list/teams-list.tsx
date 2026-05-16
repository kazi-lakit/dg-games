import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui-kit/button';
import { Badge } from '@/components/ui-kit/badge';
import { Dialog, DialogTrigger } from '@/components/ui-kit/dialog';
import { DataTable, ConfirmationModal } from '@/components/core';
import { Team } from '../../types/team.types';
import { CreateTeam } from '../../components/create-team/create-team';
import { useGetTeams, useInsertTeam, useUpdateTeam, useDeleteTeam } from '../../hooks/use-teams';

export const TeamsListPage = () => {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const { data, isLoading, error } = useGetTeams(page, pageSize);
  const { mutateAsync: insert, isPending: inserting } = useInsertTeam();
  const { mutateAsync: update, isPending: updating } = useUpdateTeam();
  const { mutateAsync: remove, isPending: deleting } = useDeleteTeam();

  const handleCreate = async (input: Omit<Team, 'id'>) => {
    await insert(input);
    setIsCreateOpen(false);
  };

  const handleEdit = async (input: Omit<Team, 'id'>) => {
    if (!editTarget) return;
    await update({ id: editTarget.id, input });
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns: ColumnDef<Team>[] = [
    {
      accessorKey: 'name',
      header: 'Team Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { accessorKey: 'sport', header: 'Sport' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'foundedYear', header: 'Founded' },
    { accessorKey: 'playerCount', header: 'Players' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'Active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
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
          <h2 className="text-2xl font-bold tracking-tight">Teams</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all sports teams</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              Create Team
            </Button>
          </DialogTrigger>
          {isCreateOpen && (
            <CreateTeam
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

      {/* Edit modal */}
      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        {editTarget && (
          <CreateTeam
            initialData={editTarget}
            onClose={() => setEditTarget(null)}
            onSubmit={handleEdit}
            isLoading={updating}
          />
        )}
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmationModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Team"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </div>
  );
};
