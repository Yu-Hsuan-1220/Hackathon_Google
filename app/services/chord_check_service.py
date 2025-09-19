
from chord_extractor.extractors import Chordino
import os
import tempfile
import wave
import random
import asyncio
from .audio_conversion_utils import convert_webm_to_wav
from .string_check_service import note_check

# Setup Chordino with one of several parameters that can be passed
chordino = Chordino(roll_on=1)  

# Chord progression sequence
CHORD_PROGRESSION = ["C", "D", "G"]

# String order for each chord: chord -> [strings from first to last]
CHORD_STRING_ORDER = {
    "C": ["5", "4", "3", "2", "1"],  # C chord: strings 5 to 1
    "D": ["4", "3", "2", "1"],       # D chord: strings 4 to 1  
    "G": ["6", "5", "4", "3", "2", "1"]  # G chord: strings 6 to 1
}

# String number to note mapping for each chord
CHORD_STRING_NOTES = {
    "C": {
        "5": "C3",  # 5th string for C chord
        "4": "E3",  # 4th string for C chord  
        "3": "G3",  # 3rd string for C chord
        "2": "C4",  # 2nd string for C chord
        "1": "E4"   # 1st string for C chord
    },
    "D": {
        "4": "D4",  # 4th string for D chord
        "3": "A4",  # 3rd string for D chord
        "2": "D4",  # 2nd string for D chord
        "1": "F#4"  # 1st string for D chord
    },
    "G": {
        "6": "G2",  # 6th string for G chord
        "5": "B2",  # 5th string for G chord
        "4": "D3",  # 4th string for G chord
        "3": "G3",  # 3rd string for G chord
        "2": "B3",  # 2nd string for G chord
        "1": "G4"   # 1st string for G chord
    }
}

def get_next_chord(current_chord: str) -> str:
    """Get the next chord in the progression C->D->G"""
    try:
        current_index = CHORD_PROGRESSION.index(current_chord)
        next_index = (current_index + 1) % len(CHORD_PROGRESSION)
        return CHORD_PROGRESSION[next_index]
    except ValueError:
        return "C"  # Default to C if current chord not found

def get_next_string_for_chord(chord: str, current_string: str = None) -> str:
    """Get the next string to practice for a chord"""
    if chord not in CHORD_STRING_ORDER:
        return None
    
    chord_strings = CHORD_STRING_ORDER[chord]
    
    if current_string is None:
        return chord_strings[0]  # Return first string
    
    try:
        current_index = chord_strings.index(current_string)
        if current_index + 1 < len(chord_strings):
            return chord_strings[current_index + 1]
        else:
            return None  # All strings completed
    except ValueError:
        return chord_strings[0]  # If current string not found, start from beginning

def get_intro_audio() -> str:
    """Get intro audio file"""
    return "audio/chord/chord_intro.wav"

def get_next_chord_intro_audio(next_chord: str) -> str:
    """Get intro audio for next chord"""
    return f"audio/chord/chord_{next_chord}_intro.wav"

def get_random_chord_audio(chord: str, result_type: str) -> str:
    """
    Get random audio file from chord feedback folders
    
    Args:
        chord: Target chord name (C, D, G)
        result_type: "correct" or "incorrect"
    
    Returns:
        str: Path to random audio file
    """
    try:
        audio_folder = os.path.join("frontend/public/audio", "chord", chord, result_type)
        
        if not os.path.exists(audio_folder):
            print(f"Audio folder not found: {audio_folder}")
            return f"audio/chord/{chord}/{result_type}/default.wav"  # Remove 'public/' prefix
        
        wav_files = [f for f in os.listdir(audio_folder) if f.endswith('.wav')]
        
        if not wav_files:
            print(f"No WAV files found in folder: {audio_folder}")
            return f"audio/chord/{chord}/{result_type}/default.wav"  # Remove 'public/' prefix
        
        random_file = random.choice(wav_files)
        full_path = f"audio/chord/{chord}/{result_type}/{random_file}"  # Remove 'public/' prefix
        
        print(f"Selected chord audio: {full_path}")
        return full_path
        
    except Exception as e:
        print(f"Error getting random chord audio: {e}")
        return f"audio/chord/{chord}/{result_type}/default.wav"  # Remove 'public/' prefix

