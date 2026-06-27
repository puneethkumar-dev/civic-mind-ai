import { useState, useEffect, useCallback, useRef } from 'react';
import { isSpeechSupported, createSpeechRecognition } from '../services/speechService';

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const supported = isSpeechSupported();

  useEffect(() => {
    if (!supported) return;

    try {
      const rec = createSpeechRecognition();
      
      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission blocked by browser.');
        } else {
          setError(`Speech capture failure: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } catch (err) {
      console.error('Speech service instantiation failed:', err);
      setError(err.message);
    }
  }, [supported]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    supported,
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
