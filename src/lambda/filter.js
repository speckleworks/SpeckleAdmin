import get from 'lodash.get'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Filter",
        parameters : [
          {
            name: "path",
            type: "string",
          },
          {
            name: "criteria",
            type: "string",
          },
          {
            name: "exactMatch",
            type: "boolean",
          },
        ],
      }),
    })
    return;
  }

  if (event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    });
    return;
  }

  const {
    baseUrl,
    token,
    streamId,
    input,
    parameters,
  } = JSON.parse(event.body)

  if (!baseUrl || !token || !streamId || !parameters ) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    });
    return;
  }

  // Try to receive stream objects
  var returnObjects = []

  if (parameters.exactMatch)
    returnObjects = input.filter( o => JSON.stringify(getProperty(o, parameters.criteria)) == parameters.criteria)
  else
    returnObjects = input.filter( o => JSON.stringify(getProperty(o, parameters.criteria)).includes(parameters.criteria))

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(returnObjects)
  })
}

function getProperty ( source, sourcePath ) {
  return get(source, sourcePath)
}