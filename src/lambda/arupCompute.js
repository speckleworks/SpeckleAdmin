import Axios from 'axios'
import get from 'lodash.get'
import set from 'lodash.set'

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
            type: "object",
          },
          {
            name: "valueData",
            type: "object",
          },
          {
            name: "outputPath",
            type: "string",
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

  if (!baseUrl || !token || !input || !parameters ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Clean inputs
  if (parameters.pathData)
    parameters.pathData = Object.assign({}, ...
      Object.entries(parameters.pathData).filter(([k,v]) => {
        return (v !== null)
      }).map(([k,v]) => ({[k]:v}))
    )
  else
    parameters.pathData = {}
    
  if (parameters.valueData)
    parameters.valueData = Object.assign({}, ...
      Object.entries(parameters.valueData).filter(([k,v]) => {
        return (v !== null)
      }).map(([k,v]) => ({[k]:v}))
    )
  else
    parameters.valueData = {}
  
  if (parameters.outputPath === null || parameters.outputPath === undefined)
      parameters.outputPath = ''

  // Try to send stream objects
  var output = [ ]
  var validObjects = [ ]
  var invalidObjects = [ ]
  
  var restInput = {
    method: 'POST',
    url: parameters.selectedFunction.api,
    baseURL: `https://arupcompute-dev.azurewebsites.net/api`,
    data: { }
  }

  for (let obj of input) {
    var skip = false
    var tempDict = { }

    for (let i = 0; i < Object.keys(parameters.pathData).length; i++)
    {
      let k = Object.keys(parameters.pathData)[i]
      tempDict[k] = get(obj, parameters.pathData[k])
      if (tempDict[k] == null)
      {
        invalidObjects.push(obj)
        skip = true
        break
      }
    }

    if (skip) continue

    for (let key in parameters.valueData)
      tempDict[key] = parameters.valueData[key]

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
    return{
      statusCode: 200,
      body: JSON.stringify(input)
    }
  }

  let result = await callAPI(restInput)

  for (let obj of validObjects) {
    var objResult = result.data.splice(0,1)[0]
    var outputObj = JSON.parse(JSON.stringify(obj))
    
    objResult.arupComputeResultItems.forEach( res => {
      outputObj = set(
        outputObj,
        parameters.outputPath.replace("/^.+|.+$/g", '') + '.' + res.symbol,
        res.value
      )
    })

    delete outputObj.hash

    output.push(outputObj)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output)
  }
}

function callAPI ( payload ) {
  return new Promise( async ( resolve, reject ) => {
    Axios({
      method: payload.method,
      url: payload.url,
      baseURL: payload.baseURL,
      data: payload.data,
    })
      .then (res => resolve( res ))
      .catch( err => reject( err ))
  })
}