import { Events, subscribeAction, actionValidator, publish } from "./../controller/controllers";
import { importApp, exportApp, getAppData, DEFAULT_INBOX_NAME } from "./../controller/app";
import {LocalStorageDatabase} from "./storage_type/local_storage";
import PubSub from "pubsub-js";

const STORAGE_TYPE = {
  LOCAL_STORAGE: 1
};

function requestSave() {
  save( getAppData(), STORAGE_TYPE.LOCAL_STORAGE );
}

function requestLoad() {
  let localData = load( STORAGE_TYPE.LOCAL_STORAGE );
  if ( localData )
    return localData;
  return [ { name: DEFAULT_INBOX_NAME, todos: [], completedTodos: [] } ];
}

function save( data, type ) {
  switch ( type ) {
  case 1:
    return LocalStorageDatabase.saveData(data);
  default:
    return null;
  }
}

function load( type ) {
  switch ( type ) {
  case 1:
    return LocalStorageDatabase.loadData();
  default:
    return null;
  }
}

function sendUpdates() {
  publish( Events.FORCE_LOAD_TODOS, {} );
}

export { requestSave, requestLoad, sendUpdates };
