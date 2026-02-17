// Felles fargekonfigurasjon for light og dark mode

const brand = {
  primary: '#7F8FE9',
  mint: '#77DCCA',
  cream: '#E7F183',
  lavender: '#D0C6FF',
  ink: '#0A0A0A',
};

export const Colors = {
  light: {
    text: brand.ink,
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceSoft: '#F6F5FF',
    border: 'rgba(127, 143, 233, 0.25)',

    primary: brand.primary,
    mint: brand.mint,
    cream: brand.cream,
    lavender: brand.lavender,

    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: brand.primary,
    tint: brand.primary,
  },

  dark: {
    text: '#FFFFFF',
    background: '#0F1117',
    surface: '#141622',
    surfaceSoft: '#1A1D2B',
    border: 'rgba(255,255,255,0.08)',

    primary: brand.primary,
    mint: brand.mint,
    cream: brand.cream,
    lavender: brand.lavender,

    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: brand.primary,
    tint: brand.primary,
  },
};
