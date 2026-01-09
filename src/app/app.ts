import { Component, signal, computed, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('solartantra');
  protected readonly menuOpen = signal(false);
  protected readonly currentRoute = signal('/');
  protected readonly hamburgerVisible = signal(false);
  
  protected readonly isHomePage = computed(() => this.currentRoute() === '/');

  constructor(private router: Router) {
    // Track route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute.set(event.urlAfterRedirects);
        this.menuOpen.set(false);
      });

    // Show hamburger after background loads (delay matches brighten animation end: 8.4s + 5.6s = 14s)
    setTimeout(() => {
      this.hamburgerVisible.set(true);
    }, 14000);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
