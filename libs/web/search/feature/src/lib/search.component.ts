import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { RouterUtil } from '@angular-spotify/web/shared/utils';
import { SearchStore } from '@angular-spotify/web/search/data-access';
import { PlayerApiService } from '@angular-spotify/web/shared/data-access/spotify-api';

@UntilDestroy()
@Component({
  selector: 'as-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [SearchStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  searchControl: FormControl = new FormControl('');
  data$ = this.store.data$;
  isLoading$ = this.store.isLoading$;

  constructor(
    private router: Router,
    private store: SearchStore,
    private playerApi: PlayerApiService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300),
        distinctUntilChanged(),
        filter((term) => term.length >= 1),
        tap((term) => {
          this.syncQueryParams(term);
          this.store.search(term);
        })
      )
      .subscribe();

    // assign query param if available
    const queryParam =
      this.activatedRoute.snapshot.queryParams[RouterUtil.Configuration.SearchQueryParam];
    if (queryParam) {
      this.searchControl.patchValue(queryParam);
    }
  }

  togglePlay(isPlaying: boolean, contextUri: string) {
    this.playerApi.togglePlay(isPlaying, { context_uri: contextUri }).subscribe();
  }

  private syncQueryParams(term: string) {
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute,
      queryParams: { [RouterUtil.Configuration.SearchQueryParam]: term },
      replaceUrl: true
    });
  }
}
