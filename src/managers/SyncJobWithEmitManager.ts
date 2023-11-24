import { JobManager } from "libs-job-manager";

export class SyncJobWithEmitManager extends JobManager<any, any, any> {
  constructor(private readonly emit: (jobResult: any) => void) {
    super();
  }

  onResult(jobResult: any): void {
    this.emit(jobResult);
  }
}
