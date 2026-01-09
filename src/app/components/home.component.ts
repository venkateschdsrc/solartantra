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
export class HomeComponent implements AfterViewInit {
  logoLoaded = false;
  showEnrol = false;
  private bgImageLoaded = false;
  private imagesReady = false;
  @ViewChild('logoImg', { static: true }) logoImg!: ElementRef<HTMLImageElement>;

  constructor(private router: Router) {
    // Preload and decode background image before animations start
    const bgImage = new Image();
    bgImage.src = '/images/homepage.png';
    bgImage.decode()
      .then(() => {
        this.bgImageLoaded = true;
        this.checkImagesReady();
      })
      .catch(() => {
        // Fallback if decode not supported or fails
        bgImage.onload = () => {
          this.bgImageLoaded = true;
          this.checkImagesReady();
        };
      });
  }

  ngAfterViewInit(): void {
    const img = this.logoImg?.nativeElement;
    if (img) {
      if (img.complete && img.naturalWidth !== 0) {
        // Image already loaded from cache
        img.decode()
          .then(() => this.onLogoLoad())
          .catch(() => this.onLogoLoad());
      }
    }
  }

  private checkImagesReady(): void {
    if (this.bgImageLoaded && !this.imagesReady) {
      this.imagesReady = true;
      // Background is ready, animations can proceed smoothly
      document.documentElement.style.setProperty('--bg-ready', '1');
    }
  }

  onLogoLoad() {
    this.logoLoaded = true;
    this.checkImagesReady();
    // reveal the Enrol button after animations complete
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

