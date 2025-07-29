import fetcher from "../fetcher";

export const downloadFile = async (id: string) => {
  await fetcher.setService("zoho");
  const { data } = await fetcher.get("/requests/" + id + "/pdf", {
    headers: {
      "Content-Type": "application/pdf",
    },
    responseType: "arraybuffer",
    responseEncoding: "binary",
  });

  return data;
};
