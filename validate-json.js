const Ajv = require("ajv").default;
const addFormats = require("ajv-formats").default;
const fs = require("fs");
const path = require("path");

const ajv = new Ajv();
addFormats(ajv);

const schema = {
  type: "object",
  properties: {
    domains: {
      type: "array",
      items: { type: "string" },
    },
    associated_addresses: {
      type: "array",
      items: { type: "string" }
    },
    related_assets: {
      type: "array",
      items: { type: "string" }
    },
    description: {
      type: "string"
    }
  },
  required: ["domains", "associated_addresses", "related_assets", "description"],
  additionalProperties: false
};


function validateFile(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (!valid) {
    console.error(`Validation failed for ${filePath}:`, validate.errors);
    return false;
  }
  return true;
}

function main() {
  const directoryPath = path.join(__dirname, 'src/entries');
  const files = fs.readdirSync(directoryPath);
  let allValid = true;

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(directoryPath, file);
      const isValid = validateFile(filePath);
      if (!isValid) {
        allValid = false;
      }
    }
  });

  if (!allValid) {
    throw new Error("One or more JSON files do not conform to the specified schema.");
  } else {
    console.log("All JSON files in src/entries conform to the specified schema.");
  }
}

main();
