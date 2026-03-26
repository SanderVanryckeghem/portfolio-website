// Copy this file to environment.ts and environment.prod.ts
// and replace the placeholder values with your EmailJS credentials
// Get your credentials at https://www.emailjs.com/

export const environment = {
  production: false,
  emailjs: {
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID',
    publicKey: 'YOUR_PUBLIC_KEY',
  },
};
