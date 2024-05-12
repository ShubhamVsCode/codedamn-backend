"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainer = exports.stopContainer = exports.getContainers = exports.startContainer = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const docker = new dockerode_1.default();
const startContainer = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const { containerName, containerPort, hostPort, hostMountLocation, containerMountLocation, } = params;
    try {
        const container = yield docker.createContainer({
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
        const containerInfo = yield container.start();
        console.log("Container started:", container.id);
        return container;
    }
    catch (error) {
        console.error("Error while starting container:", error);
        return null;
    }
});
exports.startContainer = startContainer;
const getContainers = () => __awaiter(void 0, void 0, void 0, function* () {
    const containers = yield docker.listContainers();
    console.log("Containers:", JSON.stringify(containers, null, 2));
    return containers;
});
exports.getContainers = getContainers;
const stopContainer = (containerName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const containers = yield (0, exports.getContainers)();
        const containerInfo = containers.find((container) => container.Names[0] === `/${containerName}`);
        if (containerInfo) {
            const { Id: containerId } = containerInfo;
            yield docker.getContainer(containerId).kill();
            yield docker.pruneContainers();
            console.log("Container stopped:", containerId);
            return containerInfo;
        }
        return null;
    }
    catch (error) {
        console.error("Error while stopping container:", error);
        return null;
    }
});
exports.stopContainer = stopContainer;
const getContainer = (containerName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const containers = yield (0, exports.getContainers)();
        const containerInfo = containers.find((container) => container.Names[0] === `/${containerName}`);
        return containerInfo;
    }
    catch (error) {
        console.error("Error while getting container:", error);
        return null;
    }
});
exports.getContainer = getContainer;
// startContainer();
// getContainers();
