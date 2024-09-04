import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Buffer } from "buffer";

const base64ToArrayBuffer = (base64) => {
  const binaryString = Buffer.from(base64, "base64").toString("binary");
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const generateWaveform = (audioBuffer: any, samples = 100) => {
  const step = Math.floor(audioBuffer.length / samples);
  const waveform: any = [];

  for (let i = 0; i < audioBuffer.length; i += step) {
    waveform.push(audioBuffer[i]);
  }

  return waveform;
};

const Waveform = ({ base64Audio }) => {
  const [waveform, setWaveform] = useState([]);

  useEffect(() => {
    const arrayBuffer = base64ToArrayBuffer(base64Audio);
    const audioBuffer = new Uint8Array(arrayBuffer);
    const waveformData = generateWaveform(audioBuffer);
    setWaveform(waveformData);
  }, [base64Audio]);

  return (
    <View>
      <Svg height="100" width="300">
        <Polyline
          points={waveform
            .map((val, idx) => `${idx * 3},${100 - val}`)
            .join(" ")}
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
};

export default Waveform;
