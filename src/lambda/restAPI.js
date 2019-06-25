import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "REST API Result Embedder",
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
  var dataArray = [ ]
  
  var sourceProperties = parameters.sourceProperty.split(',')
  var targetProperties = parameters.targetProperty.split(',')
  
  var restInput = {
    method: 'post',
    url: params.apiUrl,
    data: { }
  }

  for (let obj of input) {
    var skip = false
    var tempDict = { }

    for (let i = 0; i < sourceProperties.length; i++)
    {
      tempDict[targetProperties[i]] = window.getProperty({ source: obj, sourcePath: sourceProperties[i] })
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
      var arr = window.getProperty({ source: restInput, sourcePath: 'data.' + k })
      if (arr == null)
        arr = [ ]
      arr.push(tempDict[k])

      restInput = window.setProperty({
        target: restInput,
        targetPath: 'data.' + k,
        source: arr
      })
    }

    console.log(restInput)

    validObjects.push(obj)
  }

  console.log(restInput)

  let result = await callAPI(restInput)

  console.log(result)

  for (let obj of validObjects) {
    var objResult = result.data.splice(0,1)[0]
    var outputObj = JSON.parse(JSON.stringify(obj))
    outputObj = window.setProperty({
      target: outputObj,
      targetPath: parameters.targetResponse,
      source: window.getProperty({ source: objResult, sourcePath: parameters.sourceResponse })
    })

    delete outputObj._id
    outputObj.hash = window.md5Hash(outputObj)

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
  return new Promise( async (resolve, reject ) => {
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