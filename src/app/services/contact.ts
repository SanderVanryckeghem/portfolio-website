import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ContactForm, ContactResponse } from '../models/contact.model';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly emailjsConfig = environment.emailjs;

  constructor() {
    emailjs.init(this.emailjsConfig.publicKey);
  }

  submitContact(form: ContactForm): Observable<ContactResponse> {
    const templateParams = {
      from_name: form.name,
      from_email: form.email,
      subject: form.subject,
      message: form.message
    };

    return from(
      emailjs.send(this.emailjsConfig.serviceId, this.emailjsConfig.templateId, templateParams)
    ).pipe(
      map(() => ({
        success: true,
        message: 'Thank you for your message! I will get back to you as soon as possible.',
        timestamp: new Date()
      })),
      catchError(() => {
        return of({
          success: false,
          message: 'Something went wrong. Please try again later or email me directly.',
          timestamp: new Date()
        });
      })
    );
  }
}
