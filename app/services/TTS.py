from google import genai
from google.genai import types
import wave
import os

client = genai.Client()

def wave_file(filename, pcm, channels=1, rate=24000, sample_width=2):
    """Set up the wave file to save the output"""
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)

async def text_to_speech(text: str, output_filename: str = "tts.wav") -> str:
    """
    Convert text to speech using Gemini TTS
    
    Args:
        text (str): Text to convert to speech
        output_filename (str): Output WAV file name
    
    Returns:
        str: Path to the generated WAV file
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name='Zephyr',
                        )
                    )
                ),
            )
        )
        
        # Extract audio data
        audio_data = response.candidates[0].content.parts[0].inline_data.data
        
        # Save as WAV file
        wave_file(output_filename, audio_data)
        os.rename(output_filename, os.path.join("frontend/public", output_filename))
        return os.path.join("frontend/public", output_filename)
        
    except Exception as e:
        print(f"Error generating TTS: {e}")
        raise e