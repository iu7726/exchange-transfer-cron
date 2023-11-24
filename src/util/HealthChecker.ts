import { logger } from "./Logger";

export class HealthChecker {
  private waitCount: number = 0;
  private intervalId: NodeJS.Timer | null = null;
  constructor(private onSignal: () => void, private readonly heartBeat: number = 60 * 1000, private readonly waitLimit: number = 2) { }

  start() {
    logger.info("[HealthChecker]", "Start Health Check");
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      logger.info("[HealthChecker]", this.waitCount, "/", this.waitLimit);
      if (this.waitCount == this.waitLimit) {
        logger.info("[HealthChecker]", "OnSignal");
        this.onSignal();
      } else if (this.waitCount < this.waitLimit) {
        this.waitCount++;
      }
    }, this.heartBeat);
  }

  clearWaitCount() {
    this.waitCount = 0;
  }
}

let instatnce: HealthChecker;

export const useHealthChecker = (onSignal: () => void, heartBeat: number = 60 * 1000, waitLimit: number = 2) => {
  if (instatnce === undefined) {
    instatnce = new HealthChecker(onSignal, heartBeat, waitLimit);
  }
  return instatnce;
};
