/**
 * Import IMD 2019 demographics data into SQLite.
 * Filters to London LSOAs only (those starting with E01 in London boroughs).
 *
 * Expected file: data/demographics/imd-2019.csv
 *
 * Run: npx tsx scripts/08-import-demographics.ts
 */
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { getScriptDb, initSchema } from "./utils/db";

const DATA_DIR = path.join(process.cwd(), "data", "demographics");

async function main() {
  const imdPath = path.join(DATA_DIR, "imd-2019.csv");

  if (!fs.existsSync(imdPath)) {
    console.error(`IMD file not found: ${imdPath}`);
    console.log("Run 07-download-demographics.ts for instructions.");
    process.exit(1);
  }

  const db = getScriptDb();
  initSchema(db);

  console.log("Parsing IMD data...");
  const raw = fs.readFileSync(imdPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  // Get London LSOAs from postcodes table if available
  const londonLsoas = new Set<string>();
  const postcodeRows = db
    .prepare("SELECT DISTINCT lsoa_code FROM postcodes WHERE lsoa_code IS NOT NULL")
    .all() as { lsoa_code: string }[];

  for (const row of postcodeRows) {
    londonLsoas.add(row.lsoa_code);
  }

  console.log(`Found ${londonLsoas.size} London LSOAs from postcodes table.`);

  const insert = db.prepare(`
    INSERT OR REPLACE INTO lsoa_demographics
      (lsoa_code, lsoa_name, imd_rank, imd_decile, income_rank, employment_rank,
       education_rank, health_rank, crime_rank, housing_rank, environment_rank,
       population, median_age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  const tx = db.transaction(() => {
    for (const r of records) {
      const lsoaCode =
        r["LSOA code (2011)"] || r["LSOAcode"] || r["FeatureCode"] || "";

      // If we have London LSOAs, filter to those. Otherwise import all.
      if (londonLsoas.size > 0 && !londonLsoas.has(lsoaCode)) continue;

      const lsoaName =
        r["LSOA name (2011)"] || r["LSOAname"] || r["FeatureName"] || "";

      insert.run(
        lsoaCode,
        lsoaName,
        parseInt(r["Index of Multiple Deprivation (IMD) Rank"] || r["IMDRank"] || "0", 10) || null,
        parseInt(r["Index of Multiple Deprivation (IMD) Decile"] || r["IMDDecile"] || "0", 10) || null,
        parseInt(r["Income Rank"] || r["IncomeRank"] || "0", 10) || null,
        parseInt(r["Employment Rank"] || r["EmploymentRank"] || "0", 10) || null,
        parseInt(r["Education, Skills and Training Rank"] || r["EducationRank"] || "0", 10) || null,
        parseInt(r["Health Deprivation and Disability Rank"] || r["HealthRank"] || "0", 10) || null,
        parseInt(r["Crime Rank"] || r["CrimeRank"] || "0", 10) || null,
        parseInt(r["Barriers to Housing and Services Rank"] || r["HousingRank"] || "0", 10) || null,
        parseInt(r["Living Environment Rank"] || r["EnvironmentRank"] || "0", 10) || null,
        parseInt(r["Total population: mid 2015 (excluding prisoners)"] || r["Population"] || "0", 10) || null,
        null // Median age not in IMD data, could be added from Census
      );

      imported++;
    }
  });

  tx();

  console.log(`\nImported ${imported} LSOA demographics records.`);
  db.close();
}

main().catch(console.error);
