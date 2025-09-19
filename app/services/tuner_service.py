import wave
import os
import tempfile
import random
import asyncio
import subprocess
from pathlib import Path

# Import the tuning functions from the parent directory
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
from app.services.tuner_utils import get_frequency_from_audio, get_note_frequency, tune_audio
from app.services.audio_conversion_utils import convert_audio_to_wav

# Guitar string to note mapping
GUITAR_STRINGS = {
    "1": "E4",  # High E (1st string)
    "2": "B3",  # B (2nd string) 
    "3": "G3",  # G (3rd string)
    "4": "D3",  # D (4th string)
    "5": "A2",  # A (5th string)
    "6": "E2"   # Low E (6th string)
}



async def analyze_tuning(string_num: str, wav_file_path: str) -> dict:
    """
    Analyze tuning for a specific guitar string
    
    Args:
        string_num (str): Guitar string number (1-6)
        wav_file_path (str): Path to WAV audio file (already converted)
    
    Returns:
        dict: Simplified tuning result with tuning_status, string_num, and tuning_finish
    """
    try:
        # Validate string number
        if string_num not in GUITAR_STRINGS:
            raise ValueError(f"Invalid string number: {string_num}. Must be 1-6.")
        
        # Get target note for the string
        target_note = GUITAR_STRINGS[string_num]
        
        # Open and analyze the WAV file (already converted)
        with wave.open(wav_file_path, 'rb') as audio_file:
            tuning_result = tune_audio(audio_file, target_note, tolerance_cents=30)
        
        # Convert tuning status to boolean
        tuning_status = tuning_result.get("tuning_status") == "in tune"
        
        # Check if tuning is finished (string 1 and in tune)
        tuning_finish = (string_num == "1" and tuning_status)
        
        # Get cents difference from the result
        cents_error = tuning_result.get("cents_difference", 0)
        
        # Add debugging information for octave correction
        original_freq = tuning_result.get("original_detected_frequency", 0)
        corrected_freq = tuning_result.get("detected_frequency", 0)
        target_freq = tuning_result.get("target_frequency", 0)
        
        if original_freq != corrected_freq:
            print(f"DEBUG: Octave correction was applied!")
            print(f"DEBUG: Original detected: {original_freq:.2f}Hz")
            print(f"DEBUG: Corrected to: {corrected_freq:.2f}Hz")
            print(f"DEBUG: Target: {target_freq:.2f}Hz")
            print(f"DEBUG: Final cents error: {cents_error}")
        
        # next string to tune (convert string_num to int for math operations)
        string_num_int = int(string_num)
        next_string_num = string_num_int - 1 if tuning_status and string_num_int > 1 else string_num_int
        next_string_num_str = str(next_string_num)
        
        # Return simplified format with cents error
        return {
            "tuning_status": tuning_status,
            "string_num": next_string_num_str,
            "tuning_finish": tuning_finish,
            "cents_error": cents_error
        }
        
    except Exception as e:
        raise Exception(f"Error analyzing tuning: {str(e)}")

def get_random_tuning_audio(string_num: str, tune_status: str) -> str:
    """
    Get a random audio file from the corresponding tuning folder
    
    Args:
        string_num (str): Guitar string number (1-6)
        tune_status (str): Tuning status ("in tune", "too high", "too low")
    
    Returns:
        str: Path to a random audio file from the folder
    """
    try:
        # Convert tune_status to folder format
        folder_status = tune_status.replace(" ", "_")
        
        # Construct folder path
        audio_folder = os.path.join("frontend/public/audio", "tuner", f"string{string_num}_{folder_status}")
        
        # Check if folder exists
        if not os.path.exists(audio_folder):
            raise FileNotFoundError(f"Audio folder not found: {audio_folder}")
        
        # Get all wav files in the folder
        wav_files = [f for f in os.listdir(audio_folder) if f.endswith('.wav')]
        
        if not wav_files:
            raise FileNotFoundError(f"No WAV files found in folder: {audio_folder}")
        
        # Select a random file
        random_file = random.choice(wav_files)
        full_path = os.path.join(audio_folder, random_file)
        
        print(f"Selected random audio: {full_path}")
        return full_path
        
    except Exception as e:
        print(f"Error getting random tuning audio: {e}")
        # Fallback: return None so we can handle gracefully
        return None

