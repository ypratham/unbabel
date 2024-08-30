import bhashini from "bhashini-translation";
import { processLanguagePipeline } from "components/request";
import { Audio, Audio as ExpoAudio } from "expo-av";
import {
  AndroidAudioEncoder,
  AndroidOutputFormat,
  IOSAudioQuality,
  IOSOutputFormat,
  Recording,
} from "expo-av/build/Audio";
import { useEffect, useState } from "react";
import { useAppStore } from "store/appStore";
import { Button, Text, YStack } from "tamagui";
import * as FileSystem from "expo-file-system";

import Voice, {
  SpeechRecognizedEvent,
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

async function convertToBase64(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader: any = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result.split(",")[1];
      console.log(base64data);
      resolve(base64data);
    };
    reader.onerror = (error) => reject(error);
  });
}

const options = {
  sampleRate: 16000, // default 44100
  channels: 1, // 1 or 2, default 1
  bitsPerSample: 16, // 8 or 16, default 16
  audioSource: 6, // android only (see below)
  wavFile: "test.wav", // default 'audio.wav'
};

export default function TabOneScreen() {
  const { pipelineId, sourceLanguage, targetLanguage } = useAppStore();

  const [recording, setRecording] = useState<Recording>();
  const [permissionResponse, requestPermission] = ExpoAudio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }

      await ExpoAudio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");

      const { recording } = await ExpoAudio.Recording.createAsync(
        // Audio.RecordingOptionsPresets.LOW_QUALITY
        {
          isMeteringEnabled: true,
          android: {
            extension: ".aac",
            outputFormat: AndroidOutputFormat.AAC_ADTS,
            audioEncoder: AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 16000,
          },
          ios: {
            extension: ".caf",
            audioQuality: ExpoAudio.IOSAudioQuality.HIGH,
            sampleRate: 16000, // Set sample rate to 16000 Hz
            numberOfChannels: 1,
            bitRate: 64000, // Appropriate bit rate for 16000 Hz sample rate
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: "audio/webm",
            bitsPerSecond: 64000,
          },
        }
      );

      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);

    console.log("Stopping recording..");

    await recording!.stopAndUnloadAsync();

    const uri = recording!.getURI();
    console.log("Recording stopped and stored at", uri);

    const base64 = await FileSystem.readAsStringAsync(uri!, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // // Convert audio file to Base64
    // const fileUri = recording!.getURI();
    // const base64Audio = await convertToBase64(fileUri);

    const audioResponse = await processLanguagePipeline({
      audioContent: base64,
      distLang: targetLanguage,
      srcLang: sourceLanguage,
    });

    console.log({
      base64,
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
  }

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
      await Voice.start("en-US");
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
  }, []);

  return (
    <YStack f={1} ai="center" gap="$8" px="$10" pt="$5">
      <Button onPress={started ? _destroyRecognizer : _startRecognizing}>
        {recording ? "Stop Recording" : "Start Recording"}
      </Button>

      <Text>{partialResults[0]}</Text>
    </YStack>
  );
}
