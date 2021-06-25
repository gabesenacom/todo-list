import {
  createElement
} from "./domelement_utils";
import {subscribe
, Events} from "./../controller/controllers";

let app = document.getElementById("app");

export const Log = (() => {
  let domElement, logText, delayTimeOut;
  function build() {
    domElement  = createElement("div", null, "log", null, app);
    logText = createElement("p", null, "log-message", "Your log message here", domElement);
    hide();
  }

  function sendLog(data, autoShow = false) {
    logText.textContent = data.logMessage;
    if(delayTimeOut)
      clearTimeout(delayTimeOut);
    if(autoShow)
      show();
  }

  function hide() {
    domElement.classList.add("hidden");
  }

  function show() {
    domElement.classList.remove("hidden");
  }

  function listen(msg, data) {
    sendLog(data, true);
    delayTimeOut = setTimeout(() => hide(), 3000);
  }

  build();
  subscribe(Events.SEND_LOG, listen);
  return {show, hide, sendLog};
})();
