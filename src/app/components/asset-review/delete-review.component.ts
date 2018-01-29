import { Component } from '@angular/core';
import { ContentService } from '../../services/content.service';
import { dispatch, NgRedux } from '@angular-redux/store';
import { AppState } from '../../classes/app-state.interface';
import { ReviewBase } from '../../classes/review-base.class';
import { ActivatedRoute } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Asset } from '../../models/asset.model';
import { notNullOrUndefined } from '../../app.utils';
import { AssetActions } from '../../actions/asset.actions';
import { showSnackBar } from '../../utils/material.utils';
import { MatSnackBar } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowStatusEnum } from '../../enums/workflow-status.enum';
import { ArrayUtils } from '../../utils/array.utils';

@Component({
  selector: 'std-delete-review',
  templateUrl: './delete-review.component.html',
  styleUrls: ['./delete-review.component.scss']
})
export class DeleteReviewComponent extends ReviewBase {

  data;
  checked = {};

  constructor(store: NgRedux<AppState>,
              route: ActivatedRoute,
              private contentService: ContentService,
              private assetActions: AssetActions,
              private snackBar: MatSnackBar,
              private translate: TranslateService) {
    super(store, route);

    this.ids$
      .pipe(
        filter(ids => !!ids.length),
        tap(() => this.loading = true),
        switchMap(ids => this.contentService.dependants(ids, true)),
        this.untilDestroyed()
      )
      .subscribe((data) => {
        this.notifyAssetLoaded(Object.values(data.assetLookup));
        this.data = data;
        this.loading = false;
      });

  }

  @dispatch()
  notifyAssetLoaded(assets: Asset[]) {
    return this.assetActions.fetchedSome(assets);
  }

  assetChecked($event, assetId) {
    let { checked, data } = this;
    checked[assetId] = $event;
    if ($event) {
      let dependants = data.dependantIdsLookup;
      if (notNullOrUndefined(dependants[assetId])) {
        this.parentChecked($event, assetId);
      }
    } else {

      let entries = data.entries;
      let deselected = [];

      entries.forEach((entry) => {
        if (
          entry.dependantIds.includes(assetId) &&
          checked[entry.assetId]) {
          checked[entry.assetId] = false;
          deselected.push({
            parent: data.assetLookup[entry.assetId].label,
            child: data.assetLookup[assetId].label
          });
          if (assetId in data.dependantIdsLookup) {
            data.dependantIdsLookup[assetId].forEach((id) => {
              checked[id] = false;
            });
          }
        }
      });

      let message = deselected.map(desc => this.translate.instant('{{parent}} has been deselected', desc));
      message.length && message.push('You may delete children without their parent but not vise-versa.');

      showSnackBar(
        this.snackBar,
        this.translate.instant(message.join('. ')),
        this.translate.instant('Ok'));

    }
  }

  parentChecked($event, assetId) {
    this.checked[assetId] = $event;
    if ($event) {
      let dependants = this.data.dependantIdsLookup;
      dependants[assetId]
        .forEach((id) => {
          this.checked[id] = true;
        });
    }
  }

  selectAll() {
    let { data, checked } = this;
    Object.keys(data.assetLookup)
      .forEach(id => checked[id] = true);
  }

  selectNone() {
    this.checked = {};
  }

  submit() {
    let { checked, translate, data } = this;
    let ids = Object.keys(checked).filter(id => checked[id]);
    if (ids.length) {
      this.loading = true;
      this.contentService.delete(ids)
        .subscribe((result) => {

          let assets = data.assetLookup;

          ids
          // TODO: need the socket working to do this right. Other wise need to request again :(
            .forEach(id => {
              if (assets[id].workflowStatus.indexOf('EXISTING')) {
                assets[id].workflowStatus = WorkflowStatusEnum.EXISTING_DELETED;
              } else {
                assets[id].workflowStatus = WorkflowStatusEnum.NEW_DELETED;
              }
            });

          this.notifyAssetLoaded(Object.values(assets));

          showSnackBar(this.snackBar, result.message);
          this.finished = true;
          this.loading = false;

        });
    } else {
      showSnackBar(this.snackBar, translate.instant('Nothing selected'));
    }
  }

}
