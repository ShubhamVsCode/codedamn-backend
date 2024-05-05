import {
  EC2Client,
  RunInstancesCommand,
  CreateTagsCommand,
  RunInstancesCommandInput,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import fs from "fs";
// const { SSMClient, SendCommandCommand } = require("@aws-sdk/client-ssm");

// const ssmClient = new SSMClient({ region: "us-east-1" });

import { AWS_REGION } from "./sandbox.controller";

const ec2Client = new EC2Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function spinUpWorkerInstance() {
  const setupFile = fs.readFileSync(__dirname + "/../utils/setup.sh", "utf8");

  try {
    // Define the instance configuration
    const instanceParams: RunInstancesCommandInput = {
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
    const runInstancesCommand = new RunInstancesCommand(instanceParams);
    const response = await ec2Client.send(runInstancesCommand);
    const instanceId = response?.Instances?.[0].InstanceId;
    console.log(JSON.stringify(response, null, 2));
    console.log("EC2 instance created:", instanceId);

    if (!instanceId) {
      console.log("Instance ID not found");
      return;
    }

    // Assign the "Worker" name to the instance
    const createTagsCommand = new CreateTagsCommand({
      Resources: [instanceId],
      Tags: [{ Key: "Name", Value: "Worker" }],
    });
    await ec2Client.send(createTagsCommand);

    return instanceId;
  } catch (error) {
    console.error("Error spinning up worker instance:", error);
    throw error;
  }
}

spinUpWorkerInstance();

async function getRunningWorkerInstances() {
  try {
    const describeInstancesCommand = new DescribeInstancesCommand({
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

    const response = await ec2Client.send(describeInstancesCommand);
    const workerInstances = response?.Reservations?.flatMap(
      (reservation) => reservation.Instances,
    );

    return workerInstances;
  } catch (error) {
    console.error("Error getting worker instances:", error);
    throw error;
  }
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
