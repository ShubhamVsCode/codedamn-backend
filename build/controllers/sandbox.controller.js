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
exports.stopSandbox = exports.startSandbox = exports.AWS_REGION = void 0;
const zod_1 = require("zod");
const user_model_1 = __importDefault(require("../models/user.model"));
const client_ecs_1 = require("@aws-sdk/client-ecs");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    name: "CodeDamn",
};
let HOST_PORT = 4000;
exports.AWS_REGION = "ap-south-1";
const CLUSTER = "codedamn-cluster";
const TASK_DEFINITION = "codedamn-taskdefinition";
const LAUNCH_TYPE = "FARGATE";
const SUBNETS = [
    "subnet-001f6351113b38f98",
    "subnet-0d47a0db6b3821676",
    "subnet-08ffc70d81c2c946e",
];
const ecsClient = new client_ecs_1.ECSClient({
    region: exports.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const params = {
    cluster: CLUSTER,
    taskDefinition: TASK_DEFINITION,
    launchType: LAUNCH_TYPE,
    count: 1,
    networkConfiguration: {
        awsvpcConfiguration: {
            subnets: SUBNETS,
            assignPublicIp: "ENABLED",
        },
    },
};
const PORT_TO_USER = new Map();
const output = {
    $metadata: {
        httpStatusCode: 200,
        requestId: "a267108c-51fa-4286-a9af-fa1ba84262e0",
        attempts: 1,
        totalRetryDelay: 0,
    },
    failures: [],
    tasks: [
        {
            attachments: [
                {
                    details: [
                        {
                            name: "subnetId",
                            value: "subnet-001f6351113b38f98",
                        },
                    ],
                    id: "d26a0cfb-5a57-48e1-8660-706088414432",
                    status: "PRECREATED",
                    type: "ElasticNetworkInterface",
                },
            ],
            attributes: [
                {
                    name: "ecs.cpu-architecture",
                    value: "x86_64",
                },
            ],
            availabilityZone: "ap-south-1a",
            clusterArn: "arn:aws:ecs:ap-south-1:063602050575:cluster/codedamn-cluster",
            containers: [
                {
                    containerArn: "arn:aws:ecs:ap-south-1:063602050575:container/codedamn-cluster/8910678a66d84034b7821f3fa95d1570/4a0ee733-6820-4058-adeb-8b985c6ae7f9",
                    cpu: "0",
                    image: "063602050575.dkr.ecr.ap-south-1.amazonaws.com/codedamn-image",
                    lastStatus: "PENDING",
                    name: "codedamn-container",
                    networkInterfaces: [],
                    taskArn: "arn:aws:ecs:ap-south-1:063602050575:task/codedamn-cluster/8910678a66d84034b7821f3fa95d1570",
                },
            ],
            cpu: "1024",
            createdAt: "2024-04-21T14:22:13.816Z",
            desiredStatus: "RUNNING",
            enableExecuteCommand: false,
            ephemeralStorage: {
                sizeInGiB: 20,
            },
            group: "family:codedamn-taskdefinition",
            lastStatus: "PROVISIONING",
            launchType: "FARGATE",
            memory: "3072",
            overrides: {
                containerOverrides: [
                    {
                        name: "codedamn-container",
                    },
                ],
                inferenceAcceleratorOverrides: [],
            },
            platformFamily: "Linux",
            platformVersion: "1.4.0",
            tags: [],
            taskArn: "arn:aws:ecs:ap-south-1:063602050575:task/codedamn-cluster/8910678a66d84034b7821f3fa95d1570",
            taskDefinitionArn: "arn:aws:ecs:ap-south-1:063602050575:task-definition/codedamn-taskdefinition:1",
            version: 1,
        },
    ],
};
const runContainer = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        // Start the task
        const data = yield ecsClient.send(new client_ecs_1.RunTaskCommand(params));
        console.log("Task started:", data);
        // Extract task ARN from the response
        const taskArn = (_b = (_a = data === null || data === void 0 ? void 0 : data.tasks) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.taskArn;
        if (!taskArn) {
            throw new Error("Task ARN not found in ECS response");
        }
        // Poll ECS until the task is in a running state
        let taskStatus = "";
        let describeData;
        while (taskStatus !== "RUNNING") {
            const describeParams = {
                cluster: CLUSTER,
                tasks: [taskArn],
            };
            describeData = yield ecsClient.send(new client_ecs_1.DescribeTasksCommand(describeParams));
            taskStatus = ((_d = (_c = describeData === null || describeData === void 0 ? void 0 : describeData.tasks) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.lastStatus) || "";
            // Wait for a few seconds before polling again
            yield new Promise((resolve) => setTimeout(resolve, 5000));
        }
        console.log("Task is now running");
        console.log("Task details:", JSON.stringify(describeData, null, 2));
        // Return the task details or perform further actions as needed
        return describeData;
    }
    catch (err) {
        console.error("Error running container:", err);
        throw err; // Propagate the error to the caller
    }
});
const startSandbox = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const parsedEmail = zod_1.z.string().email().parse(email);
        if (!parsedEmail) {
            return res
                .status(400)
                .json({ error: "Email is required", success: false });
        }
        const user = yield user_model_1.default.findOne({ email: parsedEmail });
        if (!user) {
            return res.status(400).json({ error: "User not found", success: false });
        }
        yield runContainer();
        // if (user.isSandboxRunning) {
        //   return res
        //     .status(400)
        //     .json({ error: "Sandbox is already running", success: false });
        // }
        user.isSandboxRunning = true;
        yield user.save();
        res.status(200).json({
            message: "Container started successfully",
            port: HOST_PORT,
            success: true,
        });
    }
    catch (error) {
        console.error("Error starting container:", error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
});
exports.startSandbox = startSandbox;
const stopSandbox = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const parsedEmail = zod_1.z.string().email().parse(email);
        if (!parsedEmail) {
            return res
                .status(400)
                .json({ error: "Email is required", success: false });
        }
        const user = yield user_model_1.default.findOne({ email: parsedEmail });
        if (!user) {
            return res.status(400).json({ error: "User not found", success: false });
        }
        if (!user.isSandboxRunning) {
            return res
                .status(400)
                .json({ error: "Sandbox is not running", success: false });
        }
        user.isSandboxRunning = false;
        yield user.save();
        res
            .status(200)
            .json({ message: "Container stopped successfully", success: true });
    }
    catch (error) {
        console.error("Error stopping container:", error);
        res.status(500).json({ error: "Internal server error", success: false });
    }
});
exports.stopSandbox = stopSandbox;
