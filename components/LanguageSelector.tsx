import { ArrowLeftRight, Check } from "@tamagui/lucide-icons";
import {
  SUPPORTED_SOURCE_LANGUAGE,
  SUPPORTED_TARGET_LANGUAGE,
} from "constants/Language";
import { useAppStore } from "store/appStore";

import { Adapt, Button, Select, Sheet, XStack, YStack } from "tamagui";

const TargetLanguageSelector = () => {
  const { targetLanguage, setTargetLanguage } = useAppStore();

  return (
    <Select
      value={targetLanguage}
      onValueChange={(e) => {
        setTargetLanguage(
          SUPPORTED_TARGET_LANGUAGE.find((i) => i.name.toString() === e)
            ?.iso_code + ""
        );
      }}
      defaultValue={targetLanguage}
    >
      <Select.Trigger>
        <Select.Value placeholder="Target Language" />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport minWidth={200}>
          {SUPPORTED_TARGET_LANGUAGE.map((language, index) => (
            <Select.Item
              index={index}
              key={language.id}
              value={language.name.toString()}
            >
              <Select.ItemText>{language.name}</Select.ItemText>
              <Select.ItemIndicator marginLeft="auto">
                <Check size={16} />
              </Select.ItemIndicator>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

export default function LanguageSelector() {
  const {
    sourceLanguage,
    targetLanguage,
    setSourceLanguage,
    setTargetLanguage,
    setTextToSpeechSourceLanguage,
  } = useAppStore();

  const swapLanguages = () => {
    let temp = targetLanguage;
    setTargetLanguage(sourceLanguage);
    setSourceLanguage(temp);
  };

  return (
    <XStack flex={1} gap="$2" alignItems="flex-start">
      {/* Source Language */}
      <YStack flex={1}>
        <Select
          value={sourceLanguage}
          defaultValue={sourceLanguage}
          onValueChange={(e) => {
            setSourceLanguage(
              SUPPORTED_SOURCE_LANGUAGE.find((i) => i.name.toString() === e)
                ?.iso_code + ""
            );
            setTextToSpeechSourceLanguage(
              SUPPORTED_SOURCE_LANGUAGE.find((i) => i.name.toString() === e)
                ?.iso_code2 + ""
            );
          }}
          disablePreventBodyScroll
        >
          <Select.Trigger>
            <Select.Value placeholder="Source Language" />
          </Select.Trigger>

          <Adapt when="sm" platform="touch">
            <Sheet
              modal
              dismissOnSnapToBottom
              animationConfig={{
                type: "spring",
                damping: 20,
                mass: 1.2,
                stiffness: 250,
              }}
            >
              <Sheet.Frame>
                <Sheet.ScrollView>
                  <Adapt.Contents />
                </Sheet.ScrollView>
              </Sheet.Frame>
              <Sheet.Overlay
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              />
            </Sheet>
          </Adapt>

          <Select.Content zIndex={200000}>
            <Select.Viewport minWidth={200}>
              {SUPPORTED_SOURCE_LANGUAGE.map((language, index) => (
                <Select.Item
                  index={index}
                  key={language.id}
                  value={language.name}
                >
                  <Select.ItemText>{language.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select>
      </YStack>

      <Button onPress={swapLanguages}>
        <ArrowLeftRight />
      </Button>

      {/* Target Language */}
      <YStack flex={1}>
        <TargetLanguageSelector />
      </YStack>
    </XStack>
  );
}
