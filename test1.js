import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';
import CommonFunctions from './common-functions.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const fov = 60; // Field of view in degrees
const aspectRatio = window.innerWidth / window.innerHeight;
const near = 0.1; // Near clipping plane
const far = 1000; // Far clipping plane
const camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; //added contrast for filmic look
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding; //extended color space for the hdr

 
//renderer.physicallyCorrectLights = true
document.body.appendChild(renderer.domElement);
let speech = null
let mixer
let background
let hasEnabledVoice = false;
let botAnimation
let wakeLock = null;
const clock = new THREE.Clock()
// Load GLB file
const loader = new GLTFLoader();
const loading = document.getElementById('loading-icon');
const botIcon = document.querySelector('#botIcon');
const recordingArea = document.getElementById('recording-area'); 

const recBtn3 = document.getElementById('recording');
const recBtn = document.querySelector('#recBtn');
const resText = document.getElementById('responseText');
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription("cc2d2316e8a84c04a6045403ab7d3762", "eastus");
const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig);
loading.style.display = "block"
recBtn3.innerHTML = "Recording start";

const requestWakeLock = async () => {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
    }
}

if ('wakeLock' in navigator) {
    // The Wake Lock API is supported
    requestWakeLock();

    document.addEventListener('visibilitychange', async () => {
        if (wakeLock !== null && document.visibilityState === 'visible') {
            await requestWakeLock();
        }
    });

    // Optionally, handle unloading of the page
    window.addEventListener('unload', async () => {
        if (wakeLock !== null) {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake Lock is released');
        }
    });

} else {
    console.warn('Wake Lock API is not supported by this browser');
}

const hdriLoader = new RGBELoader();
hdriLoader.load(
    './assets/snowy_forest_path_01_1K.hdr',
    function (texture) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.background = envMap; //this loads the envMap for the background
        scene.environment = envMap; //this loads the envMap for reflections and lighting
        loading.style.display = "none";
        alertBox()
        texture.dispose(); //we have envMap so we can erase the texture
        pmremGenerator.dispose(); //we processed the image into envMap so we can stop this
    },
    undefined,
    function (error) {
        console.error('An error occurred while loading the HDR file:', error);
    }
);

avatarSelector.addEventListener('change', (event) => {
    recBtn3.innerHTML = "Recording start";
    recBtn.style.display = 'inline-block';
    const selectedAvatar = event.target.value;      
    avatarSelector.disabled = true; 
    recordingArea.style.display = "none"
    responseTextArea.style.display = "none"
    if(speech){
        speech.stopSpeaking();
    }    
    botResponseUIReset();
    if(selectedAvatar != 0){        
        loading.style.display = "block"
        // Prevent the default action of the anchor tag
        while (parentObject.children.length) {
            parentObject.remove(parentObject.children[0]);
        }
        event.preventDefault();
        parentObject.add(background);
        avatarLoader(selectedAvatar)
    }        
});

avatarVoiceSelector.addEventListener('change', (event) => {
    const selectedAvatar = event.target.value;   
    if(selectedAvatar != 0){
        selectedVoice.innerHTML = selectedAvatar
    }        
});

const recognizeSpeech = () => {
    recognizer.recognizeOnceAsync(result => {
        if (result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
            console.log(`Recognized: ${result.text}`); 
            resText.innerHTML = `Question : ${result.text}`;  
            recBtn.style.display = 'none';
            const recBtn4 = document.getElementById('waiting');
            const recBtn5 = document.getElementById('Speaking');
            recBtn3.style.display = 'none';
            recBtn4.style.display = 'block';
            recBtn5.style.display = 'none';    
            const botIcon = document.querySelector('#botIcon');
            botIcon.setAttribute('src','')      
            botIcon.style.display = 'none'            
            speech.sendToChatGPT(result.text)            
        } else if (result.reason === SpeechSDK.ResultReason.NoMatch) {
            console.log("No speech recognized. Trying again...");
            recBtn3.innerHTML = "Not Recognized, Try again"
            recognizeSpeech(); // Call the function again if recognition fails
        } else {
            console.error(`Recognition failed: ${result.errorDetails}`);
        }
    });
}



recBtn.addEventListener('click', () => {         
    console.log('Recording button clicked!');       
    recBtn3.innerHTML = "Recording start";
    if(speech.animationState){
        if(speech.animationState !== "idle"){
            speech.playAnimation("idle", null)
        }
        speech.stopSpeaking();    
    }
    
    botResponseUIReset();           
       
    const botIcon = document.querySelector('#botIcon');
    botIcon.setAttribute('src','./src/images/Hearing.gif')      
    botIcon.style.display = 'block'   
    
    const recBtn4 = document.getElementById('waiting');
    const recBtn5 = document.getElementById('Speaking');
    recBtn3.style.display = 'inline-block';
    recBtn4.style.display = 'none';
    recBtn5.style.display = 'none'; 
    recBtn.style.display = 'none'      
    recognizeSpeech();
});  


const botResponseUIReset = () => {
    resText.innerHTML = "";
    if(speechSynthesis){
        speechSynthesis.cancel();
    }      
    const recBtn4 = document.getElementById('waiting');
    const recBtn5 = document.getElementById('Speaking'); 
    const botIcon = document.querySelector('#botIcon'); 
    recBtn3.style.display = 'none';
    recBtn4.style.display = 'none';
    recBtn5.style.display = 'none';     
    botIcon.setAttribute('src','')     
    botIcon.style.display = 'none'       
}

function avatarLoader(avatar){
    loader.load('./assets/'+avatar+'.glb', function (gltf) {
        const charactor = gltf.scene;
        gltf.scene.traverse((object) => {
            object.frustumCulled = false;
        });
        charactor.position.z = 0;
        // Move the model down along the y-axis
        charactor.position.y = -1; // Adjust this value as needed
        parentObject.add(charactor);
        loading.style.display = "none"
        recordingArea.style.display = "block"
        responseTextArea.style.display = "block"
        avatarSelector.disabled = false; 
        mixer = new THREE.AnimationMixer(charactor);
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
        speech.animationState = "idle"
    }, undefined, function (error) {
        console.error('Error loading GLB model:', error);
    });
}

function getAvatarVoices() {    
    console.log("inside voice")
    
    const apiUrl = 'https://azure-ai-api.azurewebsites.net/voicelist';
    const headers = {
      'Content-Type': 'application/json',
    };
    
    fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    })
    .then(response => response.json())
    .then(result => {
        const finalVoice = result.filter(voice => voice.Locale === "en-US");
        selectedVoice.innerHTML = finalVoice[0].ShortName
        finalVoice.forEach(voice => {
            const optionElement = document.createElement("option");
            optionElement.value = voice.ShortName;
            optionElement.text = voice.DisplayName;
            avatarVoiceList.appendChild(optionElement);
        });
    })
    .catch(error => {
      console.error('Error:', error)      
    });      
} 

getAvatarVoices()

camera.position.set(0, 0.5, 2);
camera.lookAt(0, 0, 0);

// Render loop
function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        const delta = clock.getDelta()
        mixer.update(delta)
    }
    renderer.render(scene, camera);
}
animate();
