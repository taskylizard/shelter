// this is nonideal :(
import exfiltrate from "../../shelter/src/exfiltrate";

// exfiltrate react
export let React: typeof import("react"), ReactDOM: typeof import("react-dom");

exfiltrate("useRef").then((v) => (React = v));
exfiltrate("findDOMNode").then((v) => (ReactDOM = v));
