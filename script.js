const umandanify = (sentence, enableEReplacement = false) => {
    let vocal = false;
    let result = "";
    
    for (let i = 0; i < sentence.length; i++) {
        const letter = sentence[i];
        const nextLetter = i + 1 < sentence.length ? sentence[i + 1] : null;
    
        if (letter === ' ') {
            result += letter + "| ";
            vocal = false;
            continue;
        } else if ("aiueoAIUEO".includes(letter)) {
            vocal = true;
            result += letter;
        } else if ("bcdfghjklmnpqrstvwxyz".includes(letter.toLowerCase())) {
            result += letter;
            
            if (nextLetter && letter.match(/n/i) && nextLetter.match(/g|y/i)) {
                result += "";
            } else if (nextLetter && !("aiueoAIUEO".includes(nextLetter))) {
                result += " ";
            }
        } else {
            result += " " + letter + " ";
            vocal = false;
            continue;
        }
    
        if (vocal) {
            result += " ";
            vocal = false;
            continue;
        }
    }

    const ss = result.replace(/\s+/g, " ");
    result = "";
    for (const s of ss.split(" ")) {
        if (s.length === 3 && s.slice(0, 2) !== "ng" && s.slice(0, 2) !== "ny") {
            result += s[0] + s.slice(1);
        } else if (s.length === 4 && s.slice(0, 2) === "ng") {
            result += s.slice(0, 2) + s.slice(2);
        } else if (s.length === 4 && s.slice(1, 4) === "nya") {
            result += s[0] + s.slice(1);
        } else if (s.length === 4 && s.slice(1, 4) !== "nya") {
            result += s[0] + s[1] + s.slice(2);
        } else {
            result += s;
        }
        result += " ";
    }
    
    result = result.replace(/i/g, "ipri")
        .replace(/e/g, "epre")
        .replace(/o/g, "opro")
        .replace(/u/g, "upru")
        .replace(/a/g, "aiden")
        .replace(/I/g, "Ipri")
        .replace(/E/g, "Epre")
        .replace(/O/g, "Opro")
        .replace(/U/g, "Upru")
        .replace(/A/g, "Aiden")
        .replace(/ (\w) /g, " $1es ")
        .replace(/^(\w) /g, "$1es ")
        .replace(/ ng /g, " strengen ")
        .replace(/\|/g, "")
        .replace(/\s+/g, " ")
        .replace(/^ | $/g, "")
        .replace(/ ([^\w])/g, "$1");

    if (enableEReplacement) {
        result = result.replace(/a/g, "à")
            .replace(/e/g, "è")
            .replace(/u/g, "ù")
            .replace(/A/g, "À")
            .replace(/E/g, "È")
            .replace(/U/g, "Ù")
    }

    return result;
};

const deumandanify = (sentence) => {
    sentence = sentence.replace(/à/g, "a")
        .replace(/è/g, "e")
        .replace(/ù/g, "u")
        .replace(/À/g, "A")
        .replace(/È/g, "E")
        .replace(/Ù/g, "U")

    return sentence
        .replace(/(iden|pre|pru|pro|pri)/gi, '')
        .replace(/(strengen)/gi, 'ng')
        .replace(/(.)(es)/gi, '$1');
};

const textToSpeech = async ({ text, voice }) => {
    const requestOptions = {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SoundOfTextClient',
        },
        body: JSON.stringify({ engine: 'Google', data: { text, voice } }),
    };

    try {
        const response = await fetch(`https://api.soundoftext.com/sounds`, requestOptions);
        if (!response.ok) {
            throw new Error('Error during API request');
        }

        const { id } = await response.json();
        await playAudio(id);
    } catch (error) {
        console.error('Error during text-to-speech:', error);
        playFallback();
    }
};

const playAudio = async (id, timeout = 1000) => {
    try {
        const audio = new Audio(`https://files.soundoftext.com/${id}.mp3`);
        await audio.play();

        return new Promise(resolve => {
            audio.onended = () => resolve();
            setTimeout(() => resolve(), timeout);
        });
    } catch (error) {
        console.error('Error during audio playback:', error);
        playFallback();
    }
};
  
const playFallback = () => {
    const utterance = new SpeechSynthesisUtterance(outputTextArea.value);
    utterance.lang = 'fr-FR';
    speechSynthesis.speak(utterance);
};

document.addEventListener("DOMContentLoaded", () => {
    const inputTextArea = document.getElementById("inputTextArea");
    const outputTextArea = document.getElementById("outputTextArea");
    const umandanaToggle = document.getElementById("umandana");
    const deumandanaToggle = document.getElementById("deumandana");
    const enableGrave = document.getElementById("enableGrave");
    const speakButton = document.getElementById("speakButton");

    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    const clipboard = new ClipboardJS(outputTextArea);
    clipboard.on('success', function(e) {
        toastr.success('Tepre res saiden lipri nes!')
        e.clearSelection();
    });

    clipboard.on('error', function(e) {
        console.error('Unable to copy text to clipboard', e);
    });

    function translateText() {
        const inputText = inputTextArea.value;
        const enableEReplacement = enableGrave.checked;

        let translatedText = "";

        if (umandanaToggle.checked) {
            translatedText = umandanify(inputText, enableEReplacement);
        } else if (deumandanaToggle.checked) {
            translatedText = deumandanify(inputText);
        }

        outputTextArea.value = translatedText;
    }

    inputTextArea.addEventListener("input", translateText);
    umandanaToggle.addEventListener("change", translateText);
    deumandanaToggle.addEventListener("change", translateText);
    enableGrave.addEventListener("change", translateText);

    speakButton.addEventListener('click', () => {
        const outputText = outputTextArea.value;
        const selectedVoice = 'fr-FR';

        textToSpeech({ text: outputText, voice: selectedVoice });
    });
});