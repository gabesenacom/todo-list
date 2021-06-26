import { Events } from "./events";
import PubSub from "pubsub-js";
import { requestSave } from "./../storage/app_storage.js";

export function sendLog( logMessage ) {
  publish( Events.SEND_LOG, { logMessage } );
}

export function subscribe( event, controller ) {
  return PubSub[ "subscribe" ]( event, controller );
}

export function publish( event, values ) {
  return PubSub[ "publish" ]( event, values );
}

export function clearSubscription( event ) {
  PubSub.getSubscriptions( event ).forEach( ( sub ) => PubSub.unsubscribe( sub ) );
}

export function unsubscribe( token ) {
  PubSub[ "unsubscribe" ]( token );
}

export function subscribeAccept( event, callback, notAcceptMessage =
  "The app does not accept this data. Sorry!" ) {
  return subscribe( event, ( msg, data ) => {
    let errorLogMessage = data ? data.errorMessage : notAcceptMessage;

    if ( !data || !data.accept ) {
      sendLog( errorLogMessage );
      return;
    }

    callback( msg, data );
  } );
}

export function subscribeAction( event, acceptValidator, actionCallback ) {
  subscribe( event, ( msg, data ) => {
    let result = {}; //{accept, errorMessage}
    let accept = acceptValidator( data, result );
    result[ "accept" ] = accept;

    if ( accept ) {
      actionCallback( data );
      requestSave();
    }
    let acceptEvent = event + "_ACCEPT";
    publish( acceptEvent, result );
  } );
}

export function actionValidator( result, validatorCallback, errorMessage ) {
  let validatorResult = validatorCallback ? validatorCallback() : null;
  result.errorMessage = !validatorResult ? errorMessage : null;
  return validatorResult;
}

export function subscribeCurrentProject( currentProject ) {
  subscribe( Events.GET_CURRENT_PROJECT, ( msg, data ) =>
    currentProject = data
  );
}
export { Events } from "./events"
