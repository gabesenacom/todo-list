export const LocalStorageDatabase = ( () => {
  function loadData() {
    if ( !available() ) 
      return;
    
    let data = localStorage.getItem( "data" );
    if ( data == null || data == "" )
      return;
    let projects = JSON.parse( data );
    if ( projects != null )
      return projects;
  }

  function saveData( data ) {
    if ( !available() ) 
      return;
    
    localStorage.setItem( "data", JSON.stringify( data ) );
  }

  function available() {
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

  return {saveData, loadData};
} )();