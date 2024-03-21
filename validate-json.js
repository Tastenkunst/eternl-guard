const Ajv = require("ajv").default;
const addFormats = require("ajv-formats").default;
const fs = require("fs");
const { execSync } = require("child_process");

const ajv = new Ajv();
addFormats(ajv);

// Define or load your JSON schema here
const schema = {
  type: "object",
  properties: {
    domains: {
      type: "array",
      items: { type: "string" }
    },
    associated_addresses: {
      type: "array",
      items: { type: "string" }
    },
    related_assets: {
      type: "array",
      items: { type: "string" }
    },
    description: { type: "string" }
  },
  required: ["domains", "associated_addresses", "related_assets", "description"],
  additionalProperties: false
};

const validate = ajv.compile(schema);

// Execute a git command to find newly added JSON files in src/entries
const files = execSync("git diff --cached --name-only --diff-filter=A src/entries/*.json", { encoding: 'utf8' })
  .split('\n')
  .filter(file => file.endsWith('.json'));

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!validate(data)) {
    console.error(`Validation failed for ${file}:`, validate.errors);
    process.exit(1); // Fail the workflow if any file doesn't validate
  }
});

console.log("All new JSON files are valid.");
