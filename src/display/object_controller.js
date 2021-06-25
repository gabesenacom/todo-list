export const ObjectController = () => {
  let objectsList = [];

  function getObjectByDataID( dataID ) {
    let found = objectsList.filter( ( other_obj ) => other_obj.object.dataID ==
      dataID );
    return found.length > 0 ? found[ 0 ].object : null;
  }

  function buildObject( object ) {
    let args = [ ...arguments ].slice( 1, arguments.length );
    let obj = object.apply( null, args );
    addObject( obj );
    return obj;
  }

  function addObject( object ) {
    objectsList.push( { object, project: object.getProject() } );
  }

  function removeObjectByDataID( dataID ) {
    objectsList = objectsList.filter( ( object ) => object.object.dataID !=
      dataID );
  }

  function removeObject( object, full = false ) {

    object.getDOMElement().remove();
    if ( full ) {
      removeObjectByDataID( object.dataID );
    }
  }

  //this will remove all objects by display effect only
  function removeAllObjectsDisplay() {
    for ( let object of objectsList ) {
      removeObject( object[ "object" ] );
    }
  }

  function getObjectsList() {
    return objectsList;
  }

  return {
    getObjectsList,
    getObjectByDataID,
    buildObject,
    addObject,
    removeObjectByDataID,
    removeObject,
    removeAllObjectsDisplay
  };
};
