export function fmtTime(t?: string | null) {
	if (!t) return '';
	// t is "HH:MM:SS"
	return t.slice(0, 5);
}
export function moneyRange(m?: {
	currency: string;
	amount_min?: number | null;
	amount_max?: number | null;
}) {
	if (!m) return '';
	const c = m.currency || '';
	const low = m.amount_min ?? m.amount_max;
	const high = m.amount_max ?? m.amount_min;
	if (low == null && high == null) return c;
	if (low != null && high != null && low !== high) return `${c} ${low}–${high}`;
	return `${c} ${low ?? high}`;
}
