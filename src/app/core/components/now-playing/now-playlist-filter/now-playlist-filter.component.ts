import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import * as NowPlaylist from '@store/now-playlist';

@Component({
  selector: 'now-playlist-filter',
  styleUrls: ['./now-playlist-filter.scss'],
  template: `
  <section class="nav-header user-playlists-filter" [class.search-focused]="isFocused || !isFilterEmpty()">
    <!-- Row 1: Playlist Header -->
    <div class="header-row">
      <span class="playlist-header" (click)="onNowPlayingClick()">
        <icon name="play-circle-o" class="play-icon text-primary"></icon>
        <span class="text btn-transparent playlist-count"
          title="Reveal now playing track">
          Now Playing <span *ngIf="!isPlaylistEmpty()">({{ playlistLength }})</span>
        </span>
      </span>
    </div>

    <!-- Row 2: Search Input & Action Buttons -->
    <div class="controls-row filter-controls">
      <div class="playlist-filter">
        <icon name="search" class="search-icon" *ngIf="isFilterEmpty()"></icon>
        <icon name="times" class="search-icon reset-icon text-danger"
          *ngIf="!isFilterEmpty()"
          (click)="resetSearchFilter()"
        ></icon>
        <input type="search" name="playlist-search"
          placeholder="Search playlists..."
          [value]="playlist?.filter || ''"
          #searchFilter
          (focus)="onFocus()"
          (blur)="onBlur()"
          (input)="handleFilterChange(searchFilter.value)">
      </div>

      <div class="action-buttons">
        <button class="action-btn btn-clear"
          title="Clear All Tracks In Now Playlist"
          [disabled]="isPlaylistEmpty()"
          (click)="clearPlaylist()">
          <icon name="trash"></icon>
        </button>
        <button class="action-btn btn-save"
          title="Save All These Tracks To A New Playlist"
          [disabled]="isPlaylistEmpty()">
          <icon name="cloud-upload-alt"></icon>
        </button>
      </div>
    </div>
  </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlaylistFilterComponent {
  @Input() playlist: NowPlaylist.INowPlaylist;
  @Output() clear = new EventEmitter();
  @Output() filter = new EventEmitter();
  @Output() reset = new EventEmitter();
  @Output() headerClick = new EventEmitter();

  isFocused = false;

  constructor() {}

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  handleFilterChange(searchFilter: string) {
    this.filter.next(searchFilter);
  }

  resetSearchFilter() {
    this.reset.next('');
  }

  isFilterEmpty() {
    return !this.playlist || !this.playlist.filter || this.playlist.filter === '';
  }

  clearPlaylist() {
    this.clear.next('');
  }

  isPlaylistEmpty() {
    return this.playlistLength === 0;
  }

  onNowPlayingClick() {
    this.headerClick.next();
  }
  get playlistLength() {
    return this.playlist && this.playlist.videos ? this.playlist.videos.length : 0;
  }
}
