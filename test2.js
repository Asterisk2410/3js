export default class CommonFunctions {
    chatResponse; 
    constructor(mixer, animation) {
        this.mixer = mixer;  
        this.synthesizer = null;    
        this.animation = animation;   
        this.player = null
        this.audioConfig  = null
        this.animationState = null
        this.conversationHistory = []
        this.speechState = null
        this.audioContext = new AudioContext();
        this.bufferSource = null
        this.speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
        this.audioStream = SpeechSDK.PullAudioOutputStream.create();
        this.audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(this.audioStream);
        this.synthesizer = new SpeechSDK.SpeechSynthesizer(this.speechConfig, this.audioConfig);
    }  
  
  addMessage(role, content) {
      this.conversationHistory.push({ role, content });
    }
    crossfade(fromAction, toAction, duration) {
      fromAction.fadeOut(0.5);
      toAction.reset().fadeIn(0.5).play();
    }
  
     playAnimation(animationName, emotion) {   
      this.animationState = animationName
      let talkingAction, idleAction
      this.animation.forEach((clip1) => {
        if(clip1.name === "Talking Idle"){
            talkingAction = this.mixer.clipAction(clip1.optimize());
        }      
      });  
      this.animation.forEach((clip2) => {
          if(clip2.name === "Idle 1"){
            idleAction = this.mixer.clipAction(clip2.optimize());
          }      
      }); 
      if(animationName === "idle"){
        if (this.mixer) {
          this.animation.forEach((clip) => {
            if(clip.name === "Idle 1"){           
              this.crossfade(talkingAction,idleAction, 0.5); // Adjust the duration as needed
              //this.mixer.clipAction(clip.optimize()).play()    
            }
            if(clip.name === "Lip"){
              this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Talking Idle"){
              //this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Happy"){
              this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Neutral"){
              this.mixer.clipAction(clip.optimize()).stop()    
            }
          }); 
        }
      } if (animationName === "talk"){
        if (this.mixer) {
          this.animation.forEach((clip) => {
            if(clip.name === "Idle 1"){
              //this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Lip"){
              this.mixer.clipAction(clip.optimize()).play()    
            }
            if(clip.name === "Talking Idle"){
              //this.mixer.clipAction(clip.optimize()).play()  
              this.crossfade(idleAction,talkingAction, 0.5); // Adjust the duration as needed
            }
            if(clip.name === "Happy"){
              this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Neutral"){
              this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === emotion){
              this.mixer.clipAction(clip.optimize()).play() 
            }         
          }); 
        }
      }
      
    }
  
    
  
   
    sendToChatGPT(voiceInput) {    
        console.log("inside")
        
        const apiUrl = 'https://azure-ai-api.azurewebsites.net/chat';
        const headers = {
          'Content-Type': 'application/json',
        };
        
        /*
        const data = {
          "user_input": voiceInput,
          "system_data" : "You are an AI assistant that helps people find information, In accenture we have some policies and guidelines to follow to maintain the company reputation. you should not tell any company policy related questions. You always says thank you in the end of the response"
        };
        */
  
        /*
        const data = {
          "user_input": voiceInput,
          "system_data": "should not give any information about accenture policy. always says thank you in the end"
        };
        */
        const persona = document.getElementById('persona-text').value.replace(/[^a-zA-Z0-9 ,\.]/g, '');
  
        const data = {
          "user_input": voiceInput,
          "system_data": persona,
          "data_index": "gtic-index-final",
          "assistant": this.conversationHistory
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
          this.startSpeaking(chatGPTResponse,emotion);    
          const recBtn = document.querySelector('#recBtn');
          recBtn.style.display = 'inline-block'            
        })
        .catch(error => {
          const speechActiveState = document.getElementById('speechActiveState');
          speechActiveState.value = "0"
          console.error('Error:', error)
          const recBtn = document.querySelector('#recBtn');
          recBtn.style.display = 'inline-block'         
          const botIcon = document.querySelector('#botIcon');
          const recBtn3 = document.getElementById('recording');
          const recBtn4 = document.getElementById('waiting');
          const recBtn5 = document.getElementById('Speaking');
          recBtn3.style.display = 'none';
          recBtn4.style.display = 'none';
          recBtn5.style.display = 'none';
          botIcon.setAttribute('src','')      
          botIcon.style.display = 'none'     
        });      
    }   
    
    stopSpeaking(){
      if(this.bufferSource){      
        this.bufferSource.stop();
      }
    }
    
    startSpeaking(chatGPTResponse, emotion){
      const pattern = /\[([^\]]*)\]/g;
      const resText = document.getElementById('responseText');
      const selectedVoice = document.getElementById('selected-voice');
      // Process and use the chatGPTResponse as needed
      const lengthyStatement = "Your lengthy statement here...";
      this.player = null;
      this.audioConfig = null;
      this.speechConfig.speechSynthesisVoiceName = selectedVoice.innerText;
      const cleanResponse = chatGPTResponse.replace(pattern, '');    
      this.addMessage('assistant', cleanResponse);
      const maxLength = 150; // Max length of each chunk (adjust as needed)
      let chunks = [];
      let startIndex = 0;
      let modelAnimation = this.animation;
      let mixer = this.mixer
      
      // Event handler for when speech synthesis starts
      
      this.synthesizer.speakTextAsync(cleanResponse, result => {
        this.audioContext.decodeAudioData(result.audioData, buffer => {
          // Create a new BufferSourceNode for each playback
          this.bufferSource = this.audioContext.createBufferSource();
          this.bufferSource.buffer = buffer;
          
          // Event listener for when playback ends
          this.bufferSource.onended = function() {
            this.speechState = "end";
            window.console.log("playback finished"); 
            console.log("This is onEnd");  
            this.playAnimation('idle',emotion); 
            const botIcon = document.querySelector('#botIcon');
            const recBtn6 = document.getElementById('Speaking');
            recBtn6.style.display = 'none';
            botIcon.setAttribute('src','')      
            botIcon.style.display = 'none'     
            
          }.bind(this);
          
          // Connect and start playback
          this.bufferSource.connect(this.audioContext.destination);
          this.playAnimation('talk', emotion);
          this.bufferSource.start(0);
          const speechActiveState = document.getElementById('speechActiveState');
          speechActiveState.value = "0"
          this.speechState = "speaking";
          resText.innerHTML = cleanResponse;
          window.console.log("playback started");        
          const recBtn3 = document.getElementById('recording');
          const recBtn4 = document.getElementById('waiting');
          const recBtn5 = document.getElementById('Speaking');
          recBtn3.style.display = 'none';
          recBtn4.style.display = 'none';
          recBtn5.style.display = 'block';
          const botIcon1 = document.querySelector('#botIcon');
          botIcon1.style.display = 'inline-block' 
          botIcon1.setAttribute('src','./src/images/Speaking.gif')  
        });
      }, error => {
        console.error('Speech synthesis error:', error);      
        // Handle error
      });    
    }   
  }