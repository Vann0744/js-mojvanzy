const Obfuscator = require('./src/obfuscator');
const fs = require('fs');

const code = `
function greet(name) {
  console.log("Hello, " + name);
}
greet('World');
`;

const obfuscator = new Obfuscator();
const obfuscatedCode = obfuscator.obfuscate(code);

console.log("Original Code:
", code);
console.log("Obfuscated Code:
", obfuscatedCode);
