import { Routes } from '@angular/router';
import { HomeComponent, AboutComponent, ServicesComponent, ContactComponent, EnrolComponent, BookVisitComponent, CustomerTicketComponent, FaqComponent } from './components';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'enrol', component: EnrolComponent },
  { path: 'book-visit', component: BookVisitComponent },
  { path: 'customer-ticket', component: CustomerTicketComponent },
  { path: 'faq', component: FaqComponent },
  { path: '**', redirectTo: '' },
];
