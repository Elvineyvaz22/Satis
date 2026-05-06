interface TelegramWebApp {
  ready(): void;
  expand(): void;
  colorScheme: 'light' | 'dark';
  hapticFeedback: {
    impact(style: 'light' | 'medium' | 'heavy'): void;
    notification(type: 'success' | 'warning' | 'error'): void;
  };
  locationManager?: {
    getLocation(callback: (loc: { latitude: number; longitude: number }) => void): void;
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
  QRCode?: {
    toCanvas(canvas: HTMLCanvasElement, text: string, options?: { width?: number }): Promise<void>;
    toDataURL(text: string, options?: { width?: number }): Promise<string>;
  };
}