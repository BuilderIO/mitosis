import { MOCK_DATA } from './MOCK_DATA';

export const mockApi = async (query: string) => {
  return MOCK_DATA.filter((data) => {
    return data.name.toLowerCase().includes(query.toLowerCase());
  });
};
