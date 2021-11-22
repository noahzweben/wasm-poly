// set up variables
var form_larger_than_input = 1000;
var diamond = document.getElementById("diamond");
spin(); //spins diamond using js (to demonstrate non-blocking wasm calls)
document.getElementById("submit_form").onsubmit = submit;

var wasm_path = "prime.wasm";

/**
* Configure webworker to run wasm code without blocking on client
* webworker_wasm.js is a separate file that can execute aribtray wasm code, 
 * <LOAD_WASM> instruction takes the wasm_path as an argument and loads the module
 * <EXECUTE_WASM> instruction takes the function name, arguments, and a response code
**/
var worker = new Worker("webworker_wasm.js");
worker.postMessage({ type: "LOAD_WASM", path: wasm_path });
worker.onmessage = e => {
    switch (e.data.type) {
        case "WASM_LOADED":
            calculateFirstPrimeClient();
            return

        case "PRIME_DONE": {
            let prime = e.data.result;
            document.getElementById("result").innerHTML += prime;
            return;
        }
        default:
            return
    }
}
// * <EXECUTE_WASM> instruction takes the function name, arguments, and a response code
// This function uses the webworker to call the generate_larger_prime function in prime.wasm
function calculateFirstPrimeClient() {
    document.getElementById("result").innerHTML = "Client Calculating: ";

    worker.postMessage({
        type: "EXECUTE_WASM",
        complete_type: "PRIME_DONE",
        arguments: [form_larger_than_input],
        function: "generate_larger_prime"
    });
}


// load wasm for communication to server
var wasm_bytes;
config();
async function config() {
    let wasm_fetch = await fetch(wasm_path);
    wasm_bytes = await wasm_fetch.blob();
}

async function calculateFirstPrimeServer() {
    if (!wasm_bytes) {
        console.log("wasm not loaded");
        return;
    }
    document.getElementById("result").innerHTML = "Server Calculating: ";
    let formData = new FormData();
    formData.append("wasm", wasm_bytes);
    formData.append("function", "generate_larger_prime");
    formData.append("argument", form_larger_than_input);
    let response = await fetch("/execute_wasm", {
        method: "POST", body: formData
    });
    //get response body
    let body = await response.json();
    console.log(body);
    document.getElementById("result").innerHTML += `${body.result}`;
}



// Form input functions
function submit(e) {
    e.preventDefault();
    if (Math.random() > 0.5) {
        calculateFirstPrimeClient();
    } else {
        calculateFirstPrimeServer();
    }
}
function change(e) {
    form_larger_than_input = e;
}

// Utility function to spin diamond
function spin() {
    let spin_amount = 0;
    let spin_fx = function () {
        diamond.style.transform = `rotate(${spin_amount}deg)`;
        spin_amount = (spin_amount + 5) % 360;
        setTimeout(spin_fx, 20);
    };
    spin_fx();
}
