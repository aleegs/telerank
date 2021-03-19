import moment from "moment";
import { log } from "../../lib/Helpers";
import Job from "./Job";
import PopulateDatabase from "./PopulateDatabaseJob";
import RefreshEntriesTelegramInfos from "./RefreshEntriesTelegramInfos";
import { isDatabaseReady } from "../../data/Database";

let interval: NodeJS.Timeout;
const JOBS_INTERVAL_TIME = 15 * 1000; // Time between each jobsInterval() run
const JOBS: Job[] = [new PopulateDatabase(), new RefreshEntriesTelegramInfos()];

export function getRunningJobs(): string[] {
  return JOBS.filter((k) => k.isRunning).map((k) => k.name);
}

export function isAnyJobRunning(): boolean {
  return getRunningJobs().length > 0;
}

function jobsInterval() {
  if (isDatabaseReady()) {
    JOBS.forEach((q) => {
      if (!q.isRunning) {
        if (!q.concurrent) {
          if (!isAnyJobRunning()) {
            let diff = 0;
            if (q.startDate) diff = moment().diff(q.startDate, "minutes");

            if (diff <= q.runIntervalMinutes) q.run();
          }
        } else q.run(); // Ignore checks for jobs with concurrent = true
      }
    });
  }
}

export function InitializeJobs(): void {
  if (!interval) {
    log.info("Initializing Jobs");
    interval = setInterval(jobsInterval, JOBS_INTERVAL_TIME);
  } else log.error("ScraperJobsManager is already initialized!");
}

export function stopJobs() {}

export function restartJobs() {}

export function getCurrentRunningJob() {}