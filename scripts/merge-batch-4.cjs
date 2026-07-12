#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const batchArg = process.argv[2] || "batch-4-programs";
const verifiedPath = path.join(__dirname, "../data/verified-programs.json");
const batchPath = path.join(__dirname, `../data/${batchArg}.json`);

const verified = JSON.parse(fs.readFileSync(verifiedPath, "utf-8"));
const batch = JSON.parse(fs.readFileSync(batchPath, "utf-8"));

if (batch.programs) verified.programs.push(...batch.programs);
if (batch.networkPrograms) verified.networkPrograms.push(...batch.networkPrograms);
verified.lastUpdated = new Date().toISOString().slice(0, 10);

fs.writeFileSync(verifiedPath, JSON.stringify(verified, null, 2) + "\n");
console.log(
  "Merged",
  batch.programs?.length || 0,
  "programs and",
  batch.networkPrograms?.length || 0,
  "network templates from",
  batchArg
);
