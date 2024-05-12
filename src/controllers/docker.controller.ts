import Docker from "dockerode";

const docker = new Docker();

interface StartContainerParams {
  containerName: string;
  containerPort: number;
  hostPort: string;
  hostMountLocation: string;
  containerMountLocation: string;
}

export const startContainer = async (params: StartContainerParams) => {
  const {
    containerName,
    containerPort,
    hostPort,
    hostMountLocation,
    containerMountLocation,
  } = params;

  try {
    const container = await docker.createContainer({
      Image: "shubhamvscode/sandbox",
      name: containerName,
      HostConfig: {
        PortBindings: { [`${containerPort}/tcp`]: [{ HostPort: hostPort }] },
        Binds: [`${hostMountLocation}:/${containerMountLocation}`],
      },
      ExposedPorts: {
        [`${containerPort}/tcp`]: {},
      },
      Tty: true,
      Cmd: ["npm", "start"],
    });
    const containerInfo = await container.start();
    console.log("Container started:", container.id);
    return container;
  } catch (error) {
    console.error("Error while starting container:", error);
    return null;
  }
};

export const getContainers = async () => {
  const containers = await docker.listContainers();
  console.log("Containers:", JSON.stringify(containers, null, 2));
  return containers;
};

export const stopContainer = async (containerName: string) => {
  try {
    const containers = await getContainers();

    const containerInfo = containers.find(
      (container) => container.Names[0] === `/${containerName}`,
    );
    if (containerInfo) {
      const { Id: containerId } = containerInfo;
      await docker.getContainer(containerId).kill();
      await docker.pruneContainers();
      console.log("Container stopped:", containerId);
      return containerInfo;
    }

    return null;
  } catch (error) {
    console.error("Error while stopping container:", error);
    return null;
  }
};

export const getContainer = async (containerName: string) => {
  try {
    const containers = await getContainers();
    const containerInfo = containers.find(
      (container) => container.Names[0] === `/${containerName}`,
    );
    return containerInfo;
  } catch (error) {
    console.error("Error while getting container:", error);
    return null;
  }
};

// startContainer();
// getContainers();
