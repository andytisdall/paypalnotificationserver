import express from "express";
import twilio, { twiml } from "twilio";

import {
  getImages,
  routeTextToResponse,
} from "../responses/processIncomingText";

const router = express.Router();

router.post(
  "/incoming",
  twilio.webhook({ protocol: "https" }),
  async (req, res) => {
    const response = new twiml.MessagingResponse();

    const images = getImages(req.body);

    const responseMessage = await routeTextToResponse(
      req.body,
      images,
      "ALERT",
    );
    if (!responseMessage) {
      return res.sendStatus(200);
    }

    response.message(responseMessage);

    res.set("Content-Type", "text/xml");
    return res.send(response.toString());
  },
);

// send general info if you're not on the list
// feedback if you are on the list

export default router;
