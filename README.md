# PolyPrime
This app takes a number and returns the next prime number. You can see it live at http://44.206.80.238/ (assuming I haven't taken down because my AWS bill is :'( )

![](./polyprime.gif)


# Getting started
* Run `npm install && node node/app.js`
* Access at `localhost:3000`


# Questions
1. **How does your client "ask" the server to run the computation? Is there a way to do this without duplicating your libary SDK as an API?**
  * Currently the client ships with the bundled prime.wasm. The client can chose to run this code in the browser (I    encapsulate in a webworker -- see below question) or run the code on the server. To avoid duplicating code on the server, I was inspired by the Function As A Service (FaaS) functionality described in the wasmedge documentation. If the client ever wants to run the webassembly code remotely, it POSTs the wasm file to the NodeJS server along with a description of the internal function and arguments. The node server launches a WASMEdge runtime and executes the uploaded wasm function. This FaaS endpoint (`/execute_wasm` in `node/app.js`) is capable of running arbitrary wasm files/functions. Before feeling fully comfortable with this on a production system, I would want to verify/do further research into the sandboxed nature of WasmEdge runtimes to ensure user-uploaded wasm files cannot do anything malicious. Could also limit the executables by storing a list on the server of allowed wasm_binary hashes.

2. **How do you make the library non-blocking (this is potentially outside of scope, but still interesting)**
  * I focused primarily on making the library non-blocking on the client. Since the dom is powered by single-threaded JS, long running web-assembly code can freeze the front-end. To circumvent the issue, I abstracted a wasm executor in a web-worker which spins up a non-UI-blocking thread for computation. Similar to the `/execute_wasm` endpoint, `webworker_wasm.js` accepts an arbitrary wasm and function call - so is reusable across wasm files.
  * I made the poly gem spin with javascript, so you can visually see that nothing is blocking the main js thread.

3. **What are the benefits and drawbacks of this way of separating compute between the client and server?**
  * Benefits: Run computations where most economical (compute costs) and fast (request latency, available server/client resources).
  * Drawbacks: Touched on potential security implications above.

## How to decide between server and client?
Not implemented (in the demo I just randomly choose), but there are a few factors I would consider:
1. **Latency**: can be determined using javascript. As latency of connection with remote server increases, I would prefer to use client to maintain user experience.
2. **Cost**: All things equal, it is cheaper to use client to compute than paying for it on our servers
3. **Available Client Resources**: Can use `console.memory` and other JS functions to get an understanding of whether the client has the available resources (CPU/memory/gpu) to compute within a reasonable time. If so -> client, else -> server.

## How it works
* The Rust function source code is in the `src/lib.rs` file, it is pre-compiled using `rustwasmc` into `prime.wasm`
