const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
const chatText = document.getElementById('text');
const recBtn = document.querySelector('#recBtn');
const recBtn3 = document.getElementById('recording');
let speech = null
// let activeSynthesizer = null; // Store the active synthesizer globally
recBtn3.innerHTML = "Recording start";

// Reset UI after recording/speaking
const resetUIAfterSpeaking = () => {
  const recBtn = document.querySelector('#recBtn');
  const recBtn3 = document.getElementById('recording');
  const recBtn4 = document.getElementById('waiting');
  const recBtn5 = document.getElementById('Speaking');
  const botIcon = document.querySelector('#botIcon');
  
  recBtn3.style.display = 'none';
  recBtn4.style.display = 'none';
  recBtn5.style.display = 'none';
  botIcon.setAttribute('src', '');
  botIcon.style.display = 'none';
  
  recBtn.innerHTML = "Start Recording"; // Reset the button text
  recBtn.style.display = 'inline-block'; // Show the button again
};

// start speaking the text response from the api
const startSpeaking = (text, emotion) => {
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("ff542d4a97f340d4ae9faa685afab149", "eastus");
  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // Customize if needed
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

  
  synthesizer.speakTextAsync(
      text,
      result => {
        console.log('Speech synthesis succeeded');
        resetUIAfterSpeaking();
      },
      error => {
          console.error('Speech synthesis failed:', error);
          resetUIAfterSpeaking();
      }
  );
};

// add bot message template in message body
const addbotMessage = (text, sender) => {
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const str_time = hour + ":" + minute;
  const senderClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
  const msgContainerClass = sender === 'user' ? 'msg_cotainer_send' : 'msg_cotainer';
  const imgSrc = './static/images/drs_bot.png';

  const messageHtml = 
      `<div class="d-flex ${senderClass} mb-4">
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

// add user message template in message body
const adduserMessage = (text, sender) => {
const date = new Date();
const hour = date.getHours();
const minute = date.getMinutes();
const str_time = hour + ":" + minute;
const senderClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
const msgContainerClass = sender === 'user' ? 'msg_cotainer_send' : 'msg_cotainer';
const imgSrc = './static/images/drs_user.png';

const messageHtml = 
    `<div class="d-flex ${senderClass} mb-4">
        
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

// initialize the synthesizer
document.addEventListener('click', () => {
  const silentAudio = new SpeechSDK.SpeakerAudioDestination();
  const silentaudioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(silentAudio);
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("ff542d4a97f340d4ae9faa685afab149", "eastus");
  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // or use selectedVoice.innerText
  const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, silentaudioConfig);

  synthesizer.speakTextAsync(
    '',
    result => {
      console.log('Silent speak completed.');
    },
    error => {
      console.error('Silent speak failed:', error);
    }
  );
});

// check if microphone access is granted
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    console.log('Microphone access granted');
  })
  .catch(function(error) {
    console.error('Error accessing microphone:', error);
  });
} else {
  console.error('getUserMedia is not supported by this browser');
}


const recognizeSpeech = () => {
  console.log('Starting speech recognition...');
  recognizer.recognizeOnceAsync(result => {
    if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      console.log(`Recognized: ${result.text}`);
      // chatText.value = ${result.text};
      adduserMessage(result.text, 'user');
      recBtn.style.display = 'none';
      const recBtn4 = document.getElementById('waiting');
      const recBtn5 = document.getElementById('Speaking');
      recBtn3.style.display = 'none';
      recBtn4.style.display = 'block';
      recBtn5.style.display = 'none';    
      const botIcon = document.querySelector('#botIcon');
      botIcon.setAttribute('src','');
      botIcon.style.display = 'none';
      sendToChatGPT(result.text);            
    } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
      console.log("No speech recognized. Trying again...");
      recBtn3.innerHTML = "Not Recognized, Try again";
      recognizeSpeech(); // Retry recognition
    } else {
      console.error(`Recognition failed: ${result.errorDetails}`);
    }
  });
}

// Click event listener to the record button
recBtn.addEventListener('click', () => {
  console.log('Recording button clicked!');
  recBtn3.innerHTML = "Recording start";
  // if(speech.animationState){
  //   if(speech.animationState !== "Idle"){
  //       speech.playAnimation("Idle", null)
  //   }
  //   speech.stopSpeaking();
  // }

  botResponseUIReset(); 
  
  const botIcon = document.querySelector('#botIcon');
  botIcon.setAttribute('src','./static/images/Hearing.gif');
  botIcon.style.display = 'block';
  
  const recBtn4 = document.getElementById('waiting');
  const recBtn5 = document.getElementById('Speaking');
  recBtn3.style.display = 'inline-block';
  recBtn4.style.display = 'none';
  recBtn5.style.display = 'none';   
  recBtn.style.display = 'none';
  recognizeSpeech();
});

// Reset UI elements
const botResponseUIReset = () => {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }      
  const recBtn4 = document.getElementById('waiting');
  const recBtn5 = document.getElementById('Speaking'); 
  const botIcon = document.querySelector('#botIcon'); 
  recBtn3.style.display = 'none';
  recBtn4.style.display = 'none';
  recBtn5.style.display = 'none';     
  botIcon.setAttribute('src', '');
  botIcon.style.display = 'none';       
}

// Send message to backend
function sendToChatGPT(voiceInput) {
  console.log("Inside sendToChatGPT");
  console.log(voiceInput);
  const apiUrl = 'https://pytestar.azurewebsites.net/chat';
  const headers = {
    'Content-Type': 'application/json',
  };

  const personaElement = document.getElementById('persona-text');
  const persona = personaElement ? personaElement.value.replace(/[^a-zA-Z0-9 ,\.]/g, '') : '';

  const data = {
    user_input: voiceInput,
    system_data: persona,
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(result => {
    const chatGPTResponse = result.response;
    const emotion = result.emotion.label;

    addbotMessage(chatGPTResponse, emotion);
    startSpeaking(chatGPTResponse, emotion);
  })
  .catch(error => {
    console.error('Error:', error);
    resetUIAfterSpeaking();

  });
}