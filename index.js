const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post("/ussd", (req, res) => {
  const { text } = req.body;
  const inputs = text.split("*");
  let response = "";
  const level = inputs.length;
  const lang = inputs[0];

  // Handle empty input - initial screen
  if (text === "") {
    response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
  }

  // Language selection
  else if (level === 1) {
    if (lang === "0") {
      response = `CON Welcome to BMI Calculator / Murakaza neza
1. English
2. Kinyarwanda`;
    } else if (lang === "1") {
      response = `CON Enter your weight in KG:\n0. Back`;
    } else if (lang === "2") {
      response = `CON Andika ibiro byawe mu kilo (KG):\n0. Subira inyuma`;
    } else {
      response = "END Invalid language.";
    }
  }

  // Weight input
  else if (level === 2) {
    if (inputs[1] === "0") {
      response = `CON ${lang === "1" ? "Enter your weight in KG:" : "Andika ibiro byawe mu kilo (KG):"}\n0. ${lang === "1" ? "Back" : "Subira inyuma"}`;
    } else {
      response =
        lang === "1"
          ? `CON Enter your height in CM:\n0. Back`
          : `CON Andika uburebure bwawe mu centimetero (CM):\n0. Subira inyuma`;
    }
  }

  // Height input and show BMI
  else if (level === 3) {
    if (inputs[2] === "0") {
      response = lang === "1"
        ? `CON Enter your height in CM:\n0. Back`
        : `CON Andika uburebure bwawe mu centimetero (CM):\n0. Subira inyuma`;
    } else {
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

      response = lang === "1"
        ? `CON Your BMI is ${bmiRounded} (${status})\nWould you like health tips?\n1. Yes\n2. No\n0. Back`
        : `CON BMI yawe ni ${bmiRounded} (${status})\nUkeneye inama z’ubuzima?\n1. Yego\n2. Oya\n0. Subira inyuma`;
    }
  }

  // Health tips
  else if (level === 4) {
    const choice = inputs[3];
    if (choice === "0") {
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

      response = lang === "1"
        ? `CON Your BMI is ${bmiRounded} (${status})\nWould you like health tips?\n1. Yes\n2. No\n0. Back`
        : `CON BMI yawe ni ${bmiRounded} (${status})\nUkeneye inama z’ubuzima?\n1. Yego\n2. Oya\n0. Subira inyuma`;
    } else if (choice === "1") {
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

  // Invalid input or session
  else {
    response = "END Session ended or invalid input.";
  }

  res.set("Content-Type", "text/plain");
  res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("BMI USSD app running on port " + PORT));
