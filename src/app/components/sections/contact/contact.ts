import { Component, OnInit, AfterViewInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../services/contact';
import { AnimationService } from '../../../services/animation';
import { PortfolioService } from '../../../services/portfolio';
import { Developer } from '../../../models/developer.model';
import { SocialLinksComponent } from '../../shared/social-links/social-links';

interface ContactInfo {
  icon: string;
  label: string;
  value: string;
  link: string | null;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, SocialLinksComponent],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  private readonly animationService = inject(AnimationService);
  private readonly portfolioService = inject(PortfolioService);

  contactForm!: FormGroup;
  developer: Developer | null = null;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;
  isRateLimited = false;
  cooldownRemaining = '';

  private readonly COOLDOWN_KEY = 'contact_form_cooldown';
  private readonly COOLDOWN_DURATION = 60 * 60 * 1000;
  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  contactInfo: ContactInfo[] = [
    {
      icon: 'fas fa-envelope',
      label: 'Email',
      value: 'sandervanryckeghem@outlook.com',
      link: 'mailto:sandervanryckeghem@outlook.com'
    },
    {
      icon: 'fas fa-phone',
      label: 'Phone',
      value: '+32 499 47 03 43',
      link: 'tel:+32499470343'
    },
    {
      icon: 'fas fa-map-marker-alt',
      label: 'Location',
      value: 'Deinze, Belgium',
      link: null
    }
  ];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.portfolioService.getDeveloper().subscribe(dev => {
      this.developer = dev;
      if (dev.email) {
        this.contactInfo[0].value = dev.email;
        this.contactInfo[0].link = `mailto:${dev.email}`;
      }
      if (dev.location) {
        this.contactInfo[2].value = dev.location;
      }
    });

    // Check if user is rate limited
    this.checkRateLimit();
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  private checkRateLimit(): void {
    const lastSubmission = localStorage.getItem(this.COOLDOWN_KEY);
    if (lastSubmission) {
      const timePassed = Date.now() - parseInt(lastSubmission, 10);
      if (timePassed < this.COOLDOWN_DURATION) {
        this.isRateLimited = true;
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
        this.isRateLimited = false;
        this.cooldownRemaining = '';
        localStorage.removeItem(this.COOLDOWN_KEY);
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
    this.cooldownRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private setCooldown(): void {
    localStorage.setItem(this.COOLDOWN_KEY, Date.now().toString());
    this.isRateLimited = true;
    this.startCooldownTimer(this.COOLDOWN_DURATION);
  }

  ngAfterViewInit(): void {
    this.animationService.animateOnScroll('.contact-form', {
      opacity: 1,
      x: 0,
      duration: 1
    });

    this.animationService.animateOnScroll('.contact-info', {
      opacity: 1,
      x: 0,
      duration: 1
    });

    this.animationService.animateStagger('.info-card', {
      opacity: 1,
      y: 0,
      duration: 0.6
    }, 0.1);
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.isRateLimited) {
      this.submitSuccess = false;
      this.submitMessage = `Please wait ${this.cooldownRemaining} before sending another message.`;
      return;
    }

    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      this.contactService.submitContact(this.contactForm.value).subscribe({
        next: (response) => {
          this.submitSuccess = response.success;
          this.submitMessage = response.message;
          if (response.success) {
            this.contactForm.reset();
            this.animationService.createConfetti();
            this.setCooldown();
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.submitSuccess = false;
          this.submitMessage = 'Something went wrong. Please try again later.';
          this.isSubmitting = false;
        }
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
