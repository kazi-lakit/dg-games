import { graphqlClient } from '@/lib/graphql-client';
import { Match } from '../types/match.types';

interface GatewayMatch extends Omit<Match, 'id'> {
  ItemId: string;
}

interface MatchesResponse {
  getMatchs: { items: GatewayMatch[]; totalCount: number };
}

const toISO = (date: string) => date ? new Date(date).toISOString() : date;
const toDateInput = (iso: string) => iso ? iso.split('T')[0] : iso;

const map = (m: GatewayMatch): Match => ({
  ...m,
  id: m.ItemId,
  date: toDateInput(m.date),
});

const GET_MATCHES = `
  query GetMatches($pageNo: Int, $pageSize: Int) {
    getMatchs(where: {}, order: [], paging: { pageNo: $pageNo, pageSize: $pageSize }) {
      items {
        ItemId
        tournament { title tournamentId }
        homeTeam { name teamId }
        awayTeam { name teamId }
        date venue homeScore awayScore status
      }
      totalCount
    }
  }
`;

const INSERT_MATCH = `
  mutation InsertMatch(
    $tournamentTitle: String, $tournamentId: String,
    $homeTeamName: String, $homeTeamId: String,
    $awayTeamName: String, $awayTeamId: String,
    $date: DateTime, $venue: String, $homeScore: Int, $awayScore: Int, $status: String
  ) {
    insertMatch(input: {
      tournament: { title: $tournamentTitle, tournamentId: $tournamentId }
      homeTeam: { name: $homeTeamName, teamId: $homeTeamId }
      awayTeam: { name: $awayTeamName, teamId: $awayTeamId }
      date: $date venue: $venue homeScore: $homeScore awayScore: $awayScore status: $status
    }) { itemId }
  }
`;

const UPDATE_MATCH = `
  mutation UpdateMatch(
    $itemId: String,
    $tournamentTitle: String, $tournamentId: String,
    $homeTeamName: String, $homeTeamId: String,
    $awayTeamName: String, $awayTeamId: String,
    $date: DateTime, $venue: String, $homeScore: Int, $awayScore: Int, $status: String
  ) {
    updateMatch(
      where: { ItemId: { eq: $itemId } }
      input: {
        tournament: { title: $tournamentTitle, tournamentId: $tournamentId }
        homeTeam: { name: $homeTeamName, teamId: $homeTeamId }
        awayTeam: { name: $awayTeamName, teamId: $awayTeamId }
        date: $date venue: $venue homeScore: $homeScore awayScore: $awayScore status: $status
      }
    ) { itemId }
  }
`;

const DELETE_MATCH = `
  mutation DeleteMatch($itemId: String) {
    deleteMatch(where: { ItemId: { eq: $itemId } }, input: { isHardDelete: false }) { itemId }
  }
`;

const flatten = (input: Omit<Match, 'id'>) => ({
  tournamentTitle: input.tournament.title,
  tournamentId: input.tournament.tournamentId,
  homeTeamName: input.homeTeam.name,
  homeTeamId: input.homeTeam.teamId,
  awayTeamName: input.awayTeam.name,
  awayTeamId: input.awayTeam.teamId,
  date: toISO(input.date),
  venue: input.venue,
  homeScore: input.homeScore,
  awayScore: input.awayScore,
  status: input.status,
});

export const getMatches = async (page: number, pageSize: number) => {
  const res = await graphqlClient.query<MatchesResponse>({
    query: GET_MATCHES,
    variables: { pageNo: page + 1, pageSize },
  });
  return { data: res.getMatchs.items.map(map), totalCount: res.getMatchs.totalCount };
};

export const insertMatch = (input: Omit<Match, 'id'>) =>
  graphqlClient.mutate({ query: INSERT_MATCH, variables: flatten(input) });

export const updateMatch = (id: string, input: Omit<Match, 'id'>) =>
  graphqlClient.mutate({ query: UPDATE_MATCH, variables: { itemId: id, ...flatten(input) } });

export const deleteMatch = (id: string) =>
  graphqlClient.mutate({ query: DELETE_MATCH, variables: { itemId: id } });
