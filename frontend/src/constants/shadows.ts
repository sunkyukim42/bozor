export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
  },
  elevated: {
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.10)',
  },
} as const;
