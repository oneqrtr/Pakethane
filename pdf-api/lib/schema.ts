import { z } from 'zod';

const MAX_SIGNATURE_BASE64_LENGTH = 500 * 1024; // 500KB

export const contractDataSchema = z.object({
  adSoyad: z.string().max(200).optional().default(''),
  email: z.string().email(),
  tcKimlik: z.string().max(20).optional().default(''),
  cepNumarasi: z.string().max(20).optional().default(''),
  adres: z.string().max(1000).optional().default(''),
  tarih: z.string().max(50).optional().default(''),
  signaturePng: z
    .string()
    .max(MAX_SIGNATURE_BASE64_LENGTH)
    .optional()
    .nullable(),
});

export type ContractData = z.infer<typeof contractDataSchema>;

export function parseContractBody(body: unknown): ContractData {
  return contractDataSchema.parse(body);
}
