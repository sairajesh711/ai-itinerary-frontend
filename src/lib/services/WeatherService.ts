import { WeatherFormatter } from '../utils/formatters';
import type { WeatherSummary } from '../types';
import type { WeatherDisplayConfig } from '../types/ui';

export class WeatherService {
  private static instance: WeatherService;
  private config: WeatherDisplayConfig;

  private constructor() {
    this.config = {
      showIcon: true,
      showTemperature: true,
      showDescription: false,
      iconStyle: 'emoji',
      temperatureUnit: 'celsius'
    };
  }

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  updateConfig(newConfig: Partial<WeatherDisplayConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getWeatherDisplay(weather?: WeatherSummary | null): {
    icon: string;
    temperature: string;
    description: string;
    hasData: boolean;
  } {
    if (!weather) {
      return {
        icon: '',
        temperature: '',
        description: '',
        hasData: false
      };
    }

    return {
      icon: this.config.showIcon ? WeatherFormatter.getWeatherIcon(weather.summary) : '',
      temperature: this.config.showTemperature 
        ? WeatherFormatter.formatTemperature(weather.high_c, weather.low_c, this.config.temperatureUnit)
        : '',
      description: this.config.showDescription ? weather.summary || '' : '',
      hasData: true
    };
  }

  getAnimationConfig() {
    return {
      duration: 200,
      easing: 'ease-out',
      staggerDelay: 100
    };
  }

  // Method to get weather styling based on conditions
  getWeatherStyling(weather?: WeatherSummary | null): {
    iconColor: string;
    backgroundColor: string;
    textColor: string;
  } {
    if (!weather?.summary) {
      return {
        iconColor: '#fbbf24', // sunny default
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        textColor: '#92400e'
      };
    }

    const summary = weather.summary.toLowerCase();
    
    if (summary.includes('rain') || summary.includes('shower')) {
      return {
        iconColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        textColor: '#1e40af'
      };
    }
    
    if (summary.includes('cloud') || summary.includes('overcast')) {
      return {
        iconColor: '#6b7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        textColor: '#374151'
      };
    }
    
    // Default sunny styling
    return {
      iconColor: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      textColor: '#92400e'
    };
  }
}