// import CommonFunctions from './commonfunctions.js'

// Migrated Code //
$(document).ready(function() {
    // Initialize Speech SDK components
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  
    // UI Elements
    const chatText = document.getElementById('text');
    const messageFormeight = document.getElementById('messageFormeight');
    const sendButton = document.getElementById('send');
  
    // Send Button Click Event
    sendButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission
  
        // Get the text from the input field
        const userInput = chatText.value.trim();
  
        // Check if the input field is not empty
        if (userInput !== '') {
            // Add the user input to the message area
            adduserMessage(userInput, 'user');
  
            // Send the input to the backend
            // CommonFunctions()
            sendToChatGPT(userInput);
  
            // Clear the input field
            chatText.value = '';
        }
    });
  
    const addbotMessage = (text, sender) => {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const str_time = hour + ":" + minute;
        const senderClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
        const msgContainerClass = sender === 'user' ? 'msg_cotainer_send' : 'msg_cotainer';
        const imgSrc = './static/images/drs_bot.png';
  
        const messageHtml = `
            <div class="d-flex ${senderClass} mb-4">
                <div class="img_cont_msg">
                    <img src="${imgSrc}" class="rounded-circle user_img_msg">
                </div>
                <div class="${msgContainerClass}">
                    ${text}
                    <span class="msg_time">${str_time}</span>
                </div>
                
            </div>`;
        $(messageFormeight).append($.parseHTML(messageHtml));
  
    };
  
    const adduserMessage = (text, sender) => {
      const date = new Date();
      const hour = date.getHours();
      const minute = date.getMinutes();
      const str_time = hour + ":" + minute;
      const senderClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
      const msgContainerClass = sender === 'user' ? 'msg_cotainer_send' : 'msg_cotainer';
      const imgSrc = './static/images/drs_user.png';
  
      const messageHtml = `
          <div class="d-flex ${senderClass} mb-4">
              
              <div class="${msgContainerClass}">
                  ${text}
                  <span class="msg_time">${str_time}</span>
              </div>
              <div class="img_cont_msg">
                  <img src="${imgSrc}" class="rounded-circle user_img_msg">
              </div>
          </div>`;
      $(messageFormeight).append($.parseHTML(messageHtml));
  };
  
    const recognizeSpeech = () => {
        recognizer.recognizeOnceAsync(result => {
            if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
                console.log(`Recognized: ${result.text}`);
                chatText.value = result.text; // Display recognized text in input field
  
                // Add recognized text to the message area
                addMessage(result.text, 'user');
  
                // Send recognized text to API
                sendToChatGPT(result.text);
  
            } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
                console.log("No speech recognized. Trying again...");
                recognizeSpeech(); // Retry if recognition fails
  
            } else {
                console.error(`Recognition failed: ${result.errorDetails}`);
            }
        });
    };
  
    const sendToChatGPT = (voiceInput) => {
        console.log("Sending to API");
        console.log(voiceInput);
        //const apiUrl = 'pytestar.azurewebsites.net/chat'
        const apiUrl = 'https://pytestar.azurewebsites.net/chat';
        const headers = {
            'Content-Type': 'application/json',
        };
  
        const data = {
            user_input: voiceInput,
        };
  
        fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(result => {
            // Extract and process the response data
            const chatGPTResponse = result.response;
            const emotion = result.emotion.label;
  
            // Add bot's response to the message area
            addbotMessage(chatGPTResponse, 'bot');
  
            // Start speaking the response
            startSpeaking(chatGPTResponse, emotion);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
  
    const startSpeaking = (text, emotion) => {
        const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("ff542d4a97f340d4ae9faa685afab149", "eastus");
        speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // Customize if needed
        const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
        const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
      
        synthesizer.speakTextAsync(
            text,
            result => {
                console.log('Speech synthesis succeeded');
            },
            error => {
                console.error('Speech synthesis failed:', error);
            }
        );
    };
  });
  
  // Migrated Code //