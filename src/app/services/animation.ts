import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register plugins in service to ensure they're available
gsap.registerPlugin(ScrollTrigger, SplitText);

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  constructor() {}

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
  animateOnScroll(element: string, animation: gsap.TweenVars): void {
    gsap.fromTo(element,
      { opacity: 0, y: 50 },
      {
        ...animation,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }

  // Stagger animations - each element animates when it enters viewport
  animateStagger(elements: string, animation: gsap.TweenVars, stagger: number = 0.1): void {
    const els = document.querySelectorAll(elements);

    els.forEach((el, index) => {
      const fromVars = animation['from'] as gsap.TweenVars | undefined;
      gsap.fromTo(el,
        { opacity: 0, y: 30, ...fromVars },
        {
          opacity: 1,
          y: 0,
          ...animation,
          delay: index * stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });
  }

  // Timeline animation - animates items from left/right when entering viewport
  animateTimeline(itemSelector: string): void {
    const items = document.querySelectorAll(itemSelector);

    items.forEach((item) => {
      const isLeft = item.classList.contains('left');

      // Set initial state immediately
      gsap.set(item, {
        opacity: 0,
        x: isLeft ? -50 : 50
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: item,
        start: 'top 95%', // Trigger earlier when element is 95% from top
        once: true,
        onEnter: () => {
          gsap.to(item, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power3.out'
          });
        }
      });
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
      button.addEventListener('mousemove', (e: MouseEvent) => {
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

  // Store SplitText instances for cleanup
  private splitTextInstances: Map<Element, SplitText> = new Map();
  private rollingTimeline: gsap.core.Timeline | null = null;

  // Initialize 3D rolling text animation (like the CodePen tube effect)
  initRollingText(containerSelector: string, lineSelector: string): void {
    const container = document.querySelector(containerSelector);
    const lines = document.querySelectorAll(lineSelector);

    if (!container || lines.length === 0) return;

    // Make container visible
    gsap.set(container, { visibility: 'visible' });

    // Split characters for all lines
    lines.forEach((line) => {
      const split = new SplitText(line, { type: 'chars', charsClass: 'rolling-char' });
      this.splitTextInstances.set(line, split);
    });

    // 3D setup - calculate depth based on font size
    const depth = -50; // Depth behind the text for cylinder effect
    const transformOrigin = `50% 50% ${depth}px`;

    // Set perspective on lines for 3D effect
    gsap.set(lines, {
      perspective: 400,
      transformStyle: 'preserve-3d'
    });

    // Set initial state - all lines start rotated back
    lines.forEach((line, index) => {
      const split = this.splitTextInstances.get(line);
      if (split) {
        gsap.set(split.chars, {
          rotationX: index === 0 ? 0 : -90,
          transformOrigin,
          backfaceVisibility: 'hidden'
        });
        // Hide non-active lines initially
        if (index !== 0) {
          gsap.set(line, { visibility: 'hidden' });
        }
      }
    });
  }

  // Animate to next rolling text
  animateRollingText(
    lineSelector: string,
    currentIndex: number,
    previousIndex: number | null
  ): void {
    const lines = document.querySelectorAll(lineSelector);
    if (lines.length === 0) return;

    const currentLine = lines[currentIndex];
    const previousLine = previousIndex !== null ? lines[previousIndex] : null;

    const currentSplit = this.splitTextInstances.get(currentLine);
    const previousSplit = previousLine ? this.splitTextInstances.get(previousLine) : null;

    if (!currentSplit) return;

    const depth = -50;
    const transformOrigin = `50% 50% ${depth}px`;
    const animDuration = 0.6;
    const staggerTime = 0.03;

    // Kill any existing timeline
    if (this.rollingTimeline) {
      this.rollingTimeline.kill();
    }

    this.rollingTimeline = gsap.timeline();

    // Animate out previous line (roll up/forward)
    if (previousSplit && previousLine) {
      this.rollingTimeline.to(previousSplit.chars, {
        rotationX: 90,
        stagger: staggerTime,
        duration: animDuration,
        ease: 'power2.in',
        transformOrigin,
        onComplete: () => {
          gsap.set(previousLine, { visibility: 'hidden' });
        }
      }, 0);
    }

    // Animate in current line (roll in from below/back)
    gsap.set(currentLine, { visibility: 'visible' });
    gsap.set(currentSplit.chars, { rotationX: -90 });

    this.rollingTimeline.to(currentSplit.chars, {
      rotationX: 0,
      stagger: staggerTime,
      duration: animDuration,
      ease: 'power2.out',
      transformOrigin
    }, previousSplit ? 0.2 : 0);
  }

  // Cleanup rolling text
  destroyRollingText(): void {
    this.splitTextInstances.forEach((split) => {
      split.revert();
    });
    this.splitTextInstances.clear();
    if (this.rollingTimeline) {
      this.rollingTimeline.kill();
      this.rollingTimeline = null;
    }
  }

  // Smooth scroll to element
  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: element.offsetTop - 80, // Account for fixed header
          autoKill: false
        },
        ease: 'power2.inOut'
      });
    }
  }
}
