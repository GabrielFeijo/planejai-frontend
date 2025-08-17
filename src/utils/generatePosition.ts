export function generatePosition(
	beforePosition?: number,
	afterPosition?: number
): number {
	if (!beforePosition && !afterPosition) {
		return 1000;
	}

	if (!beforePosition) {
		return afterPosition! / 2;
	}

	if (!afterPosition) {
		return beforePosition + 1000;
	}

	return (beforePosition + afterPosition) / 2;
}
