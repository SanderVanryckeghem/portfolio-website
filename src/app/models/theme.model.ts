export interface Theme {
  name: string;
  properties: ThemeProperties;
}

export interface ThemeProperties {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  errorColor: string;
  warningColor: string;
  successColor: string;
  infoColor: string;
}
