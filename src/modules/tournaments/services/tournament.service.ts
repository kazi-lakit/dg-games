import { graphqlClient } from '@/lib/graphql-client';
import { Tournament } from '../types/tournament.types';

interface GatewayTournament extends Omit<Tournament, 'id'> {
  ItemId: string;
}

interface TournamentsResponse {
  getTournaments: { items: GatewayTournament[]; totalCount: number };
}

const toISO = (date: string) => date ? new Date(date).toISOString() : date;
const toDateInput = (iso: string) => iso ? iso.split('T')[0] : iso;

const map = (t: GatewayTournament): Tournament => ({
  ...t,
  id: t.ItemId,
  startDate: toDateInput(t.startDate),
  endDate: toDateInput(t.endDate),
});

const GET_TOURNAMENTS = `
  query GetTournaments($pageNo: Int, $pageSize: Int) {
    getTournaments(where: {}, order: [], paging: { pageNo: $pageNo, pageSize: $pageSize }) {
      items { ItemId name sport format startDate endDate status teamCount location }
      totalCount
    }
  }
`;

const INSERT_TOURNAMENT = `
  mutation InsertTournament($name: String, $sport: String, $format: String, $startDate: DateTime, $endDate: DateTime, $status: String, $teamCount: Int, $location: String) {
    insertTournament(input: { name: $name, sport: $sport, format: $format, startDate: $startDate, endDate: $endDate, status: $status, teamCount: $teamCount, location: $location }) {
      itemId
    }
  }
`;

const UPDATE_TOURNAMENT = `
  mutation UpdateTournament($itemId: String, $name: String, $sport: String, $format: String, $startDate: DateTime, $endDate: DateTime, $status: String, $teamCount: Int, $location: String) {
    updateTournament(
      where: { ItemId: { eq: $itemId } }
      input: { name: $name, sport: $sport, format: $format, startDate: $startDate, endDate: $endDate, status: $status, teamCount: $teamCount, location: $location }
    ) { itemId }
  }
`;

const DELETE_TOURNAMENT = `
  mutation DeleteTournament($itemId: String) {
    deleteTournament(where: { ItemId: { eq: $itemId } }, input: { isHardDelete: false }) { itemId }
  }
`;

export const getTournaments = async (page: number, pageSize: number) => {
  const res = await graphqlClient.query<TournamentsResponse>({
    query: GET_TOURNAMENTS,
    variables: { pageNo: page + 1, pageSize },
  });
  return { data: res.getTournaments.items.map(map), totalCount: res.getTournaments.totalCount };
};

const withISO = (input: Omit<Tournament, 'id'>) => ({
  ...input,
  startDate: toISO(input.startDate),
  endDate: toISO(input.endDate),
});

export const insertTournament = (input: Omit<Tournament, 'id'>) =>
  graphqlClient.mutate({ query: INSERT_TOURNAMENT, variables: withISO(input) });

export const updateTournament = (id: string, input: Omit<Tournament, 'id'>) =>
  graphqlClient.mutate({ query: UPDATE_TOURNAMENT, variables: { itemId: id, ...withISO(input) } });

export const deleteTournament = (id: string) =>
  graphqlClient.mutate({ query: DELETE_TOURNAMENT, variables: { itemId: id } });
