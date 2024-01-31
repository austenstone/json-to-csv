# JSON to CSV Action

This action converts a JSON string to a CSV string.

## Usage
Create a workflow (eg: `.github/workflows/csv.yml`). See [Creating a Workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

<!-- 
### PAT(Personal Access Token)

You will need to [create a PAT(Personal Access Token)](https://github.com/settings/tokens/new?scopes=admin:org) that has `admin:org` access.

Add this PAT as a secret so we can use it as input `github-token`, see [Creating encrypted secrets for a repository](https://docs.github.com/en/enterprise-cloud@latest/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository). 
### Organizations

If your organization has SAML enabled you must authorize the PAT, see [Authorizing a personal access token for use with SAML single sign-on](https://docs.github.com/en/enterprise-cloud@latest/authentication/authenticating-with-saml-single-sign-on/authorizing-a-personal-access-token-for-use-with-saml-single-sign-on).
-->
> [!NOTE]  
> The output of this action might exceed the maximum size of inputs/outputs. In that case leverage the generated artifacts.

#### Basic Usage

```yml
name: JSON to CSV
on:
  workflow_dispatch:

jobs:
  run:
    name: Run Action
    runs-on: ubuntu-latest
    steps:
      - uses: austenstone/json-to-csv@main
        id: csv
        with:
          json: '[{"name":"John","age":30,"city":"New York"},{"name":"Jane","age":25,"city":"New York"}]'
      - run: echo "${{ steps.csv.outputs.csv }}"
```
#### Output Artifact
You can output an artifact instead of a string. Use `artifact-name` to specify the name of the artifact.

```yml
    steps:
      - uses: austenstone/json-to-csv@main
        with:
          json: '[{"name":"John","age":30,"city":"New York"},{"name":"Jane","age":25,"city":"New York"}]'
          create-artifact: true
      - uses: actions/download-artifact@v4
        with:
          name: ${{ steps.export.outputs.artifact-name }}
```

#### Input Artifact
You can pass an artifact name to the action and it will use the JSON file/s in the artifact as input.

```yml
    steps:
      - uses: austenstone/json-to-csv@main
        with:
          json-artifact-name: ${{ steps.export.outputs.artifact-name }}
```

## ➡️ Inputs
Various inputs are defined in [`action.yml`](action.yml):

| Name | Description | Default |
| --- | - | - |
| json | The JSON to convert to CSV. | N/A |
| json-artifact-name | The name of the artifact to use as input instead of `json`. | N/A |
| options | A JSON string of options https://www.npmjs.com/package/json-2-csv#json2csvarray-options--string | N/A |
| create-artifact | Whether to create an artifact with the output. | false |
| artifact-name | The name of the artifact to create. | json-to-csv |

## ⬅️ Outputs
| Name | Description |
| --- | - |
| csv | The csv output. |
| artifact-name | The name of the artifact created. |


## Further help
To get more help on the Actions see [documentation](https://docs.github.com/en/actions).
