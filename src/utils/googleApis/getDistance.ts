import axios from "axios";
import getSecrets from "../getSecrets";

export const getDistance = async (
  origin: string,
  destination: string
): Promise<string> => {
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(["GOOGLE_MAPS_API_KEY"]);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&units=imperial&key=${GOOGLE_MAPS_API_KEY}`;

  const { data } = await axios.get(url);
  if (data.rows[0].elements[0].status === "NOT_FOUND") {
    return "Unable to calculate distance";
  }

  return data.rows[0].elements[0].distance.text;
};
