import { UserCLI } from "./UserCLI.js";

// Get .csv file from command line argument
const srcFilePath = process.argv[2];

// Check file path
if (typeof(srcFilePath) !== "string" || srcFilePath.slice(-4) !== ".csv"){
    console.error(`Error: Invalid .csv file path. Format: npm start <csv_file_path>`);
    process.exit(1);
}

// Start the CLI
UserCLI(srcFilePath);