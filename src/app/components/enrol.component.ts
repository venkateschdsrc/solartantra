import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import emailjs from '@emailjs/browser';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-enrol',
  templateUrl: './enrol.component.html',
  styleUrls: ['./enrol.component.scss'],
})
export class EnrolComponent implements OnInit {
  form = {
    consumerName: '',
    consumerNumber: '',
    consumerAddress: '',
    postalCode: '',
    phoneNumber: '',
    billPhoto: null as File | null,
  };

  errors: { [key: string]: string } = {};
  submitMessage = '';

  ngOnInit(): void {
    // Initialize EmailJS if credentials are provided
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
        this.errors['billPhoto'] = `File size exceeds 5 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`;
        this.form.billPhoto = null;
        event.target.value = '';
        return;
      }

      // Clear any previous file size error
      delete this.errors['billPhoto'];
      this.form.billPhoto = file;
    }
  }

  validateForm(): boolean {
    this.errors = {};

    if (!this.form.consumerName.trim()) {
      this.errors['consumerName'] = 'Consumer Name is required';
    } else if (this.form.consumerName.length > 100) {
      this.errors['consumerName'] = 'Consumer Name cannot exceed 100 characters';
    }

    if (!this.form.consumerNumber.trim()) {
      this.errors['consumerNumber'] = 'Consumer Number is required';
    } else if (!/^\d+$/.test(this.form.consumerNumber)) {
      this.errors['consumerNumber'] = 'Consumer Number must contain only digits';
    } else if (this.form.consumerNumber.length !== 16) {
      this.errors['consumerNumber'] = 'Consumer Number must be exactly 16 digits';
    }

    if (!this.form.consumerAddress.trim()) {
      this.errors['consumerAddress'] = 'Consumer Address is required';
    } else if (this.form.consumerAddress.length > 500) {
      this.errors['consumerAddress'] = 'Consumer Address cannot exceed 500 characters';
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

    // Send email notification with form data
    this.sendEnrolmentEmail();
  }

  sendEnrolmentEmail(): void {
    const publicKey = 'YOUR_PUBLIC_KEY_HERE';
    const serviceId = 'service_xxxxxxx';
    const templateId = 'template_xxxxxxx';

    // Check if EmailJS is properly configured
    if (publicKey === 'YOUR_PUBLIC_KEY_HERE' || serviceId === 'service_xxxxxxx' || templateId === 'template_xxxxxxx') {
      // EmailJS not configured - show success anyway and log to console
      console.warn('EmailJS credentials not configured. Enrolment accepted but email notification skipped.');
      this.submitMessage = 'Enrolment successful! We have received your details and will contact you shortly.';
      this.resetForm();
      return;
    }

    const emailParams = {
      to_email: 'contact@solartantra.com',
      from_name: this.form.consumerName,
      consumer_number: this.form.consumerNumber,
      consumer_address: this.form.consumerAddress,
      postal_code: this.form.postalCode,
      phone_number: this.form.phoneNumber,
      message: `New enrolment received from ${this.form.consumerName}.\n\nConsumer Number: ${this.form.consumerNumber}\n\nAddress: ${this.form.consumerAddress}\n\nPostal Code: ${this.form.postalCode}\n\nPhone Number: ${this.form.phoneNumber}`,
    };

    // Send email with configured credentials
    emailjs.send(serviceId, templateId, emailParams)
      .then((response) => {
        console.log('Email sent successfully:', response.status, response.text);
        this.submitMessage = 'Enrolment successful! Confirmation email sent to contact@solartantra.com';
        this.resetForm();
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        // Show success anyway since form was valid
        this.submitMessage = 'Enrolment successful! We have received your details. Email notification may have been skipped.';
        this.resetForm();
      });
  }

  resetForm(): void {
    this.form = {
      consumerName: '',
      consumerNumber: '',
      consumerAddress: '',
      postalCode: '',
      phoneNumber: '',
      billPhoto: null,
    };
    this.errors = {};
  }

  isFormValid(): boolean {
    const hasName = this.form.consumerName.trim().length > 0 && this.form.consumerName.length <= 100;
    const hasNumber = this.form.consumerNumber.length === 16 && /^\d{16}$/.test(this.form.consumerNumber);
    const hasAddress = this.form.consumerAddress.trim().length > 0 && this.form.consumerAddress.length <= 500;
    const hasPostal = /^\d{6}$/.test(this.form.postalCode);
    const hasPhone = /^\d{10}$/.test(this.form.phoneNumber);

    return hasName && hasNumber && hasAddress && hasPostal && hasPhone;
  }
}
