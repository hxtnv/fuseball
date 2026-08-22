import { render } from "preact";
import { App } from "./app";
import "./styles/reset.scss";
import "./styles/global.scss";

render(<App />, document.getElementById("app")!);