def get_random_string_chord_audio() -> str:
    """Get random audio from chord/string folder"""
    try:
        audio_folder = os.path.join("frontend/public/audio", "chord", "string")
        
        if not os.path.exists(audio_folder):
            print(f"String audio folder not found: {audio_folder}")
            return "audio/chord/string/default.wav"  # Remove 'public/' prefix
        
        wav_files = [f for f in os.listdir(audio_folder) if f.endswith('.wav')]
        
        if not wav_files:
            print(f"No WAV files found in string folder: {audio_folder}")
            return "audio/chord/string/default.wav"  # Remove 'public/' prefix
        
        random_file = random.choice(wav_files)
        full_path = f"audio/chord/string/{random_file}"  # Remove 'public/' prefix
        
        print(f"Selected string chord audio: {full_path}")
        return full_path
        
    except Exception as e:
        print(f"Error getting random string chord audio: {e}")
        return "audio/chord/string/default.wav"  # Remove 'public/' prefix

async def chord_check(target_chord: str, audio_file_content: bytes, whole_chord: bool, string: str = None):
    """
    Check chord or string playing
    
    Args:
        target_chord: Target chord (C, D, G) or AA for intro
        audio_file_content: WebM or WAV audio data
        whole_chord: True for chord check, False for string check
        string: String number when whole_chord=False (1-6)
    
    Returns:
        dict: Result with target_chord, whole_chord flag, finish_lesson flag, and audio path
    """
    try:
        print(f"DEBUG: chord_check called with target_chord='{target_chord}', whole_chord={whole_chord}, string='{string}'")
        print(f"DEBUG: audio_file_content length: {len(audio_file_content)} bytes")
        
        # Handle AA intro case
        if target_chord == "AA":
            return {
                "success": True,
                "target_chord": "AA", 
                "whole_chord": 1,
                "finish_lesson": False,
                "audio": get_intro_audio(),
                "is_correct": None,
                "detected_chords": [],
                "is_string_correct": None,
                "next_string": None
            }
        
        if whole_chord:
            # Whole chord checking using Chordino
            # Write audio content to temporary WebM file first
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_webm_file:
                temp_webm_file.write(audio_file_content)
                temp_webm_path = temp_webm_file.name
            
            try:
                print(f"DEBUG: Starting WebM to WAV conversion for chord analysis")
                print(f"DEBUG: WebM file size: {os.path.getsize(temp_webm_path)} bytes")
                
                # Convert WebM to WAV with proper sample rate
                temp_wav_path = convert_webm_to_wav(temp_webm_path)
                print(f"DEBUG: WAV conversion completed. WAV file: {temp_wav_path}")
                print(f"DEBUG: WAV file exists: {os.path.exists(temp_wav_path)}")
                if os.path.exists(temp_wav_path):
                    print(f"DEBUG: WAV file size: {os.path.getsize(temp_wav_path)} bytes")
                    
                    # Check WAV file properties
                    with wave.open(temp_wav_path, 'rb') as wav_file:
                        print(f"DEBUG: WAV sample rate: {wav_file.getframerate()}")
                        print(f"DEBUG: WAV channels: {wav_file.getnchannels()}")
                        print(f"DEBUG: WAV sample width: {wav_file.getsampwidth()}")
                        print(f"DEBUG: WAV frame count: {wav_file.getnframes()}")
                
                # Extract chords using Chordino
                print(f"DEBUG: Running Chordino chord extraction...")
                chords = chordino.extract(temp_wav_path)
                print(f"DEBUG: Chordino extraction completed. Found {len(chords)} chord segments")
                
                # Clean up temporary files
                os.unlink(temp_webm_path)
                os.unlink(temp_wav_path)
                
                # Check if target chord is detected
                detected_chords = [chord.chord for chord in chords]
                print(f"Detected chords: {detected_chords}")
                print(f"Target chord: {target_chord}")
                
                # Check if target chord is in the detected chords
                is_correct = target_chord in detected_chords
                
                if is_correct:
                    # Correct chord played
                    next_chord = get_next_chord(target_chord)
                    finish_lesson = (target_chord == "G")  # Finish when G chord is played correctly
                    
                    # Return next chord intro audio when current chord is correct
                    if finish_lesson:
                        audio_path = get_random_chord_audio(target_chord, "correct")
                    else:
                        audio_path = get_next_chord_intro_audio(next_chord)
                    
                    return {
                        "success": True,
                        "target_chord": next_chord if not finish_lesson else target_chord,
                        "detected_chords": detected_chords,
                        "is_correct": True,
                        "whole_chord": 1,
                        "finish_lesson": finish_lesson,
                        "audio": audio_path,
                        "is_string_correct": None,
                        "next_string": None
                    }
                else:
                    # Incorrect chord played
                    audio_path = get_random_chord_audio(target_chord, "incorrect")
                    
                    return {
                        "success": True,
                        "target_chord": target_chord,
                        "detected_chords": detected_chords,
                        "is_correct": False,
                        "whole_chord": 1,
                        "finish_lesson": False,
                        "audio": audio_path,
                        "is_string_correct": None,
                        "next_string": None
                    }
                    
            except Exception as e:
                # Clean up temporary files on error
                if os.path.exists(temp_webm_path):
                    os.unlink(temp_webm_path)
                if 'temp_wav_path' in locals() and os.path.exists(temp_wav_path):
                    os.unlink(temp_wav_path)
                raise e
                
        else:
            # String checking using note_check
            if not string:
                return {
                    "error": "String parameter required when whole_chord=False",
                    "success": False
                }
            
            # Validate string number
            if string not in ["1", "2", "3", "4", "5", "6"]:
                return {
                    "error": "String must be a number from 1 to 6",
                    "success": False
                }
            
            # Get the note for this string and chord combination
            if target_chord not in CHORD_STRING_NOTES or string not in CHORD_STRING_NOTES[target_chord]:
                return {
                    "error": f"String {string} is not used in chord {target_chord}",
                    "success": False
                }
            
            target_note = CHORD_STRING_NOTES[target_chord][string]
            
            # Use existing string check service with the target note
            string_result = await note_check(target_note, audio_file_content)
            
            if "error" in string_result:
                return {
                    "error": string_result["error"],
                    "success": False
                }
            
            # Check if string is played correctly (in tune and confident)
            # The note_check service returns tuning_result, not is_in_tune
            tuning_result = string_result.get("tuning_result", "")
            confidence = string_result.get("confidence", 0)
            
            is_string_correct = (
                tuning_result in ["success_advance", "in_tune"] and 
                confidence >= 0.7
            )
            
            print(f"DEBUG: String check result - tuning_result: {tuning_result}, confidence: {confidence}, is_correct: {is_string_correct}")
            
            # Get next string to practice
            next_string = get_next_string_for_chord(target_chord, string)
            
            if is_string_correct:
                if next_string:
                    # String played correctly, move to next string
                    audio_path = string_result.get("wav_path") or get_random_string_chord_audio()
                    return {
                        "success": True,
                        "target_chord": target_chord,
                        "is_string_correct": True,
                        "whole_chord": 0,  # Stay in string mode
                        "finish_lesson": False,
                        "audio": audio_path,
                        "is_correct": None,
                        "detected_chords": [],
                        "next_string": next_string
                    }
                else:
                    # All strings completed, switch to whole chord mode
                    audio_path = string_result.get("wav_path") or get_random_string_chord_audio()
                    return {
                        "success": True,
                        "target_chord": target_chord,
                        "is_string_correct": True,
                        "whole_chord": 1,  # Switch to chord mode
                        "finish_lesson": False,
                        "audio": audio_path,
                        "is_correct": None,
                        "detected_chords": [],
                        "next_string": None
                    }
            else:
                # String not played correctly, stay on current string
                audio_path = string_result.get("wav_path") or get_random_string_chord_audio()
                return {
                    "success": True,
                    "target_chord": target_chord,
                    "is_string_correct": False,
                    "whole_chord": 0,  # Stay in string mode
                    "finish_lesson": False,
                    "audio": audio_path,
                    "is_correct": None,
                    "detected_chords": [],
                    "next_string": string  # Stay on current string
                }
                
    except Exception as e:
        print(f"Error in chord_check: {e}")
        return {
            "error": f"Chord analysis error: {str(e)}",
            "success": False
        }