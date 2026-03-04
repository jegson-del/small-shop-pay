/**
 * SmallShopPay design tokens – matches web design-tokens.css
 */
export const colors = {
  primary: '#0A5ED7',
  primaryHover: '#0949b8',
  accent: '#FF8A1F',
  stripe: '#635BFF',
  background: '#FFFFFF',
  surface: '#F4F6FA',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#16A34A',
  error: '#DC2626',
  pending: '#F59E0B',
} as const;

export type Colors = typeof colors;
