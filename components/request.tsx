import axios from "axios";
import { sampleAudioTestingData } from "constants/test";

interface Props {
  srcLang: string;
  distLang: string;
  audioContent: any;
  inputSource?: string;
}

const USER_ID = "3bad217290724daba7881b9a6e2be5da";
const ULCA_API_KEY = "5744df735d-e00a-4deb-b47c-8fd786cdda37";
const PIPELINE_MODEL_ID = "64392f96daac500b55c543cd";

async function processLanguagePipeline({
  srcLang,
  distLang,
  audioContent,
  inputSource,
}: Props) {
  try {
    // First API Call to get the pipeline configuration
    const firstApiResponse = await axios.post(
      "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
      {
        pipelineTasks: [
          // {
          //   taskType: "asr",
          //   config: {
          //     language: {
          //       sourceLanguage: srcLang,
          //     },
          //   },
          // },

          // Below two are working
          // -----------------------------

          {
            taskType: "translation",
            config: {
              language: {
                sourceLanguage: srcLang,
                targetLanguage: distLang,
              },
            },
          },
          {
            taskType: "tts",
            config: {
              language: {
                sourceLanguage: distLang,
              },
            },
          },
          // -----------------------------
        ],
        pipelineRequestConfig: {
          pipelineId: "64392f96daac500b55c543cd",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          userID: USER_ID, // Replace with your userID
          ulcaApiKey: ULCA_API_KEY, // Replace with your ulcaApiKey
        },
      }
    );

    // NMT - Text to Text translation API is working now need to figure out Speech to Text API

    const responseData = firstApiResponse.data;

    console.log({
      firstApiResponse: responseData,
    });

    // return null;

    // Construct the new request payload for the second API call
    const newRequestPayload = {
      pipelineTasks: [
        // {
        //   taskType: "asr",
        //   config: {
        //     language: {
        //       sourceLanguage: srcLang, // Replace with the actual source language
        //     },
        //     serviceId:
        //       responseData.pipelineResponseConfig[0].config[0].serviceId,
        //     // encoding: "base64",
        //     audioFormat: "wav",
        //     samplingRate: 16000,
        //   },
        // },

        // Below two are working
        // -----------------------------

        {
          taskType: "translation",
          config: {
            language: {
              sourceLanguage: srcLang,
              targetLanguage: distLang,
            },
            serviceId:
              responseData.pipelineResponseConfig[0].config[0].serviceId,
          },
        },
        {
          taskType: "tts",
          config: {
            language: {
              sourceLanguage: distLang, // Replace with the actual source language
            },
            serviceId:
              responseData.pipelineResponseConfig[1].config[0].serviceId, // Replace with correct index if needed
            gender: "male",
          },
        },
      ],
      inputData: {
        input: [
          {
            source: inputSource,
          },
        ],
        // audio: [
        //   {
        //     // audioContent: sampleAudioTestingData.audioContent, // Replace with actual base64 content
        //     audioContent, // Replace with actual base64 content
        //   },
        // ],
      },
    };

    console.log({
      newRequestPayload,
    });

    // Second API Call using the response data from the first call
    const secondApiResponse = await axios.post(
      // "https://dhruva-api.bhashini.gov.in/services/inference/asr",
      firstApiResponse.data.pipelineInferenceAPIEndPoint.callbackUrl,
      newRequestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          [responseData.pipelineInferenceAPIEndPoint.inferenceApiKey.name]:
            responseData.pipelineInferenceAPIEndPoint.inferenceApiKey.value,
        },
      }
    );

    console.log("Second API response", secondApiResponse);

    const base64TTSResponse =
      secondApiResponse.data.pipelineResponse[1].audio[0].audioContent;

    console.log("Second API Response:", secondApiResponse.data);

    return `data:audio/mpeg;base64,${base64TTSResponse}`;
  } catch (error: any) {
    console.error(
      "Error during API calls:",
      error.response ? error.response.data : error.message
    );
  }
}

export { processLanguagePipeline };
