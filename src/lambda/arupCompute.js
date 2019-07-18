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
            type: "hidden",
          },
          {
            name: "selectedFunction",
            type: "hidden",
          },
          {
            name: "pathData",
            type: "hidden",
          },
          {
            name: "valueData",
            type: "hidden",
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
  console.log(parameters)
  return {
    statusCode: 200,
    body: JSON.stringify(parameters)
  }
}
