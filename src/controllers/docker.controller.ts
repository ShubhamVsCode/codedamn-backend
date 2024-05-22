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

  const exposedPorts = {
    [`${containerPort}/tcp`]: {},
    [`3000/tcp`]: {},
    [`5173/tcp`]: {},
  };

  try {
    const containers = await docker.listContainers({ all: true });
    const existingContainer = containers.find(
      (container) => container.Names[0] === `/${containerName}`,
    );

    if (existingContainer) {
      const container = docker.getContainer(existingContainer.Id);
      console.log(existingContainer.State);
      if (existingContainer.State !== "running") {
        await container.remove();
        console.log(
          "Removed existing stopped container:",
          existingContainer.Id,
        );
      } else {
        console.log(
          "Container with the same name is already running:",
          existingContainer.Id,
        );
        return null;
      }
    }

    const container = await docker.createContainer({
      Image: "shubhamvscode/sandbox",
      name: containerName,
      HostConfig: {
        PortBindings: {
          [`${containerPort}/tcp`]: [{ HostPort: hostPort }],
          [`3000/tcp`]: [{ HostPort: "3000" }],
          [`5173/tcp`]: [{ HostPort: "5173" }],
        },
        Binds: [`${hostMountLocation}:/${containerMountLocation}`],
      },
      ExposedPorts: exposedPorts,
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

export const getURL = (containerName: string) => {
  return `https://${containerName}.shubhamvscode.online`;
};

// startContainer();
// getContainers();
