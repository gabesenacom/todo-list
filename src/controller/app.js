import { Events, subscribeAction, actionValidator } from "./../controller/controllers";

const DEFAULT_INBOX_NAME = "Inbox";

let projects = [ { name: DEFAULT_INBOX_NAME, todos: [], completedTodos: [] } ]; //[{name: projectName, todos: [todo, todo, todo({..., notes: [note, note, note]})]}, {...}]
let currentProject = DEFAULT_INBOX_NAME;
let currentTodoNotes;

const projectListeners = ( () => {

  subscribeAction( Events.CREATE_PROJECT,
    ( data, result ) => actionValidator( result, () => !hasProject( data ),
      "Invalid name, this name is already used." ), ( data ) => projects.push( {
      name: data,
      todos: [],
      completedTodos: []
    } )
  );

  subscribeAction( Events.OPEN_PROJECT,
    ( data, result ) =>
    actionValidator( result, () => currentProject != data,
      "This project already open." ), ( data ) => currentProject = data );

  subscribeAction( Events.REMOVE_PROJECT,
    ( data, result ) => {
      return actionValidator( result, () => hasProject( data ),
        "Project not found." );
    }, ( data ) => {
      projects = projects.filter( ( project ) => project.name != data );
    } );
} )();

const todoListListeners = ( () => {

  subscribeAction( Events.CREATE_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo, retry again." ), ( data ) => {
      getFullCurrentProject().todos.push( data );
    }
  );
  subscribeAction( Events.EDIT_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo value, retry again." ), ( data ) => {
      getFullCurrentProject().todos = getFullCurrentProject().todos.filter(
        todo => todo.dataID != data.dataID );
      getFullProjectByName( data.projectName ).todos.push( data );
    }
  );

  subscribeAction( Events.REMOVE_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo data, retry again." ), ( data ) => {
      getFullCurrentProject().todos = getFullCurrentProject().todos.filter(
        todo => todo.dataID != data.dataID );
    }
  );

  subscribeAction( Events.CHECK_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo data, retry again." ), ( data ) => {
      let completedTodo = getFullCurrentProject().todos.filter(
        todo => todo.dataID == data.dataID )[ 0 ];
      getFullCurrentProject().completedTodos.push( completedTodo );
      getFullCurrentProject().todos = getFullCurrentProject().todos.filter(
        todo => todo.dataID != data.dataID );
    }
  );

  subscribeAction( Events.OPEN_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo data, retry again." ), ( data ) => {
      let todo = getTodoByData( data.dataID );

      currentTodoNotes = {};
      currentTodoNotes[ "todoDataID" ] = todo[ "dataID" ];
      currentTodoNotes[ "todo" ] = todo[ "name" ];
      currentTodoNotes[ "date" ] = todo[ "date" ];
      currentTodoNotes[ "project" ] = todo[ "projectName" ];
      currentTodoNotes[ "notes" ] = todo[ "notes" ] ? todo[ "notes" ] : [];
    }
  );

  subscribeAction( Events.CLOSE_TODO,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo data, retry again." ), ( data ) => {
      currentTodoNotes = null;
    }
  );
} )();

const notesListeners = ( () => {
  subscribeAction( Events.CREATE_NOTE,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo, retry again." ), ( data ) => {
      let todo = getTodoByData( currentTodoNotes[ "todoDataID" ] );
      todo.notes = todo.notes ? todo.notes : [];
      todo.notes.push( {
        note: data[ "note" ],
        date: data[ "date" ],
        dataID: data[ "dataID" ]
      } );
    }
  );

  subscribeAction( Events.EDIT_NOTE,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo value, retry again." ), ( data ) => {
      let todo = getTodoByData( currentTodoNotes[ "todoDataID" ] );
      todo.notes = todo.notes.filter( ( note ) => note[ "dataID" ] !=
        data[ "dataID" ] );
      todo.notes.push( {
        note: data[ "note" ],
        date: data[ "date" ],
        dataID: data[ "dataID" ]
      } );
    }
  );

  subscribeAction( Events.REMOVE_NOTE,
    ( data, result ) => actionValidator( result, () => true,
      "Invalid todo data, retry again." ), ( data ) => {
      let todo = getTodoByData( currentTodoNotes[ "todoDataID" ] );
      todo.notes = todo.notes.filter( ( note ) => note[ "dataID" ] !=
        data[ "dataID" ] );
    }
  );
} )();

function getCurrentProject() {
  return currentProject;
}

function getCurrentTodoNotes() {
  return currentTodoNotes;
}

function getTodoByData( dataID ) {
  return getFullCurrentProject().todos.filter( ( todo ) => todo.dataID ==
    dataID )[ 0 ];
}

function getFullCurrentProject() {
  return projects.filter( ( project ) => project.name == currentProject )[ 0 ];
}

function getFullProjectByName( name ) {
  return projects.filter( ( project ) => project[ "name" ] == name )[ 0 ];
}

function hasProject( name ) {
  return projects.some( (
    project ) => project[ "name" ] == name );
}

function getProjects() {
  return projects.reduce( ( names, now ) => {
    names.push( now.name );
    return names;
  }, [] );
}

export {
  DEFAULT_INBOX_NAME,
  getProjects,
  getFullProjectByName,
  getFullCurrentProject,
  getTodoByData,
  getCurrentTodoNotes,
  getCurrentProject
};
