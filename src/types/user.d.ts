interface IUser {
  email: string;
  // isSandboxRunning: boolean;
  containerName: string;
  containerStatus: "pending" | "running" | "stopped";
  containerPort: string;
}
