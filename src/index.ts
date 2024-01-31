import { DefaultArtifactClient } from "@actions/artifact";
import { setOutput, getInput, getBooleanInput } from "@actions/core";
import { info } from "console";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { json2csv } from "json-2-csv";

interface Input {
  token: string;
  json: object[][];
  _jsonFileNames: string[];
  jsonArtifactName: string;
  options: object;
  createArtifact: boolean;
  createArtifactName: string;
}

const getInputs = async (): Promise<Input> => {
  const result = {} as Input;
  result.token = getInput("token");
  result.jsonArtifactName = getInput("json-artifact-name");
  if (result.jsonArtifactName) {
    const tmpPath = '.json-to-csv';
    const artifact = new DefaultArtifactClient()
    const artifactResponse = await artifact.getArtifact(result.jsonArtifactName);
    mkdirSync(tmpPath, { recursive: true });
    const { downloadPath } = await artifact.downloadArtifact(artifactResponse.artifact.id, {
      path: tmpPath
    });
    if (!downloadPath) throw new Error(`Artifact ${result.jsonArtifactName} not found`);
    console.log(`Artifact ${result.jsonArtifactName} downloaded to ${downloadPath}`);
    const jsonFiles = readdirSync(downloadPath).filter((file) => file.endsWith('.json'));
    if (!jsonFiles) {
      throw new Error(`No JSON files found in artifact ${result.jsonArtifactName}`);
    } else if (jsonFiles?.length > 1) {
      console.warn(`Found ${jsonFiles.length} JSON files, using the first one. Files: ${jsonFiles.join(', ')}`);
    }
    result.json = jsonFiles.map((file) => JSON.parse(readFileSync(file, 'utf-8')))
    result._jsonFileNames = jsonFiles;
  } else {
    result.json = [JSON.parse(getInput("json"))];
  }
  const options = getInput("options");
  result.options = options ? JSON.parse(getInput("options")) : undefined;
  result.createArtifact = getBooleanInput("create-artifact");
  result.createArtifactName = getInput("artifact-name");
  return new Promise((resolve) => resolve(result));
}

const inputs = await getInputs();
inputs.json.forEach((json, index) => {
  const csv = json2csv(json, inputs.options);
  setOutput(index === 0 ? 'csv' : `csv-${index}`, csv.replace(/'/g, "\\'"));
});
const csvs = inputs.json
.map((json) => json2csv(json, inputs.options))
.map((csv) => csv.replace(/'/g, "\\'"));
csvs.forEach((csv, index) => {
  setOutput(index === 0 ? 'csv' : `csv-${index}`, csv);
});

if (inputs.createArtifact) {
  const artifact = new DefaultArtifactClient();
  const csvFiles = inputs._jsonFileNames.map((file) => file.replace('.json', '.csv'));
  csvs.forEach((csv, index) => writeFileSync(csvFiles[index], csv));
  await artifact.uploadArtifact(inputs.createArtifactName, csvFiles, '.', { compressionLevel: 9 });
  setOutput('artifact-name', inputs.createArtifactName);
  info(`Artifact ${inputs.createArtifactName} created successfully`);
}
