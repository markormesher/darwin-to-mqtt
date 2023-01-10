/**
 * This file provides a Promised-wrapped version of the national-rail-darwin library.
 */

import Darwin = require("national-rail-darwin");
import { DepartureBoardRequestOptions, DepartureBoardResponse, ServiceDetailsResponse } from "./types/darwin-types";

const DARWIN_TOKEN = process.env.DARWIN_TOKEN;
const darwin = new Darwin(DARWIN_TOKEN);

async function getDepartureBoard(
  station: string,
  options: DepartureBoardRequestOptions,
): Promise<DepartureBoardResponse> {
  return new Promise((resolve, reject) => {
    darwin.getDepartureBoard(station, options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function getServiceDetails(serviceId: string): Promise<ServiceDetailsResponse> {
  return new Promise((resolve, reject) => {
    darwin.getServiceDetails(serviceId, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export { getDepartureBoard, getServiceDetails };
