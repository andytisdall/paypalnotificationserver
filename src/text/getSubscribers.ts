import mongoose from "mongoose";

import { Region } from "./types";

const Phone = mongoose.model("Phone");

export const getAllSubscribers = async (): Promise<
  Record<Region, string[]>
> => {
  const regions: Record<Region, string[]> = {
    WEST_OAKLAND: [],
    EAST_OAKLAND: [],
    BERKELEY: [],
    RESOURCES: [],
  };
  let usedNumbers: string[] = [];

  const regionOrder: Region[] = [
    "WEST_OAKLAND",
    "EAST_OAKLAND",
    "BERKELEY",
    "RESOURCES",
  ];

  for (let region of regionOrder) {
    const numbers = await getRegionSubscribers(region);

    if (numbers[region]) {
      regions[region] = numbers[region].filter(
        (num) => !usedNumbers.includes(num),
      );
      usedNumbers = usedNumbers.concat(regions[region]);
    }
  }

  return regions;
};

export async function getRegionSubscribers<T extends Region | "ALL">(
  region: T,
): Promise<Partial<Record<Region, string[]>>> {
  if (region === "ALL") {
    return await getAllSubscribers();
  }

  const numbers = await Phone.find({ region });
  const formattedNumbers = numbers.map((p) => p.number);
  const regionNumbers = { [region]: formattedNumbers };

  return regionNumbers;
}
