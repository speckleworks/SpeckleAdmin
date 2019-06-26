import Axios from 'axios'
import get from 'lodash.get'
import set from 'lodash.set'
import md5 from 'md5'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "REST API Result Embedder",
        allowBucketing: true,
        parameters : [
          {
            name: "apiUrl",
            type: "string",
          },
          {
            name: "sourceProperty",
            type: "string",
          },
          {
            name: "targetProperty",
            type: "string",
          },
          {
            name: "sourceResponse",
            type: "string",
          },
          {
            name: "targetResponse",
            type: "string",
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

  // Try to send stream objects
  var output = [ ]
  var validObjects = [ ]
  var invalidObjects = [ ]
  
  var sourceProperties = parameters.sourceProperty.split(',')
  var targetProperties = parameters.targetProperty.split(',')
  
  var restInput = {
    method: 'POST',
    url: parameters.apiUrl,
    data: { }
  }

  for (let obj of input) {
    var skip = false
    var tempDict = { }

    for (let i = 0; i < sourceProperties.length; i++)
    {
      tempDict[targetProperties[i]] = get(obj, sourceProperties[i])
      if (tempDict[targetProperties[i]] == null)
      {
        skip = true
        break
      }
    }
    
    if (skip)
    {
      invalidObjects.push(obj)
      continue
    }
    
    for (let k in tempDict) {
      var arr = get(restInput, 'data.' + k)
      if (arr == null)
        arr = [ ]
      arr.push(tempDict[k])

      restInput = set(
        restInput,
        'data.' + k,
        arr
      )
    }

    validObjects.push(obj)
  }

  if (Object.keys(restInput.data).length == 0)
  {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(input)
    })
    return
  }

  let result = await callAPI(restInput)

  for (let obj of validObjects) {
    var objResult = result.data.splice(0,1)[0]
    var outputObj = JSON.parse(JSON.stringify(obj))

    outputObj = set(
      outputObj,
      parameters.targetResponse,
      get(objResult, parameters.sourceResponse)
    )

    delete outputObj._id
    outputObj.hash = md5(JSON.stringify(outputObj))

    output.push(outputObj)
  }

  for (let obj of invalidObjects) {
    var outputObj = JSON.parse(JSON.stringify(obj))
    
    output.push(outputObj)
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(output)
  })
}

function callAPI ( payload ) {
  return new Promise( async ( resolve, reject ) => {
    Axios({
      method: payload.method,
      url: payload.url,
      baseURL: '',
      data: payload.data,
    })
      .then (res => resolve(res))
      .catch( err => reject( err ))
  })
}