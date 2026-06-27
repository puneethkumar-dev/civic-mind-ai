const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const isSpeechSupported = () => {
  return typeof SpeechRecognition !== 'undefined';
};

export const createSpeechRecognition = () => {
  if (!isSpeechSupported()) {
    throw new Error('Web Speech Recognition API is not supported by this browser.');
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  return recognition;
};
