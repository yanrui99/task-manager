const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    categories: {
      work: '#4285F4',      // Blue
      personal: '#34A853',  // Green
      health: '#FBBC05',    // Yellow/Orange
      education: '#9C27B0', // Purple
      finance: '#00ACC1',   // Teal
    },
    priority: {
      high: '#F44336',      // Red
      medium: '#FB8C00',    // Orange
      low: '#4CAF50',       // Green
    }
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    categories: {
      work: '#4285F4',      // Blue
      personal: '#34A853',  // Green
      health: '#FBBC05',    // Yellow/Orange
      education: '#9C27B0', // Purple
      finance: '#00ACC1',   // Teal
    },
    priority: {
      high: '#F44336',      // Red
      medium: '#FB8C00',    // Orange
      low: '#4CAF50',       // Green
    }
  },
};

export default Colors;

export function getColors(colorScheme: 'light' | 'dark' | null | undefined) {
  return Colors[colorScheme || 'light'];
}