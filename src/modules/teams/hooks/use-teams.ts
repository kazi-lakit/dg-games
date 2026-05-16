import { useQueryClient } from '@tanstack/react-query';
import { useGlobalQuery, useGlobalMutation } from '@/state/query-client/hooks';
import { Team } from '../types/team.types';
import { getTeams, insertTeam, updateTeam, deleteTeam } from '../services/team.service';

const TEAMS_KEY = 'teams';

export const useGetTeams = (page: number, pageSize: number) =>
  useGlobalQuery({
    queryKey: [TEAMS_KEY, page, pageSize],
    queryFn: () => getTeams(page, pageSize),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

export const useInsertTeam = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (input: Omit<Team, 'id'>) => insertTeam(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: ({ id, input }: { id: string; input: Omit<Team, 'id'> }) => updateTeam(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useGlobalMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });
};
