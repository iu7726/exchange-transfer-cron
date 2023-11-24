import { JobManager, Mode } from "libs-job-manager";

export class AsyncJobManager extends JobManager<
  any,
  any,
  any
> {
  constructor() {
    super();
    this.setMode(Mode.Async);
  }

  onResult(jobResult: any): void {
    if (!jobResult) {
    }
  }
}
