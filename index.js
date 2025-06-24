require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// ✅ Use DATABASE_URL with SSL
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // for hosted DBs like Neon
});

app.post("/ussd", async (req, res) => {
  const { sessionId, phoneNumber, text } = req.body;
  const inputs = text.split("*");
  const level = inputs.length;

  let response = "";

  try {
    // Check or create session
    let sessionQuery = await db.query(
      "SELECT * FROM sessions WHERE session_id = $1",
      [sessionId]
    );

    if (sessionQuery.rows.length === 0) {
      await db.query(
        `INSERT INTO sessions (session_id, phone_number, current_level, inputs, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [sessionId, phoneNumber, 0, JSON.stringify([])]
      );
    }

    const lang = inputs[0];

    if (text === "") {
      response = `CON BMI Health App
Select Language / Hitamo Ururimi :
1. English
2. Kinyarwanda`;
    } else if (level === 1) {
      response = lang === "1"
        ? "CON Enter Weight (KG):\n0. Back"
        : "CON Andika Ibiro (KG):\n0. Back";
    } else if (level === 2) {
      if (inputs[1] === "0") {
        return res.send(CON BMI Health App\nSelect Language / Hitamo Ururimi :\n1. English\n2. Kinyarwanda);
      }
      response = lang === "1"
        ? "CON Enter Height (CM):\n0. Back"
        : "CON Andika Uburebure (CM):\n0. Back";
    } else if (level === 3) {
      if (inputs[2] === "0") {
        return res.send(lang === "1"
          ? "CON Enter Weight (KG):\n0. Back"
          : "CON Andika Ibiro (KG):\n0. Back");
      }
      response = lang === "1"
        ? "CON Enter your Age:\n0. Back"
        : "CON Andika Imyaka:\n0. Back";
    } else if (level === 4) {
      if (inputs[3] === "0") {
        return res.send(lang === "1"
          ? "CON Enter Height (CM):\n0. Back"
          : "CON Andika Uburebure (CM):\n0. Back");
      }
      response = lang === "1"
        ? "CON Enter your Phone Number:\n0. Back"
        : "CON Andika Numero ya Telefone:\n0. Back";
    } else if (level === 5) {
      if (inputs[4] === "0") {
        return res.send(lang === "1"
          ? "CON Enter your Age:\n0. Back"
          : "CON Andika Imyaka:\n0. Back");
      }

      const weight = parseFloat(inputs[1]);
      const height = parseFloat(inputs[2]);
      const age = parseInt(inputs[3]);
      const userPhone = inputs[4];

      if (weight <= 0 || height <= 0 || age <= 0) {
        return res.send("END Invalid input values.");
      }

      const bmi = weight / Math.pow(height / 100, 2);
      const bmiRounded = bmi.toFixed(1);

      let status = "";
      if (bmi < 18.5) status = lang === "1" ? "Underweight" : "Ibiro biri hasi cyane";
      else if (bmi < 25) status = lang === "1" ? "Normal weight" : "Ibiro bisanzwe";
      else if (bmi < 30) status = lang === "1" ? "Overweight" : "Ibiro birenze";
      else status = lang === "1" ? "Obese" : "Umubyibuho ukabije";

      await db.query(
        `INSERT INTO bmi_data (session_id, phone_number, age, weight, height, bmi, bmi_status, language, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [sessionId, userPhone, age, weight, height, bmiRounded, status, lang]
      );

      response = lang === "1"
        ? CON BMI: ${bmiRounded} (${status})\nGet a health tip?\n1. Yes\n2. No\n0. Back
        : CON BMI: ${bmiRounded} (${status})\nUkeneye Inama?\n1. Yego\n2. Oya\n0. Back;
    } else if (level === 6) {
      if (inputs[5] === "0") {
        return res.send(lang === "1"
          ? "CON Enter your Phone Number:\n0. Back"
          : "CON Andika Numero ya Telefone:\n0. Back");
      }
      if (inputs[5] === "1") {
        response = lang === "1"
          ? "END Health Tip:\nExercise 10 min daily, eat fruits & vegetables."
          : "END Inama:\nImyitozo 10 iminota buri munsi, kurya imbuto & imboga.";
      } else {
        response = lang === "1"
          ? "END Thank you for using BMI Health App."
          : "END Murakoze gukoresha BMI Health App.";
      }
    } else {
      response = "END Invalid input.";
    }

    res.set("Content-Type", "text/plain");
    res.send(response);
  } catch (err) {
    console.error(err);
    res.send("END Error occurred. Please try again later.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(USSD BMI app running on port ${PORT}));
