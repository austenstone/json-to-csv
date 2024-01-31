import { DefaultArtifactClient } from "@actions/artifact";
import { setOutput, getInput, endGroup, startGroup, getBooleanInput } from "@actions/core";
import { info } from "console";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { json2csv } from "json-2-csv";

interface Input {
  token: string;
  json: object[];
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
    result.json = JSON.parse(readFileSync(jsonFiles[0], 'utf-8'));
  } else {
    result.json = JSON.parse(getInput("json"));
  }
  const options = getInput("options");
  result.options = options ? JSON.parse(getInput("options")) : undefined;
  result.createArtifact = getBooleanInput("create-artifact");
  result.createArtifactName = getInput("create-artifact-name");
  return new Promise((resolve) => resolve(result));
}

const inputs = await getInputs();
const csv = await json2csv(inputs.json, inputs.options);
setOutput("csv", csv.replace(/'/g, "\\'"));

startGroup("CSV");
info(csv);
endGroup();

if (inputs.createArtifact) {
  const artifact = new DefaultArtifactClient();
  const fileName = `${inputs.createArtifactName}.json`;
  writeFileSync(fileName, csv);
  await artifact.uploadArtifact(inputs.createArtifactName, [fileName], '.', { compressionLevel: 9 });
  info(`Artifact ${inputs.createArtifactName} created successfully`);
}
