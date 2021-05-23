export interface Alert {
  text: string;
  enabled: boolean;
  type: 'info' | 'warn' | 'error';
}
