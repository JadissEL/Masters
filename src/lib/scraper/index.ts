/**
 * Scraper entry point — delegates to Phase X enrichment pipeline.
 * Extend this module to add automated web scraping for programme verification.
 */
import { execSync } from "child_process";
import path from "path";

function main() {
  const script = path.join(process.cwd(), "scripts", "phase-x-pipeline.cjs");
  console.log("Running Phase X data enrichment pipeline...");
  execSync(`node "${script}"`, { stdio: "inherit" });
}

main();
