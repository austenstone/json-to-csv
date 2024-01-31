import { DefaultArtifactClient } from "@actions/artifact";
import { setOutput, getInput } from "@actions/core";
import { mkdirSync, readFileSync, readdirSync } from "fs";
import { json2csv } from "json-2-csv";

interface Input {
  token: string;
  json: object[];
  jsonArtifactName: string;
  options: object;
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
    const jsonFiles = readdirSync(downloadPath).find((file) => file.endsWith('.json'));
    if (!jsonFiles) {
      throw new Error(`No JSON files found in artifact ${result.jsonArtifactName}`);
    } else if (jsonFiles?.length > 1) {
      console.warn(`Found ${jsonFiles.length} JSON files, using the first one`);
    }
    result.json = JSON.parse(readFileSync(jsonFiles[0], 'utf-8'));
  } else {
    result.json = JSON.parse(getInput("json"));
  }
  const options = getInput("options");
  result.options = options ? JSON.parse(getInput("options")) : undefined;
  return new Promise((resolve) => resolve(result));
}

const inputs = await getInputs();
const csv = await json2csv(inputs.json, inputs.options);
setOutput("csv", csv.replace(/'/g, "\\'"));
