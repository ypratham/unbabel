import { create } from "zustand";

interface AppState {
  sourceLanguage: string;
  targetLanguage: string;
  pipelineId: string;
  serviceId: string;
  textToSpeechSourceLanguage: string;
}

interface AppStateActions {
  setSourceLanguage: (sourceLanguage: string) => void;
  setTargetLanguage: (targetLanguage: string) => void;
  updateServiceId: (id: string) => void;
  setTextToSpeechSourceLanguage: (s: string) => void;
}

export const useAppStore = create<AppState & AppStateActions>()((set) => ({
  sourceLanguage: "en",
  textToSpeechSourceLanguage: "",
  targetLanguage: "mr",
  pipelineId: "64392f96daac500b55c543cd",
  serviceId: "",
  setSourceLanguage(sourceLanguage) {
    return set(() => ({
      sourceLanguage,
    }));
  },
  setTargetLanguage(targetLanguage) {
    return set(() => ({
      targetLanguage,
    }));
  },
  updateServiceId(id) {
    return set(() => ({
      serviceId: id,
    }));
  },
  setTextToSpeechSourceLanguage(s) {
    return set(() => ({
      textToSpeechSourceLanguage: s,
    }));
  },
}));
