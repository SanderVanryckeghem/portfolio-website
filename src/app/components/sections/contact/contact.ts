import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../services/contact';

interface Field {
  id: 'name' | 'email' | 'subject';
  label: string;
  type: string;
  autocomplete: string;
}

// The message form shown on teletext page P430. Contact details themselves
// live on P420 (built from PortfolioService).
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  readonly fields: Field[] = [
    { id: 'name', label: 'Name', type: 'text', autocomplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
    { id: 'subject', label: 'Subject', type: 'text', autocomplete: 'off' },
  ];

  contactForm!: FormGroup;
  readonly isSubmitting = signal(false);
  readonly submitMessage = signal('');
  readonly submitSuccess = signal(false);
  readonly isRateLimited = signal(false);
  readonly cooldownRemaining = signal('');

  private readonly COOLDOWN_KEY = 'contact_form_cooldown';
  private readonly COOLDOWN_DURATION = 60 * 60 * 1000;
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkRateLimit();
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  showError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!field && field.touched && field.invalid;
  }

  private checkRateLimit(): void {
    let lastSubmission: string | null = null;
    try {
      lastSubmission = localStorage.getItem(this.COOLDOWN_KEY);
    } catch {
      return;
    }
    if (lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission, 10);
      if (timePassed < this.COOLDOWN_DURATION) {
        this.isRateLimited.set(true);
        this.startCooldownTimer(this.COOLDOWN_DURATION - timePassed);
      } else {
        localStorage.removeItem(this.COOLDOWN_KEY);
      }
    }
  }

  private startCooldownTimer(remainingTime: number): void {
    this.updateCooldownDisplay(remainingTime);

    this.cooldownInterval = setInterval(() => {
      remainingTime -= 1000;
      if (remainingTime <= 0) {
        this.isRateLimited.set(false);
        this.cooldownRemaining.set('');
        try {
          localStorage.removeItem(this.COOLDOWN_KEY);
        } catch {
          // Storage unavailable - nothing to clear.
        }
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
        }
      } else {
        this.updateCooldownDisplay(remainingTime);
      }
    }, 1000);
  }

  private updateCooldownDisplay(ms: number): void {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    this.cooldownRemaining.set(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }

  private setCooldown(): void {
    try {
      localStorage.setItem(this.COOLDOWN_KEY, Date.now().toString());
    } catch {
      // Storage unavailable - the cooldown still applies for this visit.
    }
    this.isRateLimited.set(true);
    this.startCooldownTimer(this.COOLDOWN_DURATION);
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.isRateLimited()) {
      this.submitSuccess.set(false);
      this.submitMessage.set(
        `Please wait ${this.cooldownRemaining()} before sending another message.`,
      );
      return;
    }

    if (this.contactForm.valid) {
      this.isSubmitting.set(true);
      this.submitMessage.set('');

      this.contactService.submitContact(this.contactForm.value).subscribe({
        next: (response) => {
          this.submitSuccess.set(response.success);
          this.submitMessage.set(response.message);
          if (response.success) {
            this.contactForm.reset();
            this.setCooldown();
          }
          this.isSubmitting.set(false);
        },
        error: () => {
          this.submitSuccess.set(false);
          this.submitMessage.set('Something went wrong. Please try again later.');
          this.isSubmitting.set(false);
        },
      });
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }

    return '';
  }
}
