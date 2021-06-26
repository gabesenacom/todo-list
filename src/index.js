import "./controller/app"
import "./display/projects"
import "./display/todo_list"
import "./display/notes"
import "./display/log"
import "./display/mobile/mobile_tabs_controller"
import { sendUpdates } from "./storage/app_storage";

sendUpdates();
