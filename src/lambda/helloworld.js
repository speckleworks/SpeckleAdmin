exports.handler = async (event, context, callback) => {
  if (event.httpMethod == 'GET') {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        name: "Hello World!",
        icon: "person",
        allowBucketing: true,
        parameters : [ ],
      }),
    })
    return;
  }

  callback(null, {
    statusCode: 200,
    body: "HAHAHAHA"
  })
}
