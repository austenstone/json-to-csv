import { setOutput, getInput } from "@actions/core";
import { json2csv } from 'json-2-csv';

interface Input {
  token: string;
  json: any;
  options: any;
}

export function getInputs(): Input {
  const result = {} as Input;
  result.token = getInput("token");
  result.json = JSON.parse(getInput("json"));
  const options = getInput("options");
  result.options = options ? JSON.parse(getInput("options")) : undefined;
  return result;
}

const inputs = getInputs();
const csv = await json2csv(inputs.json, inputs.options);
setOutput("csv", csv);
