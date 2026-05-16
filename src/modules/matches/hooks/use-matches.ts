import { useQueryClient } from '@tanstack/react-query';
import { useGlobalQuery, useGlobalMutation } from '@/state/query-client/hooks';
import { Match } from '../types/match.types';
import { getMatches, insertMatch, updateMatch, deleteMatch } from '../services/match.service';

const MATCHES_KEY = 'matches';

export const useGetMatches = (page: number, pageSize: number) =>
  useGlobalQuery({
    queryKey: [MATCHES_KEY, page, pageSize],
    queryFn: () => getMatches(page, pageSize),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useInsertMatch = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (input: Omit<Match, 'id'>) => insertMatch(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MATCHES_KEY] }),
  });
};

export const useUpdateMatch = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<Match, 'id'> }) => updateMatch(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MATCHES_KEY] }),
  });
};

export const useDeleteMatch = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [MATCHES_KEY] }),
  });
};
