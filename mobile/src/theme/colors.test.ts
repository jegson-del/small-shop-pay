import { colors } from './colors';

describe('colors', () => {
  it('has SmallShopPay brand colors', () => {
    expect(colors.primary).toBe('#0A5ED7');
    expect(colors.accent).toBe('#FF8A1F');
    expect(colors.stripe).toBe('#635BFF');
  });

  it('has semantic colors', () => {
    expect(colors.success).toBe('#16A34A');
    expect(colors.error).toBe('#DC2626');
  });
});
