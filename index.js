const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  let { text } = req.body;
  let inputs = text.split("*");

  // If user pressed 0 (Back), remove last input to go back
  if (inputs.includes("0")) {
    const index = inputs.lastIndexOf("0");
    inputs = inputs.slice(0, index); // Remove the current input and everything after
  }

  const level = inputs.length;
  const lang = inputs[0];
  let response = "";

  if (text === "" || inputs.length === 0) {
    response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
  }

  else if (level === 1) {
    if (lang === "1") {
      response = `CON Enter your weight in KG:\n0. Back`;
    } else if (lang === "2") {
      response = `CON Andika ibiro byawe mu kilo (KG):\n0. Subira inyuma`;
    } else {
      response = "END Invalid language.";
    }
  }

  else if (level === 2) {
    if (lang === "1") {
      response = `CON Enter your height in CM:\n0. Back`;
    } else {
      response = `CON Andika uburebure bwawe mu centimetero (CM):\n0. Subira inyuma`;
    }
  }

  else if (level === 3) {
    const weight = parseFloat(inputs[1]);
    const heightCm = parseFloat(inputs[2]);
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);

    let status = "";
    if (bmi < 18.5) status = lang === "1" ? "Underweight" : "Ufite ibiro biri hasi cyane.";
    else if (bmi < 25) status = lang === "1" ? "Normal weight" : "Ufite ibiro bisanzwe.";
    else if (bmi < 30) status = lang === "1" ? "Overweight" : "Ufite ibiro birenze bisanzwe.";
    else status = lang === "1" ? "Obese" : "Ufite umubyibuho ukabije.";

    if (lang === "1") {
      response = `CON Your BMI is ${bmiRounded} (${status})
Would you like health tips?
1. Yes
2. No
0. Back`;
    } else {
      response = `CON BMI yawe ni ${bmiRounded} (${status})
Ukeneye inama z’ubuzima?
1. Yego
2. Oya
0. Subira inyuma`;
    }
  }

  else if (level === 4) {
    const choice = inputs[3];
    if (choice === "1") {
      response = lang === "1"
        ? `END Health Tips:\n- Eat fruits and vegetables\n- Drink water regularly\n- Avoid fast food and sugar`
        : `END Inama z'ubuzima:\n- Rya imbuto n’imboga\n- Nywa amazi kenshi\n- Irinde ibiryo bya vuba na isukari nyinshi`;
    } else if (choice === "2") {
      response = lang === "1"
        ? "END Thank you. Stay healthy!"
        : "END Murakoze. Mugire ubuzima bwiza!";
    } else {
      response = "END Invalid option.";
    }
  }

  else {
    response = "END Session ended or invalid input.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BMI USSD app running on port " + PORT));
