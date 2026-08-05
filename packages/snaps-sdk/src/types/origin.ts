import type { Infer } from '@metamask/superstruct';
import { object, string } from '@metamask/superstruct';

export type OriginMetadata = Infer<typeof OriginMetadataStruct>;

export const OriginMetadataStruct = object({
  transport: string(),
  selfReportedOrigin: string(),
});
