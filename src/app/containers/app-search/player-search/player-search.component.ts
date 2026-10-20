import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

const defaultSearchParams = {
  hd: false,
  duration: false
};

@Component({
  selector: 'player-search',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./player-search.scss'],
  template: `
    <form class="navbar-form form-search is-flex-row"
      [formGroup]="searchForm"
      (ngSubmit)="onSearch()"
      >
      <input placeholder="Find My Echoes..."
        ngxTypeahead
        [taUrl]="'//suggestqueries.google.com/complete/search'"
        [taParams]="params"
        [taAllowEmpty]="true"
        (taSelected)="handleSelectSuggestion($event)"
        type="search" class="form-control" autocomplete="off"
        spellcheck="false"
        aria-label="Search videos or playlists"
        formControlName="query"
        >
      <button type="button" class="btn btn-transparent btn-clear-search" title="Clear search" *ngIf="searchForm.value.query" (click)="clearSearch()">
        <icon name="times"></icon>
      </button>
      <button type="submit" class="btn btn-transparent btn-submit is-flex-row is-flex-valign" title="Search with Echoes">
        <icon name="search"></icon>
      </button>
    </form>
      <button class="btn btn-filter btn-transparent is-flex-row is-flex-valign">
        <icon name="filter" [ngClass]="{'text-primary': filtersForm.value.duration || filtersForm.value.hd }"></icon>
        <form class="filters is-rounded" [formGroup]="filtersForm">
          <div class="filter">
            <input id="long" type="checkbox" class="form-control" formControlName="duration">
            <label for="long" class="filter-label">Long</label>
          </div>
          <div class="filter">
            <input id="hd" type="checkbox" class="form-control" formControlName="hd">
            <label for="hd" class="filter-label">HD</label>
          </div>
          <icon name="trash" *ngIf="filtersForm.value.duration || filtersForm.value.hd" (click)="clearFilters()"></icon>
        </form>
      </button>
      `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerSearchComponent implements OnChanges, OnDestroy {
  @Input() query;
  @Input() searchParams = { ...defaultSearchParams };
  @Output() queryChange = new EventEmitter<string>();
  @Output() paramsChange = new EventEmitter<ISearchFormParams>();
  @Output() search = new EventEmitter();

  searchForm: FormGroup;
  filtersForm: FormGroup;
  formState: Subscription;
  filtersChanged: Subscription;

  params = {
    hl: 'en',
    ds: 'yt',
    xhr: 't',
    client: 'youtube'
  };

  constructor(private fb: FormBuilder) {
    this.searchForm = fb.group({
      query: this.query
    });
    this.filtersForm = fb.group({
      ...this.searchParams
    });

    this.formState = this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        map(formState => ((formState && formState.query) || '').trim()),
        distinctUntilChanged()
      )
      .subscribe((query: string) => this.onQueryChange(query));
    this.filtersChanged = this.filtersForm.valueChanges.subscribe(state => {
      this.paramsChange.emit(state);
    });
  }

  ngOnChanges({ query, searchParams }: SimpleChanges) {
    if (
      query &&
      query.currentValue &&
      query.currentValue.hasOwnProperty('length')
    ) {
      this.patchFormGroup(this.searchForm, { query: query.currentValue });
    }

    if (searchParams && searchParams.currentValue) {
      const { videoDuration, videoDefinition } = searchParams.currentValue;
      const values = {
        duration: videoDuration === 'long',
        hd: videoDefinition === 'high'
      };
      this.patchFormGroup(this.filtersForm, values);
    }
  }

  ngOnDestroy() {
    this.formState.unsubscribe();
    this.filtersChanged.unsubscribe();
  }

  patchFormGroup(form: FormGroup, values: { [key: string]: any }) {
    form.patchValue(values, { emitEvent: false });
  }

  onQueryChange(query: string) {
    this.queryChange.emit(query);
  }

  clearSearch() {
    this.searchForm.patchValue({ query: '' });
    this.onQueryChange('');
  }

  onSearch() {
    this.selectSuggestion(this.searchForm.value.query);
  }

  handleSelectSuggestion(suggestion: string) {
    this.selectSuggestion(suggestion);
  }

  selectSuggestion(suggestion: string) {
    if (typeof suggestion !== 'string') {
      return;
    }
    const query = suggestion.trim();
    if (query) {
      this.search.emit(query);
    }
  }

  clearFilters() {
    this.patchFormGroup(this.filtersForm, { ...defaultSearchParams });
    this.paramsChange.emit({ ...defaultSearchParams });
  }
}

export interface ISearchFormParams {
  duration: boolean;
  hd: boolean;
}
