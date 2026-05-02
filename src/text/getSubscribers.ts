import mongoose from "mongoose";

import { Region } from "./types";

const Phone = mongoose.model("Phone");

export const getAllSubscribers = async (options?: {
  image: boolean;
}): Promise<Record<Region, string[]>> => {
  const regions: Record<Region, string[]> = {
    WEST_OAKLAND: [],
    EAST_OAKLAND: [],
    BERKELEY: [],
    RESOURCES: [],
  };
  let usedNumbers: string[] = [];

  const regionOrder: Region[] = ["WEST_OAKLAND", "EAST_OAKLAND", "BERKELEY"];
  regionOrder.forEach(async (region) => {
    const numbers = await getRegionSubscribers(region, options);

    if (numbers[region]) {
      regions[region] = numbers[region];
      usedNumbers = usedNumbers.concat(regions[region]);
    }
  });

  return regions;
};

export async function getRegionSubscribers<T extends Region | "ALL">(
  region: T,
  options?: {
    image: boolean;
  },
): Promise<Partial<Record<Region, string[]>>> {
  if (region === "ALL") {
    return await getAllSubscribers(options);
  }

  const query = !options
    ? {}
    : options.image
      ? { $or: [{ noImg: false }, { noImg: undefined }, { noImg: null }] }
      : { noImg: true };
  const numbers = await Phone.find({ region, ...query });
  const formattedNumbers = numbers.map((p) => p.number);
  const regionNumbers = { [region]: formattedNumbers };

  return regionNumbers;
}

export const getSubscribers = async (region: Region | "ALL") => {
  return {
    imgNumbersByRegion: await getRegionSubscribers(region, { image: true }),
    noImgNumbersByRegion: await getRegionSubscribers(region, { image: false }),
  };
};
