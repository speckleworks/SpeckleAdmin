exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "ArupCompute",
        description: "Perform calculations on ArupCompute",
        icon: "person",
        allowBucketing: true,
        customComponent: true,
        parameters : [
          {
            name: "selectedLibrary",
            type: "object",
          },
          {
            name: "selectedFunction",
            type: "object",
          },
          {
            name: "pathData",
            type: "objectarray",
            headers: ["name", "path"]
          },
          {
            name: "valueData",
            type: "objectarray",
            headers: ["name", "value"]
          },
          {
            name: "outputPath",
            type: "objectarray",
            headers: ["name", "path"]
          }
        ],
      }),
    }
  }
  
  const {
    baseUrl,
    token,
    input,
    parameters,
  } = JSON.parse(event.body)
  console.log(parameters.pathData)
  console.log(parameters.valueData)
  return {
    statusCode: 200,
    body: JSON.stringify(parameters)
  }
}
