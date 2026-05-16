import { useQueryClient } from '@tanstack/react-query';
import { useGlobalQuery, useGlobalMutation } from '@/state/query-client/hooks';
import { Tournament } from '../types/tournament.types';
import { getTournaments, insertTournament, updateTournament, deleteTournament } from '../services/tournament.service';

const TOURNAMENTS_KEY = 'tournaments';

export const useGetTournaments = (page: number, pageSize: number) =>
  useGlobalQuery({
    queryKey: [TOURNAMENTS_KEY, page, pageSize],
    queryFn: () => getTournaments(page, pageSize),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useInsertTournament = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (input: Omit<Tournament, 'id'>) => insertTournament(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] }),
  });
};

export const useUpdateTournament = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<Tournament, 'id'> }) =>
      updateTournament(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] }),
  });
};

export const useDeleteTournament = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TOURNAMENTS_KEY] }),
  });
};
