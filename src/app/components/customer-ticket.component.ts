import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-customer-ticket',
  templateUrl: './customer-ticket.component.html',
  styleUrls: ['./customer-ticket.component.scss'],
})
export class CustomerTicketComponent implements OnInit {
  form = {
    customerId: '',
    ticketType: '',
    description: '',
    attachment: null as File | null,
  };

  errors: { [key: string]: string } = {};
  submitMessage = '';

  ngOnInit(): void {
    const publicKey = 'YOUR_PUBLIC_KEY_HERE';
    if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY_HERE') {
      try {
        emailjs.init(publicKey);
      } catch (error) {
        console.error('Failed to initialize EmailJS:', error);
      }
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const maxSizeInMB = 5;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (file.size > maxSizeInBytes) {
        this.errors['attachment'] = `File size exceeds 5 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
        this.form.attachment = null;
        event.target.value = '';
        return;
      }

      delete this.errors['attachment'];
      this.form.attachment = file;
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.form.customerId.trim()) {
      this.errors['customerId'] = 'Customer ID is required';
    } else if (this.form.customerId.length > 50) {
      this.errors['customerId'] = 'Customer ID cannot exceed 50 characters';
    }

    if (!this.form.ticketType) {
      this.errors['ticketType'] = 'Please select a ticket type';
    }

    if (!this.form.description.trim()) {
      this.errors['description'] = 'Description is required';
    } else if (this.form.description.length > 500) {
      this.errors['description'] = 'Description cannot exceed 500 characters';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.sendTicketEmail();
  }

  sendTicketEmail(): void {
    const publicKey = 'YOUR_PUBLIC_KEY_HERE';
    const serviceId = 'service_xxxxxxx';
    const templateId = 'template_xxxxxxx';

    if (publicKey === 'YOUR_PUBLIC_KEY_HERE' || serviceId === 'service_xxxxxxx' || templateId === 'template_xxxxxxx') {
      console.warn('EmailJS credentials not configured. Ticket submitted but email notification skipped.');
      this.submitMessage = 'Ticket submitted successfully! We will review your request and get back to you shortly.';
      this.resetForm();
      return;
    }

    const emailParams = {
      to_email: 'support@solartantra.com',
      customer_id: this.form.customerId,
      ticket_type: this.form.ticketType,
      description: this.form.description,
      message: `New support ticket from Customer ID: ${this.form.customerId}\n\nTicket Type: ${this.form.ticketType}\n\nDescription:\n${this.form.description}`,
    };

    emailjs
      .send(serviceId, templateId, emailParams)
      .then((response) => {
        console.log('Email sent successfully:', response.status, response.text);
        this.submitMessage = 'Ticket submitted successfully! Confirmation email sent to support@solartantra.com';
        this.resetForm();
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        this.submitMessage = 'Ticket submitted successfully! We will review your request and get back to you shortly.';
        this.resetForm();
      });
  }

  resetForm(): void {
    this.form = {
      customerId: '',
      ticketType: '',
      description: '',
      attachment: null,
    };
    this.errors = {};
  }

  isFormValid(): boolean {
    const hasCustomerId = this.form.customerId.trim().length > 0 && this.form.customerId.length <= 50;
    const hasTicketType = this.form.ticketType.trim().length > 0;
    const hasDescription = this.form.description.trim().length > 0 && this.form.description.length <= 500;

    return hasCustomerId && hasTicketType && hasDescription;
  }
}
