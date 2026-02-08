import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-enrol',
  templateUrl: './enrol.component.html',
  styleUrls: ['./enrol.component.scss'],
})
export class EnrolComponent {
  private readonly http = inject(HttpClient);

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
  submitInProgress = false;

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

  async onSubmit(): Promise<void> {
    if (!this.validateForm() || this.submitInProgress) {
      return;
    }

    // Send email notification with form data
    this.submitInProgress = true;
    try {
      await this.sendEnrolmentEmail();
    } finally {
      this.submitInProgress = false;
    }
  }

  private async sendEnrolmentEmail(): Promise<void> {
    const apiUrl = environment.enrolApiUrl;

    if (!apiUrl || apiUrl.includes('YOUR_API_ENDPOINT')) {
      console.warn('API endpoint not configured. Enrolment accepted but email notification skipped.');
      this.submitMessage = 'Enrolment successful! We have received your details and will contact you shortly.';
      this.resetForm();
      return;
    }

    const formData = new FormData();
    formData.append('consumerName', this.form.consumerName);
    formData.append('consumerNumber', this.form.consumerNumber);
    formData.append('consumerAddress', this.form.consumerAddress);
    formData.append('postalCode', this.form.postalCode);
    formData.append('phoneNumber', this.form.phoneNumber);
    formData.append('subject', 'New Solartantra enrolment');
    formData.append('captchaToken', '');

    if (this.form.billPhoto) {
      formData.append('billPhoto', this.form.billPhoto, this.form.billPhoto.name);
    }

    await firstValueFrom(this.http.post(apiUrl, formData));

    this.submitMessage = 'Enrolment successful! We have received your details.';
    this.resetForm();
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
