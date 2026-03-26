# Portfolio Website

A modern, animated portfolio website built with Angular 20, showcasing projects, skills, work experience, and certifications.

## Features

- **Responsive Design** - Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dark/Light Theme** - Toggle between dark and light themes with multiple color schemes
- **Animated UI** - Smooth animations powered by GSAP with ScrollTrigger and SplitText
- **Particle Background** - Interactive particle animation in the hero section
- **Project Showcase** - Filterable project gallery with detailed modal views
- **Work Experience Timeline** - Visual timeline of professional experience
- **Skills Display** - Technology proficiency overview with categories
- **Certificates Section** - Display of professional certifications
- **Contact Form** - Integrated contact form with EmailJS
- **Dynamic CV Generator** - Generate and download a professional PDF CV with:
  - Automatic data population from portfolio content
  - Dynamic color scheme matching the active website theme
  - Sections for skills, experience, education, projects, and certificates
  - Professional layout with proper formatting

## Technologies

- **Framework**: Angular 20 (Standalone Components, Signals)
- **Styling**: SCSS with CSS Custom Properties
- **Animations**: GSAP (ScrollTrigger, SplitText)
- **PDF Generation**: jsPDF with jspdf-autotable
- **Email**: EmailJS
- **Icons**: Font Awesome

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/SanderVanryckeghem/portfolio-website.git

# Navigate to the project directory
cd portfolio-website

# Install dependencies
npm install
```

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload on file changes.

### Build

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── sections/          # Page sections (hero, projects, experience, etc.)
│   │   └── shared/            # Reusable components (navbar, project-modal, etc.)
│   ├── models/                # TypeScript interfaces
│   ├── services/              # Angular services
│   │   ├── portfolio.ts       # Portfolio data service
│   │   ├── cv-generator.ts    # PDF CV generation service
│   │   ├── animation.ts       # GSAP animation service
│   │   ├── theme.ts           # Theme management service
│   │   └── contact.ts         # Contact form service
│   └── styles/                # Global styles and variables
└── assets/                    # Static assets (images, fonts)
```

## Customization

### Portfolio Data

All portfolio data (projects, experience, education, skills, certificates) is managed in `src/app/services/portfolio.ts`.

### Theme Colors

Color schemes are defined in `src/app/styles/_variables.scss`. The CV generator automatically uses the active color scheme.

## License

This project is open source and available under the MIT License.
