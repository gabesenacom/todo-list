import { Events, subscribeAction, actionValidator, publish } from "./../controller/controllers";
import { importApp, exportApp, getAppData, DEFAULT_INBOX_NAME } from "./../controller/app";
import PubSub from "pubsub-js";

function requestSave() {
  save( getAppData() );
}

function requestLoad() {
  let localData = load();
  if ( localData )
    return localData;
  return [ { name: DEFAULT_INBOX_NAME, todos: [], completedTodos: [] } ];
}

function save( data ) {
  if ( !localStorageAvailable() ) {
    return;
  }
  localStorage.setItem( "data", JSON.stringify( data ) );
}

function load() {
  if ( !localStorageAvailable() ) {
    return;
  }
  let data = localStorage.getItem( "data" );
  if ( data == null || data == "" )
    return;
  let projects = JSON.parse( data );
  if ( projects != null )
    return projects;

}

function sendUpdates() {
  publish( Events.FORCE_LOAD_TODOS, {} );
}

function localStorageAvailable() {
  try {
    let storage = window.localStorage;
    let test = '__storage_test__';
    storage.setItem( test, test );
    storage.removeItem( test );
    return true;
  } catch ( e ) {
    return e instanceof DOMException && (
        e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ) &&
      storage.length !== 0;
  }
}
export { requestSave, requestLoad, sendUpdates };
