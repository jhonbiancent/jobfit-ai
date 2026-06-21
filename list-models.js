const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const key = env.split('=')[1].trim().replace(/\"/g, '').replace(/'/g, '');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ai = new GoogleGenerativeAI(key);

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("AVAILABLE MODELS:");
    if (data.models) {
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}
listModels();
