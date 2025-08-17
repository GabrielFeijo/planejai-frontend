export function getPriorityColor(priority: string) {
	switch (priority) {
		case 'LOW':
			return 'bg-green-100 text-green-800 border-green-200';
		case 'MEDIUM':
			return 'bg-yellow-100 text-yellow-800 border-yellow-200';
		case 'HIGH':
			return 'bg-orange-100 text-orange-800 border-orange-200';
		case 'URGENT':
			return 'bg-red-100 text-red-800 border-red-200';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-200';
	}
}

export function getPriorityText(priority: string) {
	switch (priority) {
		case 'LOW':
			return 'Baixa';
		case 'MEDIUM':
			return 'Média';
		case 'HIGH':
			return 'Alta';
		case 'URGENT':
			return 'Urgente';
		default:
			return 'Nenhuma';
	}
}
