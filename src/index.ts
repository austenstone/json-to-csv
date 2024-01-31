import { setOutput, getInput, getBooleanInput } from "@actions/core";
import { json2csv } from 'json-2-csv';
import { DefaultArtifactClient } from '@actions/artifact';
import { writeFileSync } from "fs";

interface Input {
  token: string;
  json: any;
  options: any;
  createArtifact: boolean;
  artifactName: string;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.token = getInput("token");
  result.json = JSON.parse(getInput("json"));
  const options = getInput("options");
  result.options = options ? JSON.parse(getInput("options")) : undefined;
  result.createArtifact = getBooleanInput("create-artifact");
  result.artifactName = getInput("artifact-name");
  return result;
}

const inputs = getInputs();
const csv = await json2csv(inputs.json, inputs.options);
setOutput("csv", csv);
if (inputs.createArtifact) {
  const fileName = 'output.csv';
  writeFileSync(fileName, csv);
  const artifact = new DefaultArtifactClient();
  await artifact.uploadArtifact(inputs.artifactName, [fileName], '.');
}