import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Upload Speckle Objects",
        allowBucketing: true,
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

  // Try to send stream objects
  Axios.defaults.headers.common[ 'Authorization' ] = token

  let objectIds = [ ]

  let bucket = [ ],
    maxReq = 50 // magic number; maximum objects to request in a bucket
  for ( let i = 0; i < input.length; i++ ) {
    bucket.push( input[ i ] )
    if ( i % maxReq === 0 && i !== 0 ) {
      let res = await createObjects( baseUrl, bucket );
      objectIds.push(...res)
      bucket = [ ]
    }
  }

  if ( bucket.length != 0 ) {
    let res = await createObjects( baseUrl, bucket );
    objectIds.push(...res)
  }

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(objectIds)
  })
}

function createObjects( baseUrl, objects ) {
  return new Promise( (resolve, reject) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: `objects`,
      data: objects,
    })
      .then( res => resolve( res.data.resources ) )
      .catch( err => reject( err ))
  })
}