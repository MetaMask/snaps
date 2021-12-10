// import { errors as rpcErrors } from 'eth-json-rpc-errors';

// Twitter API V2
// https://documenter.getpostman.com/view/9956214/T1LMiT5U#64579fcd-790c-4af3-9f26-ca4031d47166

declare var wallet: any;


wallet.registerRpcMessageHandler(async (_originString:any, requestObject:any) => {

  const {method, params: [userTweetInput]} = requestObject
  let response
  let textResponse


  try {
    switch (method) {
      case 'tweet':
        // var raw = `{\n    \"text\": \"${userTweetInput}\"\n}`;
        var args = {
          text: userTweetInput
        }
        var requestOptions = {
          method: 'POST',
          body: args,
          redirect: 'follow'
        };

        response = await fetch("https://api.twitter.com/2/tweets", requestOptions as any)
        textResponse = response.text()


      case 'getTweet':
        response = await fetch(`https://api.twitter.com/2/tweets/${userTweetInput}`)
        textResponse = response.text()

      return textResponse
      default:
        console.log({requestObject})
        // throw rpcErrors.eth.methodNotFound(requestObject);

    }
  } catch (error) {

  }
});
