import { graphqlClient } from '@/lib/graphql-client';
import { Team } from '../types/team.types';

interface GatewayTeam extends Omit<Team, 'id'> {
  ItemId: string;
}

interface TeamsResponse {
  getTeams: { items: GatewayTeam[]; totalCount: number };
}

interface MutationResponse {
  insertTeam?: { itemId: string };
  updateTeam?: { itemId: string };
  deleteTeam?: { itemId: string };
}

const map = (t: GatewayTeam): Team => ({ ...t, id: t.ItemId });

const GET_TEAMS = `
  query GetTeams($pageNo: Int, $pageSize: Int) {
    getTeams(where: {}, order: [], paging: { pageNo: $pageNo, pageSize: $pageSize }) {
      items { ItemId name sport city foundedYear playerCount status }
      totalCount
    }
  }
`;

const INSERT_TEAM = `
  mutation InsertTeam($name: String, $sport: String, $city: String, $foundedYear: Int, $playerCount: Int, $status: String) {
    insertTeam(input: { name: $name, sport: $sport, city: $city, foundedYear: $foundedYear, playerCount: $playerCount, status: $status }) {
      itemId
    }
  }
`;

const UPDATE_TEAM = `
  mutation UpdateTeam($itemId: String, $name: String, $sport: String, $city: String, $foundedYear: Int, $playerCount: Int, $status: String) {
    updateTeam(
      where: { ItemId: { eq: $itemId } }
      input: { name: $name, sport: $sport, city: $city, foundedYear: $foundedYear, playerCount: $playerCount, status: $status }
    ) { itemId }
  }
`;

const DELETE_TEAM = `
  mutation DeleteTeam($itemId: String) {
    deleteTeam(where: { ItemId: { eq: $itemId } }, input: { isHardDelete: false }) { itemId }
  }
`;

export const getTeams = async (page: number, pageSize: number) => {
  const res = await graphqlClient.query<TeamsResponse>({
    query: GET_TEAMS,
    variables: { pageNo: page + 1, pageSize },
  });
  return { data: res.getTeams.items.map(map), totalCount: res.getTeams.totalCount };
};

export const insertTeam = (input: Omit<Team, 'id'>) =>
  graphqlClient.mutate<MutationResponse>({ query: INSERT_TEAM, variables: input });

export const updateTeam = (id: string, input: Omit<Team, 'id'>) =>
  graphqlClient.mutate<MutationResponse>({ query: UPDATE_TEAM, variables: { itemId: id, ...input } });

export const deleteTeam = (id: string) =>
  graphqlClient.mutate<MutationResponse>({ query: DELETE_TEAM, variables: { itemId: id } });
