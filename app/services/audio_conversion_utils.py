"""
Audio conversion utilities for handling different audio formats
"""
import subprocess
import tempfile
import os
from pathlib import Path
from typing import Union


def convert_webm_to_wav(webm_file_path: str) -> str:
    """
    Convert webm audio file to wav format using ffmpeg
    
    Args:
        webm_file_path (str): Path to the input webm file
    
    Returns:
        str: Path to the converted wav file
    """
    try:
        # Create output wav file path - ensure it's different from input
        if webm_file_path.endswith('.wav'):
            # If input already has .wav extension, create a new output file
            wav_file_path = webm_file_path.replace('.wav', '_converted.wav')
        else:
            # Normal case: replace extension
            wav_file_path = webm_file_path.replace('.webm', '.wav')
        
        print(f"DEBUG: Converting {webm_file_path} to {wav_file_path}")
        
        # Use ffmpeg to convert webm to wav with optimal settings for pitch detection
        cmd = [
            'ffmpeg', 
            '-i', webm_file_path,
            '-acodec', 'pcm_s16le',  # 16-bit PCM
            '-ar', '44100',          # 44.1 kHz sample rate for better frequency resolution
            '-ac', '1',              # Mono channel
            '-af', 'highpass=f=50,lowpass=f=4000',  # 音頻濾波器：去除低頻噪音和高頻雜訊
            '-y',                    # Overwrite output file
            wav_file_path
        ]
        
        print(f"DEBUG: Running WEBM conversion command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"DEBUG: WEBM conversion failed with stderr: {result.stderr}")
            raise Exception(f"FFmpeg conversion failed: {result.stderr}")
        
        print(f"DEBUG: Successfully converted {webm_file_path} to {wav_file_path}")
        print(f"DEBUG: Output file exists: {os.path.exists(wav_file_path)}")
        return wav_file_path
        
    except Exception as e:
        print(f"DEBUG: Error converting webm to wav: {e}")
        raise e


def is_wav_file(file_path: str) -> bool:
    """
    Check if a file is actually a WAV file by reading its header
    
    Args:
        file_path (str): Path to the file
    
    Returns:
        bool: True if it's a valid WAV file
    """
    try:
        with open(file_path, 'rb') as f:
            header = f.read(12)
            # WAV files start with "RIFF" and have "WAVE" at bytes 8-11
            return header[:4] == b'RIFF' and header[8:12] == b'WAVE'
    except:
        return False

def is_webm_file(file_path: str) -> bool:
    """
    Check if a file is actually a WebM file by reading its header
    
    Args:
        file_path (str): Path to the file
    
    Returns:
        bool: True if it's a WebM/Matroska file
    """
    try:
        with open(file_path, 'rb') as f:
            header = f.read(4)
            # WebM files start with the EBML header 0x1A45DFA3
            return header == b'\x1a\x45\xdf\xa3'
    except:
        return False

def convert_audio_to_wav(audio_file_path: str) -> str:
    """
    Convert audio file to wav format if needed
    
    Args:
        audio_file_path (str): Path to the input audio file
    
    Returns:
        str: Path to the wav file (original or converted)
    """
    file_path = Path(audio_file_path)
    
    print(f"DEBUG: Input file: {audio_file_path}")
    print(f"DEBUG: File extension: {file_path.suffix.lower()}")
    print(f"DEBUG: File exists: {file_path.exists()}")
    
    # Check file header to see what format it actually is
    if file_path.exists():
        with open(audio_file_path, 'rb') as f:
            header = f.read(16)
            print(f"DEBUG: File header (hex): {header.hex()}")
            print(f"DEBUG: File header (ascii): {header}")
    
    # Check actual file content, not just extension
    if is_wav_file(audio_file_path):
        print("DEBUG: File is actually WAV, returning original path")
        return audio_file_path
    elif is_webm_file(audio_file_path):
        print("DEBUG: File is actually WebM, converting to WAV")
        return convert_webm_to_wav(audio_file_path)
    else:
        print(f"DEBUG: File format unknown, trying generic conversion")
        # For other formats, try to convert using ffmpeg
        wav_file_path = str(file_path.with_suffix('.wav'))
        
        cmd = [
            'ffmpeg', 
            '-i', audio_file_path,
            '-acodec', 'pcm_s16le',
            '-ar', '44100',          # 使用 44.1kHz 以提高精度
            '-ac', '1',
            '-af', 'highpass=f=50,lowpass=f=4000',  # 音頻濾波器
            '-y',
            wav_file_path
        ]
        
        print(f"DEBUG: Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"DEBUG: FFmpeg failed with stderr: {result.stderr}")
            raise Exception(f"FFmpeg conversion failed: {result.stderr}")
        
        print(f"DEBUG: Conversion successful, output file: {wav_file_path}")
        return wav_file_path


def convert_audio_bytes_to_wav_bytes(audio_bytes: bytes, source_format: str = "webm") -> bytes:
    """
    Convert audio bytes to wav format bytes
    
    Args:
        audio_bytes (bytes): Input audio data as bytes
        source_format (str): Source format (webm, mp3, etc.)
    
    Returns:
        bytes: WAV format audio data
    """
    try:
        # Create temporary input file
        with tempfile.NamedTemporaryFile(suffix=f'.{source_format}', delete=False) as temp_input:
            temp_input.write(audio_bytes)
            temp_input_path = temp_input.name
        
        # Create temporary output file
        temp_output_path = temp_input_path.replace(f'.{source_format}', '.wav')
        
        try:
            # Convert using ffmpeg
            cmd = [
                'ffmpeg', 
                '-i', temp_input_path,
                '-acodec', 'pcm_s16le',
                '-ar', '24000',
                '-ac', '1',
                '-y',
                temp_output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"FFmpeg conversion failed: {result.stderr}")
            
            # Read converted wav bytes
            with open(temp_output_path, 'rb') as wav_file:
                wav_bytes = wav_file.read()
            
            return wav_bytes
            
        finally:
            # Clean up temporary files
            if os.path.exists(temp_input_path):
                os.remove(temp_input_path)
            if os.path.exists(temp_output_path):
                os.remove(temp_output_path)
                
    except Exception as e:
        print(f"Error converting audio bytes: {e}")
        raise e


def detect_audio_format(file_path: str) -> str:
    """
    Detect audio format of a file
    
    Args:
        file_path (str): Path to the audio file
    
    Returns:
        str: Detected format (wav, webm, mp3, etc.)
    """
    try:
        cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', file_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            import json
            info = json.loads(result.stdout)
            format_name = info.get('format', {}).get('format_name', '')
            
            if 'webm' in format_name or 'matroska' in format_name:
                return 'webm'
            elif 'wav' in format_name:
                return 'wav'
            elif 'mp3' in format_name:
                return 'mp3'
            else:
                return Path(file_path).suffix[1:].lower()
        else:
            # Fallback to file extension
            return Path(file_path).suffix[1:].lower()
            
    except Exception as e:
        print(f"Error detecting audio format: {e}")
        # Fallback to file extension
        return Path(file_path).suffix[1:].lower()