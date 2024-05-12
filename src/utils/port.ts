import portfinder from "portfinder";

export const getFreePort = async () => {
  const port = await portfinder.getPortPromise();
  return port.toString();
};

getFreePort();
