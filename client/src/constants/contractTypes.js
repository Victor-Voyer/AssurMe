export const CONTRACT_TYPES = [
  { value: 'AUTO', label: 'Automobile' },
  { value: 'HOME', label: 'Habitation' },
  { value: 'HEALTH', label: 'Santé' },
  { value: 'LIFE', label: 'Vie' },
  { value: 'PHONE', label: 'Téléphone' },
  { value: 'OTHER', label: 'Autre' },
];

export const getContractTypeLabel = (type) =>
  CONTRACT_TYPES.find((t) => t.value === type)?.label ?? type;
