import axios from "axios";
import getSecrets from "../../getSecrets";

export const getDirections = async (origin: string, destination: string) => {
  const { GOOGLE_MAPS_API_KEY } = await getSecrets(["GOOGLE_MAPS_API_KEY"]);

  console.log(origin);
  console.log(destination);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin
  )}&destinations=${encodeURIComponent(
    destination
  )}&units=imperial&key=${GOOGLE_MAPS_API_KEY}`;

  const { data } = await axios.get(url);

  return data.rows[0].elements[0].distance.text;
};
