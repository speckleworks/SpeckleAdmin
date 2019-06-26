import get from 'lodash.get'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Filter",
        allowBucketing: true,
        parameters : [
          {
            name: "path",
            type: "string",
          },
          {
            name: "criteria",
            type: "string",
          }
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
    streamIds,
    input,
    parameters,
  } = JSON.parse(event.body)
  
  if (!baseUrl || !token || !streamIds || !parameters ) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    });
    return;
  }

  // Try to receive stream objects
  var returnObjects = []

  returnObjects = input.filter( o => { 
    let prop = JSON.stringify(getProperty(o, parameters.path))
    if (prop == null)
      return false
    return JSON.stringify(getProperty(o, parameters.path)).toLowerCase().includes(parameters.criteria.toLowerCase())
  })

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(returnObjects)
  })
}

function getProperty ( source, sourcePath ) {
  return get(source, sourcePath)
}