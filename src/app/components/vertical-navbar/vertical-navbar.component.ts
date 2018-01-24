import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { Settings } from '../../classes/app-state.interface';
import { dispatch, select } from '@angular-redux/store';
import { Observable } from 'rxjs/Observable';
import { ComponentBase } from '../../classes/component-base.class';
import { skip, switchMap, take, takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { SettingsActions } from '../../actions/settings.actions';
import { navBarAnimations } from '../../utils/animations.utils';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { interval } from 'rxjs/observable/interval';

const PATH_IMAGES = `${environment.url.assets}/img`;

@Component({
  selector: 'std-vertical-navbar',
  templateUrl: './vertical-navbar.component.html',
  styleUrls: ['./vertical-navbar.component.scss'],
  animations: navBarAnimations
})
export class VerticalNavBarComponent extends ComponentBase implements OnInit, AfterViewInit {

  @HostBinding('@visibility') visibility = 'expanded';
  @HostBinding('class.minimised') minimised = false;
  @HostBinding('class.reveal') reveal = false;

  @HostBinding('attr.theme') get theme() {
    return this.settings && this.settings.navBarTheme ? this.settings.navBarTheme : null;
  }

  @HostBinding('attr.hue') get hue() {
    return this.settings && this.settings.navBarThemeHue ? this.settings.navBarThemeHue : null;
  }

  @select('settings')
  settings$: Observable<Settings>;

  isMobile = false;
  settings: Settings;
  logoImage = `${PATH_IMAGES}/crafter_studio_360.png`;

  viewInitialized = false;

  constructor(private platform: Platform,
              private elementRef: ElementRef) {
    super();
    if (this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
  }

  ngOnInit() {
    this.settings$
      .pipe(takeUntil(this.unSubscriber$))
      .subscribe((settings) => {
        this.settings = settings;
        this.minimised = settings.navBarMinimised;
        this.visibility = settings.navBarShown ? 'expanded' : 'minimised';
        if (settings.navBarMinimised) {
          this.beginRevealService();
        }
      });
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.viewInitialized = true;
    });

  }

  beginRevealService() {

    let
      elem = this.elementRef.nativeElement,
      content = elem.querySelector('.content'),
      settings$ = this.settings$.pipe(skip(1)),
      interval$ = interval(200),
      mouseover$ = fromEvent(content, 'mouseover'),
      mouseout$ = fromEvent(content, 'mouseout');

    mouseover$
      .pipe(
        takeUntil(settings$),
        switchMap(
          () => interval$.pipe(
            takeUntil(mouseout$),
            take(1))))
      .subscribe(() => {
        this.reveal = true;
      });

    mouseout$
      .pipe(
        takeUntil(settings$),
        switchMap(() => interval$.pipe(
          takeUntil(mouseover$),
          take(1))))
      .subscribe(() => {
        this.reveal = false;
      });

  }

  @dispatch()
  toggleMinimised() {
    return SettingsActions.toggleSideBarFolded();
  }

}
