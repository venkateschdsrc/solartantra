import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import emailjs from '@emailjs/browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-book-visit',
  templateUrl: './book-visit.component.html',
  styleUrls: ['./book-visit.component.scss'],
})
export class BookVisitComponent implements OnInit {
  form = {
    fullName: '',
    address: '',
    postalCode: '',
    phoneNumber: '',
  };

  errors: { [key: string]: string } = {};
  submitMessage = '';

  ngOnInit(): void {
    const publicKey = 'YOUR_PUBLIC_KEY_HERE';
    if (publicKey && publicKey !== 'YOUR_PUBLIC_KEY_HERE') {
      try {
     //   emailjs.init(publicKey);
      } catch (error) {
        console.error('Failed to initialize EmailJS:', error);
      }
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.form.fullName.trim()) {
      this.errors['fullName'] = 'Name is required';
    } else if (this.form.fullName.length > 100) {
      this.errors['fullName'] = 'Name cannot exceed 100 characters';
    }

    if (!this.form.address.trim()) {
      this.errors['address'] = 'Address is required';
    } else if (this.form.address.length > 500) {
      this.errors['address'] = 'Address cannot exceed 500 characters';
    }

    if (!this.form.postalCode.trim()) {
      this.errors['postalCode'] = 'Postal Code is required';
    } else if (!/^\d{6}$/.test(this.form.postalCode)) {
      this.errors['postalCode'] = 'Postal Code must be exactly 6 digits';
    }

    if (!this.form.phoneNumber.trim()) {
      this.errors['phoneNumber'] = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(this.form.phoneNumber)) {
      this.errors['phoneNumber'] = 'Phone Number must be exactly 10 digits';
    }

    return Object.keys(this.errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.sendBookingEmail();
  }

  sendBookingEmail(): void {
    const publicKey = 'YOUR_PUBLIC_KEY_HERE';
    const serviceId = 'service_xxxxxxx';
    const templateId = 'template_xxxxxxx';

    if (publicKey === 'YOUR_PUBLIC_KEY_HERE' || serviceId === 'service_xxxxxxx' || templateId === 'template_xxxxxxx') {
      console.warn('EmailJS credentials not configured. Booking accepted but email notification skipped.');
      this.submitMessage = 'Request received! We will contact you shortly to schedule your site visit.';
      this.resetForm();
      return;
    }

    const emailParams = {
      to_email: 'contact@solartantra.com',
      from_name: this.form.fullName,
      visitor_name: this.form.fullName,
      visitor_address: this.form.address,
      postal_code: this.form.postalCode,
      phone_number: this.form.phoneNumber,
      message: `New site visit request from ${this.form.fullName}.\n\nAddress: ${this.form.address}\n\nPostal Code: ${this.form.postalCode}\n\nPhone Number: ${this.form.phoneNumber}`,
    };

    /* emailjs
      .send(serviceId, templateId, emailParams)
      .then((response) => {
        console.log('Email sent successfully:', response.status, response.text);
        this.submitMessage = 'Request received! Confirmation email sent to contact@solartantra.com';
        this.resetForm();
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        this.submitMessage = 'Request received! We will contact you shortly to schedule your site visit.';
        this.resetForm();
      }); */
  }

  resetForm(): void {
    this.form = {
      fullName: '',
      address: '',
      postalCode: '',
      phoneNumber: '',
    };
    this.errors = {};
  }

  isFormValid(): boolean {
    const hasName = this.form.fullName.trim().length > 0 && this.form.fullName.length <= 100;
    const hasAddress = this.form.address.trim().length > 0 && this.form.address.length <= 500;
    const hasPostal = /^\d{6}$/.test(this.form.postalCode);
    const hasPhone = /^\d{10}$/.test(this.form.phoneNumber);

    return hasName && hasAddress && hasPostal && hasPhone;
  }
}
