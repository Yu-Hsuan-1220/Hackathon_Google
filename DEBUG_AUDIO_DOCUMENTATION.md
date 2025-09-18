# Debug Audio Saving Documentation

## Overview

This document explains the debug audio saving functionality that has been implemented to help debug the tuner audio processing pipeline. The system automatically saves both original WebM files and converted WAV files to a local debug directory for analysis.

## Components

### 1. DebugAudioSaver Class (`app/services/debug_audio_saver.py`)

The main utility class that handles organized saving of audio files for debugging purposes.

#### Features:
- **Automatic Directory Creation**: Creates organized directory structure based on timestamps
- **File Naming**: Uses timestamps and string numbers for unique identification
- **Statistics Tracking**: Provides information about saved files
- **Cleanup Management**: Allows removal of old debug files

#### Directory Structure:
```
debug_audio/
├── 2024-01-15_14-30-00/
│   ├── webm/
│   │   ├── 14-30-01_string1_audio.webm
│   │   └── 14-30-05_string2_audio.webm
│   └── wav/
│       ├── 14-30-01_string1_converted.wav
│       └── 14-30-05_string2_converted.wav
```

#### Key Methods:
- `save_webm_file(file_path, string_number=None)`: Save original WebM file
- `save_wav_file(file_path, string_number=None)`: Save converted WAV file
- `get_debug_statistics()`: Get counts of saved files
- `cleanup_old_files(hours=24)`: Remove debug files older than specified hours

### 2. Integration Points

#### Router Level (`app/routers/tuner.py`)
- Saves original WebM file when received from frontend
- Extracts string number from form data for proper file naming

#### Audio Conversion (`app/services/audio_conversion_utils.py`)
- Saves converted WAV files after successful conversion
- Works with both file-based and bytes-based conversion functions

#### Tuner Service (`app/services/tuner_service.py`)
- No direct changes needed - relies on conversion utilities

## Usage

### Automatic Operation

The debug functionality works automatically when processing audio files:

1. **Frontend Upload**: User records audio and uploads WebM file
2. **WebM Saving**: Original WebM file is saved to debug directory
3. **Conversion**: WebM is converted to WAV format
4. **WAV Saving**: Converted WAV file is saved to debug directory
5. **Analysis**: Audio analysis proceeds normally

### Manual Control

You can manually control the debug saving:

```python
from app.services.debug_audio_saver import DebugAudioSaver

# Initialize debug saver
debug_saver = DebugAudioSaver()

# Save files manually
webm_path = debug_saver.save_webm_file("path/to/audio.webm", string_number="1")
wav_path = debug_saver.save_wav_file("path/to/converted.wav", string_number="1")

# Get statistics
stats = debug_saver.get_debug_statistics()
print(f"WebM files: {stats['webm_count']}, WAV files: {stats['wav_count']}")

# Cleanup old files (older than 24 hours)
cleanup_count = debug_saver.cleanup_old_files(hours=24)
print(f"Cleaned up {cleanup_count} files")
```

### Disabling Debug Saving

To temporarily disable debug saving, you can modify the global `debug_saver` variable:

```python
# In app/services/audio_conversion_utils.py or app/routers/tuner.py
debug_saver = None  # This will disable debug saving
```

## File Naming Convention

### WebM Files
Format: `{timestamp}_string{number}_audio.webm`
Example: `14-30-01_string1_audio.webm`

### WAV Files
Format: `{timestamp}_string{number}_converted.wav`
Example: `14-30-01_string1_converted.wav`

### Timestamps
Format: `HH-MM-SS` (24-hour format)

## Configuration

### Debug Directory Location
Default: `debug_audio/` in the project root

You can change this by modifying the `DebugAudioSaver` constructor:

```python
debug_saver = DebugAudioSaver(base_directory="custom_debug_path")
```

### Session Naming
Sessions are named using the format: `YYYY-MM-DD_HH-MM-SS`

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure the application has write permissions to the debug directory
   - Check if the debug directory path is accessible

2. **Disk Space**
   - Monitor disk usage as audio files can accumulate
   - Use the cleanup functionality regularly

3. **File Not Found Errors**
   - Verify that the source files exist before saving
   - Check file paths are absolute and correct

### Debug Logging

The system includes debug print statements:
```
DEBUG: WebM file saved to debug directory: /path/to/debug/file
DEBUG: WAV file saved to debug directory: /path/to/debug/file
DEBUG: Failed to save WebM file for debugging: [error message]
```

### Testing

Use the provided test script to verify functionality:

```bash
python test_debug_functionality.py
```

## Audio Processing Pipeline

### Complete Flow with Debug Saving

1. **Frontend Recording**
   - User records audio using microphone
   - Audio is captured in WebM format (Opus codec)
   - FormData is sent to `/tuner/analyze` endpoint

2. **Backend Reception** (`app/routers/tuner.py`)
   - WebM file is received as multipart form data
   - Original WebM file is saved to debug directory
   - Temporary file is created for processing

3. **Audio Conversion** (`app/services/audio_conversion_utils.py`)
   - WebM is converted to WAV using FFmpeg
   - Conversion parameters: PCM 16-bit, 44.1kHz, mono
   - Converted WAV file is saved to debug directory

4. **Tuning Analysis** (`app/services/tuner_service.py`)
   - WAV file is analyzed for frequency content
   - Tuning status is determined
   - Results are returned to frontend

5. **Cleanup**
   - Temporary files are removed
   - Debug files remain for analysis

## Performance Considerations

### Impact on Processing Speed
- File copying adds minimal overhead (< 50ms per file)
- Debug saving happens asynchronously where possible
- No impact on audio analysis accuracy

### Storage Requirements
- WebM files: ~50-200KB per recording
- WAV files: ~500KB-2MB per recording
- Recommended: Regular cleanup of debug files

### Memory Usage
- No significant memory impact
- Files are copied directly without loading into memory

## Security Considerations

### File Access
- Debug files contain user audio recordings
- Ensure appropriate access controls on debug directory
- Consider data retention policies

### Cleanup
- Implement automatic cleanup for production environments
- Consider encrypting debug files if they contain sensitive audio

## Integration with Existing Code

### Minimal Changes Required
The debug functionality is designed to be non-invasive:

- **No API Changes**: Frontend code remains unchanged
- **Optional Functionality**: Can be easily disabled
- **Error Handling**: Graceful fallback if debug saving fails
- **Backward Compatibility**: Existing code continues to work

### Future Enhancements

Potential improvements:
1. **Configurable Settings**: Environment-based configuration
2. **Metadata Logging**: Save additional context with each file
3. **Web Interface**: Admin panel for managing debug files
4. **Analytics**: Statistical analysis of tuning patterns
5. **Export Tools**: Batch export of debug sessions

## Conclusion

The debug audio saving functionality provides a powerful tool for analyzing and troubleshooting the tuner audio processing pipeline. It operates transparently alongside existing code while providing valuable insights into the audio processing workflow.

For any issues or feature requests, refer to the troubleshooting section or examine the debug logs for detailed error information.