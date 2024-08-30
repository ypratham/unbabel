import { processLanguagePipeline } from "components/request";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { useAppStore } from "store/appStore";
import { Button, Label, Text, XStack, YStack } from "tamagui";

import Voice, {
  SpeechErrorEvent,
  SpeechRecognizedEvent,
  SpeechResultsEvent,
} from "@react-native-voice/voice";
import LanguageSelector from "components/LanguageSelector";

export default function TabOneScreen() {
  const { sourceLanguage, targetLanguage, textToSpeechSourceLanguage } =
    useAppStore();

  const [recognized, setRecognized] = useState("");
  const [volume, setVolume] = useState("");
  const [error, setError] = useState("");
  const [end, setEnd] = useState("");
  const [started, setStarted] = useState("");
  const [results, setResults] = useState([]);
  const [partialResults, setPartialResults] = useState([]);

  const onSpeechStart = (e: any) => {
    console.log("onSpeechStart: ", e);
    setStarted("√");
  };

  const onSpeechRecognized = (e: SpeechRecognizedEvent) => {
    console.log("onSpeechRecognized: ", e);
    setRecognized("√");
  };

  const onSpeechEnd = (e: any) => {
    console.log("onSpeechEnd: ", e);
    setEnd("√");
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    console.log("onSpeechError: ", e);
    setError(JSON.stringify(e.error));
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    console.log("onSpeechResults: ", e);
    setResults(e.value as any);

    if (e.value) {
      translateSpeechToSpeech(e.value[0]);
    }
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    console.log("onSpeechPartialResults: ", e);
    setPartialResults(e.value as any);
  };

  const onSpeechVolumeChanged = (e: any) => {
    // console.log("onSpeechVolumeChanged: ", e);
    setVolume(e.value);
  };

  const _startRecognizing = async () => {
    _clearState();
    try {
      await Voice.start(textToSpeechSourceLanguage);
      console.log("called start");
    } catch (e) {
      console.error(e);
    }
  };

  const _stopRecognizing = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const _cancelRecognizing = async () => {
    try {
      await Voice.cancel();
    } catch (e) {
      console.error(e);
    }
  };

  const _destroyRecognizer = async () => {
    try {
      await Voice.destroy();
    } catch (e) {
      console.error(e);
    }
    _clearState();
  };

  const _clearState = () => {
    setRecognized("");
    setVolume("");
    setError("");
    setEnd("");
    setStarted("");
    setResults([]);
    setPartialResults([]);
  };

  const translateSpeechToSpeech = async (speechResult) => {
    const audioResponse = await processLanguagePipeline({
      audioContent: "",
      distLang: targetLanguage,
      srcLang: sourceLanguage,
      inputSource: speechResult,
    });

    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync({
        uri: audioResponse!,
      });
      await soundObject.playAsync();
    } catch (error) {
      console.log("Something went wrong playing audio.", error);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [sourceLanguage, targetLanguage]);

  return (
    <YStack f={1} ai="center" gap="$8" px="$3" pt="$5">
      <XStack gap={"$6"}>
        <Button onPress={_destroyRecognizer}>Stop</Button>
        <Button onPress={_startRecognizing}>Start Recognizing</Button>
      </XStack>

      <Text>{results[0]}</Text>

      {/* <LanguageSelector /> */}
    </YStack>
  );
}
