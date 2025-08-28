import type { WeatherSummary, MoneyEstimate } from '../types';

export class DateFormatter {
	static formatDayHeader(date: string): string {
		const d = new Date(date);
		return d.toLocaleDateString(undefined, {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		});
	}

	static formatDateShort(date: string): string {
		const d = new Date(date);
		return d.toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		});
	}

	static formatTime(time?: string | null): string | null {
		if (!time) return null;
		const [h, m] = time.split(':');
		return `${h}:${m}`;
	}

	static formatTimeRange(startTime?: string | null, endTime?: string | null): string {
		const start = this.formatTime(startTime);
		const end = this.formatTime(endTime);

		if (start && end) return `${start}–${end}`;
		if (start) return start;
		return '';
	}
}

export class WeatherFormatter {
	static getWeatherIcon(summary?: string | null): string {
		if (!summary) return '☀️';

		const s = summary.toLowerCase();
		if (s.includes('rain') || s.includes('shower')) return '🌧️';
		if (s.includes('cloud') || s.includes('overcast')) return '☁️';
		if (s.includes('sun') || s.includes('clear')) return '☀️';
		if (s.includes('snow')) return '❄️';
		if (s.includes('storm')) return '⛈️';
		if (s.includes('fog') || s.includes('mist')) return '🌫️';

		return '☀️';
	}

	static formatTemperature(
		high?: number | null,
		low?: number | null,
		unit: 'celsius' | 'fahrenheit' = 'celsius'
	): string {
		const unitSymbol = unit === 'celsius' ? '°C' : '°F';

		if (high !== null && low !== null) {
			return `${Math.round(low)}–${Math.round(high)}${unitSymbol}`;
		}
		if (high !== null) {
			return `~${Math.round(high)}${unitSymbol}`;
		}
		if (low !== null) {
			return `~${Math.round(low)}${unitSymbol}`;
		}

		return '';
	}

	static formatWeatherDescription(weather: WeatherSummary): string {
		const temp = this.formatTemperature(weather.high_c, weather.low_c);
		const icon = this.getWeatherIcon(weather.summary);

		return `${icon} ${temp}`;
	}
}

export class MoneyFormatter {
	static formatCurrency(estimate?: MoneyEstimate | null): string | null {
		if (!estimate) return null;

		const getSymbol = (currency: string): string => {
			switch (currency) {
				case 'EUR':
					return '€';
				case 'GBP':
					return '£';
				case 'USD':
					return '$';
				case 'JPY':
					return '¥';
				default:
					return `${currency} `;
			}
		};

		const round = (x?: number | null): number | null => (x == null ? null : Math.round(x));

		const min = round(estimate.amount_min);
		const max = round(estimate.amount_max);
		const symbol = getSymbol(estimate.currency);

		if (min !== null && max !== null) {
			return `${symbol}${min}–${max}`;
		}
		if (max !== null) {
			return `~${symbol}${max}`;
		}
		if (min !== null) {
			return `from ${symbol}${min}`;
		}

		return estimate.currency;
	}
}
