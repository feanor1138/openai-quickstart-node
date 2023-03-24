import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
//const modelName = "davinci:ft-comcast-2023-03-14-17-46-20";
//const modelName = "davinci:ft-comcast-2023-03-14-19-27-15";
//const modelName = "davinci:ft-comcast-2023-03-14-20-24-09";

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const chat = req.body.chat || '';
  const model = req.body.model || '';
  if (chat.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid chat",
      }
    });
    return;
  }

  try {
    
    let propsObject = {
        max_tokens: 100,
        model: model,
        temperature: 0.0
    }

    if (model === 'text-davinci-003') {
      const completion = await openai.createCompletion({...propsObject, 
        prompt: generatePrompt(chat, model)
      });
      res.status(200).json({ result: completion.data.choices[0].text });
    } else if (model === 'gpt-3.5-turbo') {
      const completion = await openai.createChatCompletion({...propsObject, 
        messages:[
          {"role": "system", "content": "summarize customer chat in less than 70 words"},
          {'role': 'user', 'content': chat}
        ]
      });
      console.log(completion);
      res.status(200).json({ result: completion.data.choices[0].message.content });
    } else if (model === 'flan_t5_large') {
      const response = await fetch('http://18.220.13.107:8080/invocations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summarize: [{
            requestId:"request-id-1",
            text:chat
          }]
        })
      });
      const output = await response.json();
      console.log(output);
      res.status(200).json({ result: output.summaries[0].summary_text })
    }
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.log(error.response);
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(chat, model) {
  /*const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();*/
  //return `Summarize this chat succinctly: Chat: {${chat}}\n\n###\n\n`;
  //return `summarize this chat and add a title: ${chat}`;
  if (model === 'text-davinci-003') {
  return `Summarize this chat.
Chat:
Customer: Why did my bill go up this year
Customer: lower my bill
Customer: Talk to an agent
Customer: Connect with a chat agent
Summary: This chat is about a customer who needs help understanding why their bill went up and how to lower it. They want to talk to an agent.
Chat:
Customer: Great, is that all I need to do
Customer: ok thanks
Customer: That is all
Customer: Nope, thanks for your assistance
Summary: The customer got the information they needed and is thankful for the assistance.
  Chat:
  ${chat}
  Summary:`;
  }
  return `summarize customer chat in less than 70 words.
  ${chat}`;
  /*return `Summarize this chat.

  Chat: {Amanda: I baked cookies. Do you want some? Jerry: Sure! Amanda: I'll bring you tomorrow :-)}
  Summary: Amanda baked cookies and will bring Jerry some tomorrow.
  Chat: {Olivia: Who are you voting for in this election? Oliver: Liberals as always. Olivia: Me too!! Oliver: Great}
  Summary: Olivia and Olivier are voting for liberals in this election.
  Chat: {${chat}}
  Summary:`;*/
}
