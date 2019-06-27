import Axios from 'axios'

exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Speckle Stream Sender",
        icon: "cloud_upload",
        allowBucketing: false,
        parameters : [
          {
            name: "streamName",
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
    input,
    parameters,
  } = JSON.parse(event.body)

  if (!baseUrl || !token || !parameters ) {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify({ status: 'Bad Request' }),
    });
    return;
  }

  // Try to send stream objects
  Axios.defaults.headers.common[ 'Authorization' ] = token

  var stream = {name: parameters.streamName, objects: input};
  let result = await createStream(baseUrl, stream);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(result.streamId)
  })
}

function createStream( baseUrl, stream ) {
  return new Promise( ( resolve, reject ) => {
    Axios({
      method: 'POST',
      baseURL: baseUrl,
      url: `streams`,
    })
      .then( res => {
        console.log( res )
        stream.streamId = res.data.resource.streamId
        res.data.resource.onlineEditable = true
        return Axios({
          method: 'PUT',
          baseURL: baseUrl,
          url: `streams/${res.data.resource.streamId}`,
          data: stream,
        })
      } )
      .then( res => resolve( stream ) )
      .catch( err => {
        console.error( err )
        reject( err )
      } )
  } )
}