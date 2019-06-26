import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Speckle Stream Receiver",
        allowBucketing: false,
        parameters : [ ],
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
  var streamObjects = [ ]

  Axios.defaults.headers.common[ 'Authorization' ] = token

  let objectIds = await getStreamObjectIds( baseUrl, streamId )

  let bucket = [ ],
    maxReq = 50 // magic number; maximum objects to request in a bucket

  for ( let i = 0; i < objectIds.length; i++ ) {
    bucket.push( objectIds[ i ] )
    if ( i % maxReq === 0 && i !== 0 ) {
      let objects = await getObjects( baseUrl, bucket )
      streamObjects.push(...objects)
      bucket = [ ]
    }
  }

  if ( bucket.length !== 0 ) {
    let objects = await getObjects( baseUrl, bucket )
    streamObjects.push(...objects)
    bucket = [ ]
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(streamObjects)
  })
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

function getObjects( baseUrl, objectIds )
{
  return new Promise( (resolve, reject) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: `objects/getbulk?omit=base64,rawData,canRead,canWrite,children,anonymousComments,name`,
      data: objectIds,
    })
    .then( res => resolve( res.data.resources ) )
    .catch( err => reject( err ) )
  })
}
