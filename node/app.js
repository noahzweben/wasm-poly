const express = require('express');
const formData = require("express-form-data");
const os = require("os");
const wasmedge = require("wasmedge-core");

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true
};

app.use(formData.parse(options));

app.get('/', (req, res) => res.redirect("/index.html"));

// endpoint to execute arbitrary wasm functions as a Function as a Service
app.post('/execute_wasm', function (req, res) {
  const call_fx = req.body.function;
  const argument = parseInt(req.body.argument);
  let vm = new wasmedge.VM(req.files.wasm.path, { args: process.argv, env: process.env, preopens: { '/': __dirname } });
  res.send({ result: vm.RunInt(call_fx, argument) });
});

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))
