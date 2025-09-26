import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  constructor() {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);
  }

  // Hero animations
  animateHero(): void {
    const tl = gsap.timeline();

    tl.fromTo('.hero-title',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
      .fromTo('.hero-subtitle',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-buttons',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
      );
  }

  // Scroll animations
  animateOnScroll(element: string, animation: any): void {
    gsap.to(element, {
      ...animation,
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Stagger animations
  animateStagger(elements: string, animation: any, stagger: number = 0.1): void {
    gsap.to(elements, {
      ...animation,
      stagger: stagger,
      scrollTrigger: {
        trigger: elements,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });
  }

  // Parallax effect
  createParallax(element: string, speed: number = 0.5): void {
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  // Mouse follow animation
  mouseFollow(element: string, speed: number = 0.5): void {
    const el = document.querySelector(element);
    if (!el) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20 * speed;
      const y = (e.clientY / window.innerHeight - 0.5) * 20 * speed;

      gsap.to(element, {
        x: x,
        y: y,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  }

  // Magnetic button effect
  magneticButton(selector: string): void {
    const buttons = document.querySelectorAll(selector);

    buttons.forEach(button => {
      button.addEventListener('mousemove', (e: any) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(button, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3
        });
      });

      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          x: 0,
          y: 0,
          duration: 0.3
        });
      });
    });
  }

  // Confetti animation
  createConfetti(): void {
    const colors = ['#667eea', '#764ba2', '#00d4ff', '#ff006e'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.position = 'fixed';
        confetti.style.left = '50%';
        confetti.style.top = '50%';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.zIndex = '9999';
        document.body.appendChild(confetti);

        gsap.to(confetti, {
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 600,
          rotation: Math.random() * 720,
          duration: 2,
          ease: 'power2.out',
          opacity: 0,
          onComplete: () => confetti.remove()
        });
      }, i * 10);
    }
  }

  // Smooth scroll to element
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: element,
          offsetY: 80 // Account for fixed header
        },
        ease: 'power2.inOut'
      });
    }
  }
}
