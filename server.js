const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.API_KEY;
const API_BASE_URL = "https://app.printercow.com/api";
const TEMPLATE_ID = process.env.TEMPLATE_ID;
const PRINTER_ID = process.env.PRINTER_ID;

app.use(express.json());
app.use(express.static("."));

app.post("/print", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2));
    
    const printData = [];
    const lines = req.body.content.split("\n").filter((line) => line.trim());

    // Add title
    printData.push({
      uuid: "MegF8c6Uc7saVikCdYXMH",
      params: {
        text: "DON'T BURN THE DAY",
        fontSize: "60px",
        textAlign: "center",
        justifyContent: "center",
      },
    });

    // Add separator
    printData.push({
      uuid: "KyeOG6DgAu6Q_uiw2tJgf",
      params: {
        marginTop: "40px",
        borderHeight: "4px",
        marginBottom: "40px",
      },
    });

    // Process content into todo items - only markdown tasks
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Only process markdown task items: - [ ], - [], - [x]
      if (trimmedLine.match(/^- \[([ x]?)\]/)) {
        const title = trimmedLine.replace(/^- \[([ x]?)\]\s*/, "");
        if (title) {
          printData.push({
            uuid: "Wz-SrrAJWaFZOnL3NgHFn",
            params: {
              title: title,
            },
          });
        }
      }
    }
    console.log("PrintData being sent:", JSON.stringify(printData, null, 2));

    const requestBody = {
      printerId: PRINTER_ID,
      templateId: TEMPLATE_ID,
      params: printData,
    };
    
    console.log("Sending to PrinterCow:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/print`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("PrinterCow response status:", response.status);
    console.log("PrinterCow response headers:", JSON.stringify([...response.headers.entries()], null, 2));

    if (response.ok) {
      const result = await response.json();
      console.log("PrinterCow success response:", JSON.stringify(result, null, 2));
      res.json(result);
    } else {
      const error = await response.text();
      console.log("PrinterCow error response:", error);
      res.status(response.status).send(error);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
