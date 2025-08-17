export function isOverdue(dueDate?: string) {
	if (!dueDate) return false;
	return new Date(dueDate) < new Date();
}
