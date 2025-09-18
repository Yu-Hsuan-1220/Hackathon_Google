"""
Debug audio saver utility for saving WebM and WAV files for debugging purposes
"""
import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional


class DebugAudioSaver:
    """Utility class for saving audio files for debugging"""
    
    def __init__(self, base_debug_dir: str = "debug_audio"):
        """
        Initialize the debug audio saver
        
        Args:
            base_debug_dir (str): Base directory for saving debug audio files
        """
        self.base_debug_dir = Path(base_debug_dir)
        self.ensure_debug_directory()
    
    def ensure_debug_directory(self):
        """Create debug directory structure if it doesn't exist"""
        # Create main debug directory
        self.base_debug_dir.mkdir(exist_ok=True)
        
        # Create subdirectories for different file types
        (self.base_debug_dir / "webm_original").mkdir(exist_ok=True)
        (self.base_debug_dir / "wav_converted").mkdir(exist_ok=True)
        (self.base_debug_dir / "failed_conversions").mkdir(exist_ok=True)
        
        print(f"DEBUG: Ensured debug directories exist at {self.base_debug_dir}")
    
    def save_webm_file(self, temp_file_path: str, string_num: str) -> Optional[str]:
        """
        Save the original WebM file for debugging
        
        Args:
            temp_file_path (str): Path to the temporary WebM file
            string_num (str): Guitar string number
            
        Returns:
            str: Path to the saved debug file, or None if failed
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            debug_filename = f"string{string_num}_{timestamp}_original.webm"
            debug_path = self.base_debug_dir / "webm_original" / debug_filename
            
            # Copy the temporary file to debug location
            shutil.copy2(temp_file_path, debug_path)
            
            print(f"DEBUG: Saved original WebM file to {debug_path}")
            print(f"DEBUG: File size: {debug_path.stat().st_size} bytes")
            
            return str(debug_path)
            
        except Exception as e:
            print(f"DEBUG: Failed to save WebM file: {e}")
            return None
    
    def save_wav_file(self, wav_file_path: str, string_num: str, conversion_success: bool = True) -> Optional[str]:
        """
        Save the converted WAV file for debugging
        
        Args:
            wav_file_path (str): Path to the WAV file
            string_num (str): Guitar string number
            conversion_success (bool): Whether the conversion was successful
            
        Returns:
            str: Path to the saved debug file, or None if failed
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            if conversion_success:
                debug_filename = f"string{string_num}_{timestamp}_converted.wav"
                debug_dir = self.base_debug_dir / "wav_converted"
            else:
                debug_filename = f"string{string_num}_{timestamp}_failed.wav"
                debug_dir = self.base_debug_dir / "failed_conversions"
            
            debug_path = debug_dir / debug_filename
            
            # Copy the WAV file to debug location
            if os.path.exists(wav_file_path):
                shutil.copy2(wav_file_path, debug_path)
                
                print(f"DEBUG: Saved {'converted' if conversion_success else 'failed'} WAV file to {debug_path}")
                print(f"DEBUG: File size: {debug_path.stat().st_size} bytes")
                
                return str(debug_path)
            else:
                print(f"DEBUG: WAV file does not exist: {wav_file_path}")
                return None
                
        except Exception as e:
            print(f"DEBUG: Failed to save WAV file: {e}")
            return None
    
    def get_debug_stats(self) -> dict:
        """
        Get statistics about saved debug files
        
        Returns:
            dict: Statistics about debug files
        """
        try:
            webm_count = len(list((self.base_debug_dir / "webm_original").glob("*.webm")))
            wav_count = len(list((self.base_debug_dir / "wav_converted").glob("*.wav")))
            failed_count = len(list((self.base_debug_dir / "failed_conversions").glob("*.wav")))
            
            total_size = 0
            for file_path in self.base_debug_dir.rglob("*"):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
            
            return {
                "webm_files": webm_count,
                "wav_files": wav_count,
                "failed_files": failed_count,
                "total_files": webm_count + wav_count + failed_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "debug_directory": str(self.base_debug_dir)
            }
            
        except Exception as e:
            print(f"DEBUG: Failed to get debug stats: {e}")
            return {"error": str(e)}
    
    def cleanup_old_files(self, days_old: int = 7) -> int:
        """
        Clean up debug files older than specified days
        
        Args:
            days_old (int): Remove files older than this many days
            
        Returns:
            int: Number of files removed
        """
        try:
            import time
            cutoff_time = time.time() - (days_old * 24 * 60 * 60)
            removed_count = 0
            
            for file_path in self.base_debug_dir.rglob("*"):
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    file_path.unlink()
                    removed_count += 1
                    print(f"DEBUG: Removed old file: {file_path}")
            
            print(f"DEBUG: Cleaned up {removed_count} old debug files")
            return removed_count
            
        except Exception as e:
            print(f"DEBUG: Failed to cleanup old files: {e}")
            return 0


# Global instance for easy access
debug_saver = DebugAudioSaver()