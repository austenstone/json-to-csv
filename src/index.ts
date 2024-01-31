import { DefaultArtifactClient } from "@actions/artifact";
import { setOutput, getInput } from "@actions/core";
import { readFileSync } from "fs";
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
    const artifact = new DefaultArtifactClient()
    const artifactResponse = await artifact.getArtifact(result.jsonArtifactName);
    if (!artifactResponse) throw new Error(`Artifact ${result.jsonArtifactName} not found`);
    const { downloadPath } = await artifact.downloadArtifact(artifactResponse.artifact.id)
    if (!downloadPath) throw new Error(`Artifact ${result.jsonArtifactName} failed to download`);
    result.json = JSON.parse(readFileSync(downloadPath, "utf8"));
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
