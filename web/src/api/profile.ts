import { api } from './client';

export type UpdateAddressInput = {
  address_line1: string;
  address_city: string;
  address_postcode: string;
  address_country: string;
};

export async function updateAddress(input: UpdateAddressInput): Promise<void> {
  await api.put('/profile/address', input);
}
