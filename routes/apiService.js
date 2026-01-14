import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv'
dotenv.config()
const router = express.Router();

const aiclient = new OpenAI({
  apiKey:process.env.OPENAI_AI_KEY
});


async function askOpenAI(query) {
  const response = await aiclient.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: query }
    ],
  });

  return response.choices[0].message.content;
}
router.get('/home',(req,res)=>{
    res.render('home')
})
router.post('/query', async (req, res) => {

  try {
    const answer = await askOpenAI(req.body.query);
    res.json({data:answer});
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
});

export default router;
