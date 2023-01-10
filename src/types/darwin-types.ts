/**
 * NOTE: This is an INCOMPLETE declaration of the types used by the national-rail-darwin library. Only the types used by this utility are declared here.
 */

type Station = {
  readonly name: string;
  readonly crs: string;
};

type CallingPoint = {
  readonly locationName: string;
  readonly crs: string;
  readonly st: string;
  readonly et: string;
  readonly length: string;
};

type TrainService = {
  readonly std: string;
  readonly etd: string;
  readonly platform: string;
  readonly operator: string;
  readonly operatorCode: string;
  readonly length: string;
  readonly serviceId: string;
  readonly origin: Station;
  readonly destination: Station;
};

type ServiceDetails = {
  readonly std: string;
  readonly etd: string;
  readonly platform: string;
  readonly operator: string;
  readonly operatorCode: string;
  readonly length: string;
  readonly serviceId: string;
  readonly origin: Station;
  readonly destination: Station;
  readonly previousCallingPoints: CallingPoint[];
  readonly subsequentCallingPoints: CallingPoint[];
};

type DepartureBoardRequestOptions = {
  readonly rows?: number;
  readonly destination?: string;
};

type DepartureBoardResponse = {
  readonly trainServices: TrainService[];
};

type ServiceDetailsResponse = {
  readonly serviceDetails: ServiceDetails;
};

export {
  Station,
  TrainService,
  CallingPoint,
  DepartureBoardRequestOptions,
  DepartureBoardResponse,
  ServiceDetailsResponse,
};
