const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  let { text } = req.body;
  let inputs = text.split("*");

  // Back navigation: remove last input if user entered "0"
  if (inputs.includes("0")) {
    const backIndex = inputs.lastIndexOf("0");
    inputs.splice(backIndex); // Remove everything from "0" onward
  }

  const level = inputs.length;
  const lang = inputs[0];
  let response = "";

  // Step 0: Language selection
  if (text === "" || level === 0) {
    response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
  }

  // Step 1: Weight input
  else if (level === 1) {
    if (lang === "1") {
      response = `CON Enter your weight in KG:\n0. Back`;
    } else if (lang
