import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  name = '';
  email = '';
  message = '';
  success = false;

  async onSubmit(e: Event) {
    e.preventDefault();
    try {
      // stub - replace with your API endpoint
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: this.name, email: this.email, message: this.message }),
      });
      this.success = true;
      this.name = this.email = this.message = '';
    } catch (err) {
      console.error(err);
    }
  }
}
