import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        name: "Speckle Stream Receiver",
        description: "Gets objects from the specified streams using the queries given. It is heavily recommended that you extract only the necessary fields. If no fields are specified, all fields will be obtained.",
        icon: "cloud_download",
        allowBucketing: false,
        parameters : [
          {
            name: "streamIds",
            type: "array",
          },
          {
            name: "fields",
            type: "array",
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

  if (!baseUrl || !token ) {
    return {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    }
  }

  // Try to receive stream objects
  var streamObjects = [ ]

  Axios.defaults.headers.common[ 'Authorization' ] = token

  let objectIds = [ ]
  for (let i = 0; i < parameters.streamIds.length; i++)
    objectIds.push(... await getStreamObjectIds( baseUrl, parameters.streamIds[i] ))

  objectIds = [...new Set(objectIds)]

  let bucket = [ ],
    maxReq = 50 // magic number; maximum objects to request in a bucket

  for ( let i = 0; i < objectIds.length; i++ ) {
    bucket.push( objectIds[ i ] )
    if ( i % maxReq === 0 && i !== 0 ) {
      let objects = await getObjects( baseUrl, bucket, parameters.fields, parameters.queries )
      streamObjects.push(...objects)
      bucket = [ ]
    }
  }

  if ( bucket.length !== 0 ) {
    let objects = await getObjects( baseUrl, bucket, parameters.fields, parameters.queries )
    streamObjects.push(...objects)
    bucket = [ ]
  }

  return {
    statusCode: 200,
    body: JSON.stringify(streamObjects)
  }
}

function getStreamObjectIds( baseUrl, streamId )
{
  return new Promise( (resolve, reject) => {
    Axios({
      method: 'GET',
      baseURL: baseUrl,
      url: `streams/${streamId}?fields=objects,layers`,
    })
    .then( res => {
      let ids = res.data.resource.objects.map( o => o._id )
      resolve( ids )
    })
    .catch( err => {
      reject( err )
    })
  })
}

function getObjects( baseUrl, objectIds, fields, queries )
{
  var url = `objects/getbulk`//?base64,rawData,canRead,canWrite,children,anonymousComments,name`

  var query = { }

  if (queries != null && queries.length > 0)
    queries.forEach(q => {
      if (query.hasOwnProperty(q.path))
        query[q.path] += ',' + q.criteria
      else
        query[q.path] = q.criteria
    })

  if (fields != null)
  {
    if (!(fields.includes('hash')))
      fields.push('hash')
    
    query['fields'] = fields.join(',')
  }

  if (Object.keys(query).length > 0)
    url += '?' + Object.entries(query).map(([k,v]) => k + "=" + v).join('&')

  return new Promise( (resolve, reject) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: url,
      data: objectIds,
    })
    .then( res => resolve( res.data.resources.filter(x => !(x.type == 'String' && x.value == 'You do not have permissions to view this object')) ) )
    .catch( err => reject( err ) )
  })
}
