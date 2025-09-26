import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ContactForm, ContactResponse } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor() { }

  submitContact(form: ContactForm): Observable<ContactResponse> {
    // Simulate API call
    console.log('Submitting contact form:', form);

    return of({
      success: true,
      message: 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact met je op.',
      timestamp: new Date()
    }).pipe(
      delay(1000) // Simulate network delay
    );
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
