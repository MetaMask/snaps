import { Json, JsonRpcEngine, JsonRpcMiddleware } from 'json-rpc-engine';
import { Permission } from './Permission';

type CaveatType = string;

type CaveatImplementationFactory<
  CaveatValue extends Json,
  MethodParameters,
  MethodResult
> = (
  caveatValue: CaveatValue,
) => JsonRpcMiddleware<MethodParameters, MethodResult>;

export interface CaveatSpecification<
  CaveatValue extends Json,
  MethodParameters,
  MethodResult
> {
  type: CaveatType;
  getImplementation: CaveatImplementationFactory<
    CaveatValue,
    MethodParameters,
    MethodResult
  >;
}

export type CaveatSpecifications = Record<
  CaveatType,
  CaveatSpecification<Json, unknown, unknown>
>;

export function applyCaveats(
  caveatSpecifications: CaveatSpecifications,
  permission: Permission,
  engine: JsonRpcEngine,
): void {
  if (!permission.caveats || permission.caveats.length === 0) {
    return;
  }

  permission.caveats.forEach((caveat) => {
    if (!caveatSpecifications[caveat.type]) {
      throw new Error(`Unrecognized caveat type: ${caveat.type}`);
    }

    engine.push(
      caveatSpecifications[caveat.type].getImplementation(caveat.value),
    );
  });
}
