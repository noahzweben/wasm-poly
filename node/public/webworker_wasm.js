// Webworker to execute arbitrary wasm functions

let wasm_instance = null;

self.onmessage = function (e) {
    switch (e.data.type) {
        case "LOAD_WASM":
            load(e.data.path);
            return;
        case "EXECUTE_WASM":
            execute(e.data)
            return;
    }


}

function load(path) {
    WebAssembly.instantiateStreaming(fetch(path)).then(i => {
        wasm_instance = i;
        postMessage({ type: "WASM_LOADED" });
    });
}

function execute(data) {
    let call_fx = wasm_instance.instance.exports[data.function];
    postMessage({ type: data.complete_type, result: call_fx(...data.arguments) });
}
