import { object, string } from '@metamask/superstruct';

export type OriginMetadata = {
  transport: string;
  selfReportedOrigin: string;
};

export const OriginMetadataStruct = object({
  transport: string(),
  selfReportedOrigin: string(),
});
