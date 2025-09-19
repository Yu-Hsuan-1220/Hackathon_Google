#!/usr/bin/env python3
"""
Test script to verify debug audio saving functionality
"""
import os
import sys
import tempfile
from datetime import datetime

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from services.debug_audio_saver import DebugAudioSaver
from services.audio_conversion_utils import detect_audio_format

def test_debug_saver():
    """Test the DebugAudioSaver functionality"""
    print("=== Testing DebugAudioSaver ===")
    
    # Initialize debug saver
    saver = DebugAudioSaver()
    print(f"Debug saver initialized. Base directory: {saver.base_debug_dir}")
    
    # Create a dummy WebM file for testing
    dummy_webm_content = b"dummy webm content for testing"
    dummy_wav_content = b"dummy wav content for testing"
    
    with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_webm:
        temp_webm.write(dummy_webm_content)
        temp_webm_path = temp_webm.name
    
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_wav:
        temp_wav.write(dummy_wav_content)
        temp_wav_path = temp_wav.name
    
    try:
        # Test WebM saving
        print("\n--- Testing WebM file saving ---")
        webm_debug_path = saver.save_webm_file(temp_webm_path, string_number="1")
        print(f"WebM saved to: {webm_debug_path}")
        print(f"WebM file exists: {os.path.exists(webm_debug_path)}")
        
        # Test WAV saving
        print("\n--- Testing WAV file saving ---")
        wav_debug_path = saver.save_wav_file(temp_wav_path, string_number="1")
        print(f"WAV saved to: {wav_debug_path}")
        print(f"WAV file exists: {os.path.exists(wav_debug_path)}")
        
        # Test statistics
        print("\n--- Testing statistics ---")
        stats = saver.get_debug_statistics()
        print(f"Debug statistics: {stats}")
        
        # Test cleanup
        print("\n--- Testing cleanup ---")
        cleanup_count = saver.cleanup_old_files(hours=0)  # Clean all files
        print(f"Cleaned up {cleanup_count} files")
        
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up temporary files
        try:
            os.remove(temp_webm_path)
            os.remove(temp_wav_path)
        except:
            pass

def test_audio_format_detection():
    """Test audio format detection"""
    print("\n=== Testing Audio Format Detection ===")
    
    # Create dummy files with different extensions
    test_files = [
        ("test.webm", b"dummy webm"),
        ("test.wav", b"dummy wav"),
        ("test.mp3", b"dummy mp3")
    ]
    
    for filename, content in test_files:
        with tempfile.NamedTemporaryFile(suffix=f".{filename.split('.')[-1]}", delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        
        try:
            detected_format = detect_audio_format(temp_path)
            print(f"File: {filename} -> Detected format: {detected_format}")
        except Exception as e:
            print(f"Error detecting format for {filename}: {e}")
        finally:
            try:
                os.remove(temp_path)
            except:
                pass

def main():
    """Main test function"""
    print(f"Starting debug functionality tests at {datetime.now()}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    
    test_debug_saver()
    test_audio_format_detection()
    
    print(f"\nTest completed at {datetime.now()}")

if __name__ == "__main__":
    main()