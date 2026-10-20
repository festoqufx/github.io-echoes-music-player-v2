import { Store, createSelector } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IPlayerSearch, IQueryParams } from './player-search.reducer';
import { EchoesState } from '@store/reducers';

export const getPlayerSearch = (state: EchoesState) => state.search;
export const getPlayerSearchResults = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.results
);
export const getQuery = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.query
);
export const getQueryParams = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.queryParamsNew
);
export const getQueryParamPreset = createSelector(
  getPlayerSearch,
  getQueryParams,
  (search: IPlayerSearch, queryParams: IQueryParams) => queryParams.preset
);
export const getSearchType = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.searchType
);
export const getIsSearching = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.isSearching
);
export const getHasNextPage = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) =>
    !!(search.pageToken && search.pageToken.next && search.pageToken.next.length)
);
export const getHasResults = createSelector(
  getPlayerSearchResults,
  (results: any[]) => !!(results && results.length)
);
export const getPresets = createSelector(
  getPlayerSearch,
  (search: IPlayerSearch) => search.presets
);
