import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { EchoesState } from '@core/store';

// actions
import * as fromPlayerSearch from '@core/store/player-search';
import { AppPlayerApi } from '@core/api/app-player.api';

// selectors
import * as NowPlaylist from '@core/store/now-playlist';
import { AppApi } from '../../../core/api/app.api';

@Component({
  selector: 'youtube-videos',
  styleUrls: ['./youtube-videos.scss'],
  template: `
    <loader [message]="'Loading Awesome Media Results'" [loading]="loading$ | async"></loader>
    <youtube-list
      [list]="videos$ | async"
      [queued]="playlistIds$ | async"
      (play)="playSelectedVideo($event)"
      (queue)="queueSelectedVideo($event)"
      (unqueue)="removeVideoFromPlaylist($event)"
      (add)="addMediaToPlaylist($event)"
    ></youtube-list>
    <button
      *ngIf="hasNextPage$ | async"
      class="btn btn-primary load-more-btn"
      [disabled]="loading$ | async"
      (click)="searchMore()"
    >
      {{ (loading$ | async) ? 'loading...' : 'load more results...' }}
    </button>
    <p class="text-center text-muted" *ngIf="(hasResults$ | async) && !(hasNextPage$ | async) && !(loading$ | async)">
      No more results to load.
    </p>
  `
})
export class YoutubeVideosComponent implements OnInit {
  videos$ = this.store.select(fromPlayerSearch.getPlayerSearchResults);
  playlistIds$ = this.store.select(NowPlaylist.getPlaylistMediaIds);
  loading$ = this.store.select(fromPlayerSearch.getIsSearching);
  hasNextPage$ = this.store.select(fromPlayerSearch.getHasNextPage);
  hasResults$ = this.store.select(fromPlayerSearch.getHasResults);

  constructor(
    private store: Store<EchoesState>,
    private appPlayerApi: AppPlayerApi,
    private appApi: AppApi,
  ) { }

  ngOnInit() {
    this.store.dispatch(
      new fromPlayerSearch.UpdateSearchType(fromPlayerSearch.CSearchTypes.VIDEO)
    );
    this.store.dispatch(new fromPlayerSearch.SearchCurrentQuery());
  }

  playSelectedVideo(media: GoogleApiYouTubeVideoResource) {
    this.appPlayerApi.playVideo(media);
  }

  queueSelectedVideo(media: GoogleApiYouTubeVideoResource) {
    this.appPlayerApi.queueVideo(media);
  }

  removeVideoFromPlaylist(media: GoogleApiYouTubeVideoResource) {
    this.appPlayerApi.removeVideoFromPlaylist(media);
  }

  addMediaToPlaylist(media: GoogleApiYouTubeVideoResource) {
    this.appApi.toggleModal(true, media);
  }

  searchMore() {
    this.appApi.searchMore();
  }

}
