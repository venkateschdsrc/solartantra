import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  logoLoaded = false;
  showEnrol = false;
  @ViewChild('logoImg', { static: true }) logoImg!: ElementRef<HTMLImageElement>;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    const img = this.logoImg?.nativeElement;
    if (img && img.complete && img.naturalWidth !== 0) {
      // image already loaded (from cache) — trigger handlers
      this.onLogoLoad();
    }
  }

  onLogoLoad() {
    this.logoLoaded = true;
    // reveal the Enrol button after animations complete (delay + duration = 0.6s + 6s)
    setTimeout(() => {
      this.showEnrol = true;
    }, 6600);
  }

  onLogoError() {
    // hide spinner and allow fallback styling if image fails
    this.logoLoaded = true;
    setTimeout(() => {
      this.showEnrol = true;
    }, 6600);
  }

  navigateToEnrol() {
    this.router.navigate(['/enrol']);
  }

  navigateToBookVisit() {
    this.router.navigate(['/book-visit']);
  }

  navigateToCustomerTicket() {
    this.router.navigate(['/customer-ticket']);
  }

  navigateToAbout() {
    this.router.navigate(['/about']);
  }

  navigateToFaq() {
    this.router.navigate(['/faq']);
  }
}

