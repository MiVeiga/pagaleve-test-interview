import { ConsoleLogger } from "./console-logger";
import type { Logger } from "./logger";

export type { LogContext, Logger } from "./logger";

export const logger: Logger = new ConsoleLogger();
