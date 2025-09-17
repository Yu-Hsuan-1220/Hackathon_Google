import wave
import os
import tempfile
import random
import asyncio

# Import the tuning functions from the parent directory
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '../../../'))
from app.services.tuner_utils import get_frequency_from_audio, get_note_frequency, tune_audio

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
        wav_file_path (str): Path to WAV audio file
    
    Returns:
        dict: Simplified tuning result with tuning_status, string_num, and tuning_finish
    """
    try:
        # Validate string number
        if string_num not in GUITAR_STRINGS:
            raise ValueError(f"Invalid string number: {string_num}. Must be 1-6.")
        
        # Get target note for the string
        target_note = GUITAR_STRINGS[string_num]
        
        # Open and analyze the WAV file
        with wave.open(wav_file_path, 'rb') as audio_file:
            tuning_result = tune_audio(audio_file, target_note, tolerance_cents=30)
        
        # Convert tuning status to boolean
        tuning_status = tuning_result.get("tuning_status") == "in tune"
        
        # Check if tuning is finished (string 1 and in tune)
        tuning_finish = (string_num == "1" and tuning_status)
        
        # Get cents difference from the result
        cents_error = tuning_result.get("cents_difference", 0)
        
        # next string to tune 
        string_num=string_num-1 if tuning_status==1 and string_num>1 else string_num
        # Return simplified format with cents error
        return {
            "tuning_status": tuning_status,
            "string_num": string_num,
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
        wav_file_path (str): Path to input WAV file
    
    Returns:
        dict: Complete tuning result with random audio path
    """
    try:
        # Step 1: Analyze tuning
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
async def tune_guitar_string(string_num: str, wav_file_path: str) -> dict:
    """
    Main function to tune a guitar string - returns simplified format
    
    Args:
        string_num (str): Guitar string number (1-6)
        wav_file_path (str): Path to WAV audio file
    
    Returns:
        dict: Simple result with tuning_status, string_num, tuning_finish, and audio_path
    """
    try:
        # Use the tuning process function
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
        return {
            "tuning_status": False,
            "string_num": string_num,
            "tuning_finish": False,
            "cents_error": 0,
            "audio_path": None,
            "error": str(e)
        }

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

