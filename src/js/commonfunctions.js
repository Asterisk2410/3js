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

    // Reset UI after recording/speaking
    resetUIAfterSpeaking = () => {
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

    // add bot message template in message body
    addbotMessage = (text, sender) => {
        const date = new Date();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const str_time = hour + ":" + minute;
        const senderClass = sender === 'user' ? 'justify-content-end' : 'justify-content-start';
        const msgContainerClass = sender === 'user' ? 'msg_cotainer_send' : 'msg_cotainer';
        const imgSrc = 'src/static/images/drs_bot.png';
      
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
  
    playAnimation(animationName, emotion) {   
      this.animationState = animationName
      let talkingAction, idleAction
      this.animation.forEach((clip1) => {
        if(clip1.name === "Talking Key"){
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
                console.log("Idle 1 idle crossfade")
              this.crossfade(talkingAction,idleAction, 0.5); // Adjust the duration as needed
              // this.mixer.clipAction(clip.optimize()).play()    
            }
            if(clip.name === "Lip"){
              this.mixer.clipAction(clip.optimize()).stop()    
              console.log("Lip idle stop")
            }
            if(clip.name === "Talking Key"){
              // this.mixer.clipAction(clip.optimize()).stop()    
              console.log("Talking Key idle stop")
            }
            if(clip.name === "Happy"){
              this.mixer.clipAction(clip.optimize()).stop()    
              console.log("Happy idle stop")
            }
            if(clip.name === "Neutral"){
              this.mixer.clipAction(clip.optimize()).stop()    
              console.log("Neutral idle stop")
            }
          }); 
        }
      } if (animationName === "talk"){
        if (this.mixer) {
          this.animation.forEach((clip) => {
            if(clip.name === "Idle 1"){
                console.log("Idle 1 stop")
                // this.mixer.clipAction(clip.optimize()).stop()    
            }
            if(clip.name === "Lip"){
                this.mixer.clipAction(clip.optimize()).play()    
                console.log("Lip/Talking Key stop")
            }
            if(clip.name === "Talking Idle"){
              this.mixer.clipAction(clip.optimize()).stop() 
              //this.mixer.clipAction(clip.optimize()).play()  
                // this.crossfade(idleAction,talkingAction, 0.5); // Adjust the duration as needed
                // console.log("Talking Idle crossfade")
            }
            if(clip.name === "Talking Key"){
              // this.mixer.clipAction(clip.optimize()).stop()    
              // console.log("Happy stop")
              this.crossfade(idleAction,talkingAction, 0.5); // Adjust the duration as needed
              console.log("Talking Key crossfade")
            }
            if(clip.name === "Neutral"){
              this.mixer.clipAction(clip.optimize()).stop()    
              console.log("Neutral stop")
            }   
          }); 
        }
      }
      
    }
  
    
  
   
    sendToChatGPT(voiceInput) {    
        console.log("inside")
        
        const apiUrl = 'https://pytestar.azurewebsites.net/chat';
        const headers = {
          'Content-Type': 'application/json',
        };
        
        // const persona = document.getElementById('persona-text').value.replace(/[^a-zA-Z0-9 ,\.]/g, '');
  
        const data = {
          "user_input": voiceInput,
        //   "system_data": persona,
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
          this.resetUIAfterSpeaking();
        });      
    }   
    
    stopSpeaking(){
      if(this.player){      
        this.player.pause();
      }
    }
    
    // startSpeaking(chatGPTResponse, emotion){
    //   const pattern = /\[([^\]]*)\]/g;
    // //   const resText = document.getElementById('responseText');
    // //   const selectedVoice = speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural'; // Customize if needed
    //   // Process and use the chatGPTResponse as needed
    //   const lengthyStatement = "Your lengthy statement here...";
    //   this.player = null;
    //   this.audioConfig = null;
    //   this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
    //   const cleanResponse = chatGPTResponse.replace(pattern, '');    
    //   this.addMessage('assistant', cleanResponse);
    //   const maxLength = 150; // Max length of each chunk (adjust as needed)
    //   let chunks = [];
    //   let startIndex = 0;
    //   let modelAnimation = this.animation;
    //   let mixer = this.mixer
      
    //   // Event handler for when speech synthesis starts
      
    //   this.synthesizer.speakTextAsync(cleanResponse, result => {
    //     this.audioContext.decodeAudioData(result.audioData, buffer => {
    //       // Create a new BufferSourceNode for each playback
    //       this.bufferSource = this.audioContext.createBufferSource();
    //       this.bufferSource.buffer = buffer;
          
    //       // Event listener for when playback ends
    //       this.bufferSource.onended = function() {
    //         this.speechState = "end";
    //         window.console.log("playback finished"); 
    //         console.log("This is onEnd");  
    //         this.playAnimation('idle',emotion); 
    //         const botIcon = document.querySelector('#botIcon');
    //         const recBtn6 = document.getElementById('Speaking');
    //         recBtn6.style.display = 'none';
    //         botIcon.setAttribute('src','')      
    //         botIcon.style.display = 'none'     
            
    //       }.bind(this);
          
    //       // Connect and start playback
    //       this.bufferSource.connect(this.audioContext.destination);
    //       this.playAnimation('talk', emotion);
    //       this.addbotMessage(cleanResponse, 'assistant');
    //       this.bufferSource.start(0);
    //     //   const speechActiveState = document.getElementById('speechActiveState');
    //     //   speechActiveState.value = "0"
    //       this.speechState = "speaking";
    //       window.console.log("playback started");        
    //       const recBtn3 = document.getElementById('recording');
    //       const recBtn4 = document.getElementById('waiting');
    //       const recBtn5 = document.getElementById('Speaking');
    //       recBtn3.style.display = 'none';
    //       recBtn4.style.display = 'none';
    //       recBtn5.style.display = 'block';
    //       const botIcon1 = document.querySelector('#botIcon');
    //       botIcon1.style.display = 'inline-block' 
    //       botIcon1.setAttribute('src','./static/images/Speaking.gif')  
    //     });
    //   }, error => {
    //     console.error('Speech synthesis error:', error);      
    //     // Handle error
    //   });    
    // }   

    startSpeaking(chatGPTResponse, emotion){
      const pattern = /\[([^\]]*)\]/g;
      // const resText = document.getElementById('responseText');
      // const selectedVoice = document.getElementById('selected-voice');
      // Process and use the chatGPTResponse as needed
      const lengthyStatement = "Your lengthy statement here...";
      this.player = null;
      this.audioConfig = null;
      this.player = new SpeechSDK.SpeakerAudioDestination();
      this.audioConfig  = SpeechSDK.AudioConfig.fromSpeakerOutput(this.player);
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
      speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
      this.synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig,this.audioConfig);
      const cleanResponse = chatGPTResponse.replace(pattern, '');    
      const maxLength = 150; // Max length of each chunk (adjust as needed)
      let chunks = [];
      let startIndex = 0;
      let modelAnimation = this.animation;
      let mixer = this.mixer
      
      // Event handler for when speech synthesis starts
      
   
      //this.synthesizer.speakTextAsync(cleanResponse);
      this.synthesizer.speakTextAsync(
        cleanResponse,
        (result) => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                console.log("Speech synthesis completed.");
                console.log("This is onStart");       
                
            } else {
                console.error("Speech synthesis canceled or failed: " + result.errorDetails);
            }
            // Close the synthesizer after synthesis completes or fails
            this.synthesizer.close();
        },
        (err) => {
            console.error("Error during speech synthesis: " + err);
            // Close the synthesizer if an error occurs
            this.synthesizer.close();
        }
    ); 
  
    this.player.onAudioStart = (_) => {    
      // resText.innerHTML = cleanResponse;
      this.addbotMessage(cleanResponse, 'assistant');
      window.console.log("playback started");
      this.playAnimation('talk', emotion);
      const recBtn3 = document.getElementById('recording');
      const recBtn4 = document.getElementById('waiting');
      const recBtn5 = document.getElementById('Speaking');
      recBtn3.style.display = 'none';
      recBtn4.style.display = 'none';
      recBtn5.style.display = 'block';
      const botIcon1 = document.querySelector('#botIcon');
      botIcon1.style.display = 'inline-block' 
      botIcon1.setAttribute('src','./src/static/images/Speaking.gif')  
    };
    this.player.onAudioEnd = (_) => {
      
      window.console.log("playback finished"); 
      console.log("This is onEnd");  
      this.playAnimation('idle',emotion); 
      const botIcon = document.querySelector('#botIcon');
      const recBtn6 = document.getElementById('Speaking');
      recBtn6.style.display = 'none';
      botIcon.setAttribute('src','')      
      botIcon.style.display = 'none'   
      
    };
     
    }
  }