    // Import necessary modules
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import CommonFunctions from './commonfunctions.js'


    // Basic Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const gltfLoader = new GLTFLoader();
    const loader = new THREE.TextureLoader();
    const clock = new THREE.Clock()
    let botAnimation
    let speech = null
    let mixer
    // speech setup
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
    const chatText = document.getElementById('text');
    const recBtn = document.querySelector('#recBtn');
    const recBtn3 = document.getElementById('recording');
    const sendButton = document.getElementById('send');
    recBtn3.innerHTML = "Recording start";


    // Set renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('scene-container').appendChild(renderer.domElement);

    // // Set background image
    loader.load('./static/images/3d_images.jpg', function(texture) {
        scene.background = texture;
    });

    // Set camera position
    camera.position.set(0, 1, 4);

    // Add lights
    const light = new THREE.AmbientLight(0x9fc5e8, 1.5); // Soft white light
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0x9fc5e8, 0.75);
    directionalLight.position.set(20, 10, 70);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Load GLB model
    gltfLoader.load('./static/model/Camila_new.glb', function(gltf) {
        const character = gltf.scene; // The loaded character
        scene.add(character);
        character.position.set(0.4, 0.5, 2);
        character.scale.set(0.5, 0.5, 0.5);
        character.rotation.set(0, -0.5, 0);

        directionalLight.target = character; 
        directionalLight.target.updateMatrixWorld();

        mixer = new THREE.AnimationMixer(character);
        botAnimation = gltf.animations;   
        botAnimation.forEach((clip) => {
            if(clip.name === "Idle 1"){
                mixer.clipAction(clip.optimize()).play()    
            }
            if(clip.name === "Eye Blink"){
                mixer.clipAction(clip.optimize()).play()    
            }        
        });
        speech = new CommonFunctions(mixer,botAnimation);
        speech.animationState = 'Idle';

        function animate() {
            requestAnimationFrame(animate);
            mixer.update(0.01); // Update the mixer to advance the animation
            renderer.render(scene, camera);
        }

        animate();
    }, undefined, function(error) {
        console.error('GLB model failed to load:', error);
    });


    ////////////////////////////////////////////////////////// Speech Scripts //////////////////////////////////////////////////////////
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
            speech.sendToChatGPT(result.text)              
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
        if(speech.animationState){
        if(speech.animationState !== "Idle 1"){
            speech.playAnimation("Idle 1", null)
        }
        speech.stopSpeaking();
        }
    
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



    ////////////////////////////////////////////////////////// Speech Scripts //////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////// Chat Scripts //////////////////////////////////////////////////////////

    sendButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission
    
        // Get the text from the input field
        const userInput = chatText.value.trim();
    
        // Check if the input field is not empty
        if (userInput !== '') {
            // Add the user input to the message area
            adduserMessage(userInput, 'user');
            if(speech.animationState){
                if(speech.animationState !== "Idle 1"){
                    speech.playAnimation("Idle 1", null)
                }
                speech.stopSpeaking();
            }
    
            // Send the input to the backend
            speech.sendToChatGPT(userInput);
    
            // Clear the input field
            chatText.value = '';

            botResponseUIReset();
        }
    });

    ////////////////////////////////////////////////////////// Chat Scripts //////////////////////////////////////////////////////////

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (mixer) {
            const delta = clock.getDelta()
            mixer.update(delta)
        }
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', function() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
