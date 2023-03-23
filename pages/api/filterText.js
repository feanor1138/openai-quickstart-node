export default async function (req, res) {
  
    const unfiltered = req.body.unfiltered || '';
    if (unfiltered.trim().length === 0) {
      res.status(400).json({
        error: {
          message: "Please enter valid text",
        }
      });
      return;
    }

    try {
      const json = JSON.parse(unfiltered);
      let filtered = '';
      let buttons = [];
      if (Array.isArray(json)) {
        for (const object of json) {
          if (object['interaction']) {
            const interaction = object.interaction;
            if (Array.isArray(interaction)) {
              //console.log("interaction is an array");
              for (const item of interaction) {
                const content = getContent(item, buttons);
                if (content !== '') {
                  filtered += getAction(item, buttons);
                  filtered += content;
                }
              }
            } else {
              //console.log("interaction is not an array");
              const content = getContent(interaction, buttons);
              if (content !== '') {
                filtered += getAction(interaction, buttons);
                filtered += content;
              }
            }
          }
        }
      }

      res.status(200).json({ result: filtered });
    } catch(error) {
      if (error.response) {
        console.error(error.response.status, error.response.data);
        res.status(error.response.status).json(error.response.data);
      } else {
        console.error(`Error with json parse: ${error.message}`);
        res.status(500).json({
          error: {
            message: 'An error occurred during your request.',
          }
        });
      }
    }
  }

  class Button {
    constructor(title, target) {
      this.title = title;
      this.target = target;
    }
  }

  const getAction = (json, buttons) => {
    if (json['action'] && json.action['value'] && json.action.value.trim() !== '') {
      let type = "INTENT";
      if (json.action['type']) {
        type = json.action.type;
      }
      if (type === 'INTENT') {
        if (json.action['buttonName'] && json.action.buttonName.trim() !== '') {
          return "Customer: " + json.action.buttonName + '<br/>';
        } else {
          for (const btn of buttons) {
            if (btn.target === json.action.value) {
              return "Customer: " + btn.title + '<br/>';
            }
          }
          return 'Customer: ' + json.action.value + '<br/>';
        }
      }
      return 'Customer: ' + json.action.value + '<br/>';
    }
    return '';
  };

  const getContent = (json, buttons) => {
    if (json && json['content']) {
      let text = 'Assistant: ';
      let root = json.content;
      if (Array.isArray(root)) {
        for (const item of root) {
          try {
            const innerJson = JSON.parse(item);
            text += extractContent(innerJson, buttons);
          } catch(err) {
            console.log(err);
          }
        }
      } else {
        text += extractContent(root, buttons);
      }
      return text;
    }
    return '';
  };

  const extractContent = (content, buttons) => {
    let frameTitle = '';
    let frameMessage = '';
    let text = '';
    if (content['frameTitle'] && content.frameTitle.trim() !== '') {
      frameTitle = content.frameTitle;
    }
    if (content['frameMessage'] && content.frameMessage.trim() !== '') {
      frameMessage = content.frameMessage;
    }
    text += `${frameTitle}<br />${frameMessage}<br/>`;
    for (const element of content.elements) {
      if (element['title'] && element.title.trim() !== '' && element.title !== frameTitle) {
        text += element.title + '<br/>';
      }
      if (element['message'] && element.message.trim() !== '' && element.message !== frameMessage) {
        text += element.message + '<br/>';
      }
      if (element['buttons']) {
        for (const button of element.buttons) {
          if ((!button['visible'] || (button['visible'] && button.visible === 'true')) && (button['title'] && button.title.trim() !== '')) {
            text += button.title + '<br/>';
          }
          buttons.push(new Button(button['title'], button['target']));
        }
      }
    }
    return text;
  };