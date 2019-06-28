import get from 'lodash.get'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Filter",
        icon: "filter_list",
        allowBucketing: true,
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
          {
            name: "queries",
            type: "objectarray",
            headers: ["path", "criteria"]
          }
        ],
      }),
    }
  }

  if (event.httpMethod !== 'POST' || !event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  const {
    baseUrl,
    token,
    input,
    parameters,
  } = JSON.parse(event.body)
  
  if (!baseUrl || !token || !input ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  console.log(parameters)

  // Try to receive stream objects
  var returnObjects = []

  returnObjects = input.filter( o => { 
    let prop = JSON.stringify(getProperty(o, parameters.path))
    if (prop == null)
      return false
    if (parameters.exactMatch)
      return JSON.stringify(getProperty(o, parameters.path)).toLowerCase() === parameters.criteria.toLowerCase()
    else
      return JSON.stringify(getProperty(o, parameters.path)).toLowerCase().includes(parameters.criteria.toLowerCase())
  })

  return {
    statusCode: 200,
    body: JSON.stringify(returnObjects)
  }
}

function getProperty ( source, sourcePath ) {
  return get(source, sourcePath)
}