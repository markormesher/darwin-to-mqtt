/**
 * NOTE: This is an INCOMPLETE declaration of the methods exposed by the national-rail-darwin library. Only the methods used by this utility are declared here.
 */

declare module "national-rail-darwin" {
  class Darwin {
    constructor(token?: string);

    getDepartureBoard(
      station: string,
      options: import("./darwin-types").DepartureBoardRequestOptions,
      callback: (error: Error, data: import("./darwin-types").DepartureBoardResponse) => unknown,
    ): void;

    getServiceDetails(
      serviceId: string,
      callback: (error: Error, data: import("./darwin-types").ServiceDetailsResponse) => unknown,
    ): void;
  }

  export = Darwin;
}
