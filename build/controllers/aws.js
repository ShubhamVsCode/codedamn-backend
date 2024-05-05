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
const client_ec2_1 = require("@aws-sdk/client-ec2");
const fs_1 = __importDefault(require("fs"));
// const { SSMClient, SendCommandCommand } = require("@aws-sdk/client-ssm");
// const ssmClient = new SSMClient({ region: "us-east-1" });
const sandbox_controller_1 = require("./sandbox.controller");
const ec2Client = new client_ec2_1.EC2Client({
    region: sandbox_controller_1.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
function spinUpWorkerInstance() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const setupFile = fs_1.default.readFileSync(__dirname + "/../utils/setup.sh", "utf8");
        try {
            // Define the instance configuration
            const instanceParams = {
                InstanceType: "t2.micro",
                MinCount: 1,
                MaxCount: 1,
                KeyName: "codedamn",
                SecurityGroupIds: ["sg-0ea0ea997f58fa774"],
                ImageId: "ami-007020fd9c84e18c7",
                UserData: Buffer.from(setupFile).toString("base64"),
                SubnetId: "subnet-08ffc70d81c2c946e",
                InstanceInitiatedShutdownBehavior: "terminate",
            };
            // Create the instance
            const runInstancesCommand = new client_ec2_1.RunInstancesCommand(instanceParams);
            const response = yield ec2Client.send(runInstancesCommand);
            const instanceId = (_a = response === null || response === void 0 ? void 0 : response.Instances) === null || _a === void 0 ? void 0 : _a[0].InstanceId;
            console.log(JSON.stringify(response, null, 2));
            console.log("EC2 instance created:", instanceId);
            if (!instanceId) {
                console.log("Instance ID not found");
                return;
            }
            // Assign the "Worker" name to the instance
            const createTagsCommand = new client_ec2_1.CreateTagsCommand({
                Resources: [instanceId],
                Tags: [{ Key: "Name", Value: "Worker" }],
            });
            yield ec2Client.send(createTagsCommand);
            return instanceId;
        }
        catch (error) {
            console.error("Error spinning up worker instance:", error);
            throw error;
        }
    });
}
spinUpWorkerInstance();
function getRunningWorkerInstances() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const describeInstancesCommand = new client_ec2_1.DescribeInstancesCommand({
                Filters: [
                    {
                        Name: "instance-state-name",
                        // Values: ["running", "pending", "stopping", "stopped"],
                        Values: ["running"],
                    },
                    {
                        Name: "tag:Name",
                        Values: ["Worker"],
                    },
                ],
            });
            const response = yield ec2Client.send(describeInstancesCommand);
            const workerInstances = (_a = response === null || response === void 0 ? void 0 : response.Reservations) === null || _a === void 0 ? void 0 : _a.flatMap((reservation) => reservation.Instances);
            return workerInstances;
        }
        catch (error) {
            console.error("Error getting worker instances:", error);
            throw error;
        }
    });
}
getRunningWorkerInstances()
    .then((instances) => {
    console.log("Worker instances:", instances);
})
    .catch((error) => {
    console.error("Error:", error);
});
// async function startDockerContainerForUser(instanceId: string) {
//   try {
//     // Run a Docker container on the instance
//     const dockerCommand = "docker run -d --name user-container nginx";
//     const sendCommandParams = {
//       InstanceIds: [instanceId],
//       DocumentName: "AWS-RunShellScript",
//       Parameters: {
//         commands: [dockerCommand],
//       },
//     };
//     const sendCommandCommand = new SendCommandCommand(sendCommandParams);
//     const response = await ssmClient.send(sendCommandCommand);
//     console.log("Docker container started:", response.Command.CommandId);
//   } catch (error) {
//     console.error("Error starting Docker container:", error);
//     throw error;
//   }
// }
