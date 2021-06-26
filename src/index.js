import "./controller/app"
import "./display/projects"
import "./display/todo_list"
import "./display/notes"
import "./display/log"
import { sendUpdates } from "./storage/app_storage";

sendUpdates();