async def process_tuning(string_num: str, wav_file_path: str) -> dict:
    """
    Complete tuning process: analyze audio and return random pre-generated audio
    
    Args:
        string_num (str): Guitar string number (1-6)
        wav_file_path (str): Path to WAV audio file (already converted)
    
    Returns:
        dict: Complete tuning result with random audio path
    """
    try:
        # Step 1: Analyze tuning using the wav file
        print(f"Analyzing tuning for string {string_num}...")
        tuning_analysis = await analyze_tuning(string_num, wav_file_path)
        
        # Get the actual text status for folder selection
        target_note = GUITAR_STRINGS[string_num]
        with wave.open(wav_file_path, 'rb') as audio_file:
            full_tuning_result = tune_audio(audio_file, target_note, tolerance_cents=30)
        
        tune_status = full_tuning_result.get("tuning_status", "unknown")
        print(f"Tuning status: {tune_status}")
        
        # Step 2: Get random pre-generated audio
        print("Getting random pre-generated audio...")
        random_audio_path = get_random_tuning_audio(string_num, tune_status)
        
        if random_audio_path is None:
            return {
                "status": "error",
                "error": f"No pre-generated audio found for string {string_num} - {tune_status}",
                "string_number": string_num
            }
        
        # Use pre-generated audio
        result = {
            "status": "success",
            "string_number": string_num,
            "target_note": GUITAR_STRINGS[string_num],
            "tuning_analysis": tuning_analysis,
            "audio_path": random_audio_path,
            "tuning_status": tune_status
        }
        
        print(f"Tuning process completed. Audio path: {result['audio_path']}")
        return result
        
    except Exception as e:
        print(f"Error in tuning process: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "string_number": string_num
        }

# Convenience function for easy import
async def tune_guitar_string(string_num: str, audio_file_path: str) -> dict:
    """
    Main function to tune a guitar string - returns simplified format
    
    Args:
        string_num (str): Guitar string number (1-6)
        audio_file_path (str): Path to audio file (webm, wav, etc.)
    
    Returns:
        dict: Simple result with tuning_status, string_num, tuning_finish, and audio_path
    """
    wav_file_path = None
    try:
        # Step 1: Convert audio to wav if needed
        print(f"DEBUG: Original file path: {audio_file_path}")
        wav_file_path = convert_audio_to_wav(audio_file_path)
        print(f"DEBUG: Converted file path: {wav_file_path}")
        print(f"DEBUG: Converted file exists: {os.path.exists(wav_file_path)}")
        
        # Step 2: Use the tuning process function with converted wav file
        full_result = await process_tuning(string_num, wav_file_path)
        
        if full_result.get("status") == "error":
            return {
                "tuning_status": False,
                "string_num": string_num,
                "tuning_finish": False,
                "cents_error": 0,
                "audio_path": None,
                "error": full_result.get("error")
            }
        
        # Extract the simplified format from the full result
        tuning_analysis = full_result.get("tuning_analysis", {})
        
        return {
            "tuning_status": tuning_analysis.get("tuning_status", False),
            "string_num": string_num,
            "tuning_finish": tuning_analysis.get("tuning_finish", False),
            "cents_error": tuning_analysis.get("cents_error", 0),
            "audio_path": full_result.get("audio_path")
        }
        
    except Exception as e:
        print(f"Error in tune_guitar_string: {str(e)}")
        # 當發生錯誤時，提供一個基本的回應和備用音檔
        fallback_audio_path = None
        try:
            # 嘗試提供一個備用音檔路徑
            if string_num in ["1", "2", "3", "4", "5", "6"]:
                # 默認提供"需要重新調音"的音檔
                fallback_audio_path = f"frontend/public/audio/tuner/string{string_num}_too_low/feedback.wav"
                if not os.path.exists(fallback_audio_path.replace("frontend/public/", "")):
                    fallback_audio_path = "frontend/public/audio/tuner/tuner_intro.wav"
        except:
            fallback_audio_path = "frontend/public/audio/tuner/tuner_intro.wav"
            
        return {
            "tuning_status": False,
            "string_num": string_num,
            "tuning_finish": False,
            "cents_error": 0,
            "audio_path": None,
            "error": str(e)
        }
    finally:
        # Clean up converted wav file if it was created
        if wav_file_path and wav_file_path != audio_file_path and os.path.exists(wav_file_path):
            try:
                os.remove(wav_file_path)
                print(f"Cleaned up temporary wav file: {wav_file_path}")
            except Exception as e:
                print(f"Warning: Could not clean up temporary file {wav_file_path}: {e}")

# Test function
async def test_tuning_service():
    """Test the tuning service with sample data"""
    try:
        # You can test with an actual WAV file
        test_wav = "test_audio.wav"  # Replace with actual file path
        result = await tune_guitar_string("1", test_wav)
        print("Test result:", result)
        print(f"Expected format: tuning_status={result['tuning_status']}, string_num={result['string_num']}, tuning_finish={result['tuning_finish']}")
        return result
        
    except Exception as e:
        print(f"Test failed: {e}")
        return None

if __name__ == "__main__":
    # Run test
    asyncio.run(test_tuning_service())