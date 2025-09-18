#install these libraries ----
# pip install numpy matplotlib
# Also install ffmpeg: brew install ffmpeg (on macOS)

import numpy as np
import math
import wave
import os
import struct

import subprocess


def note_detect(audio_file):

	#-------------------------------------------
	#here we are just storing our sound file as a numpy array
	#you can also use any other method to store the file as an np array
	file_length=audio_file.getnframes() 
	f_s=audio_file.getframerate() #sampling frequency
	sound = np.zeros(file_length) #blank array



	for i in range(file_length) : 
		wdata=audio_file.readframes(1)
		data=struct.unpack("<h",wdata)
		sound[i] = int(data[0])
	
	# plt.plot(sound)
	# plt.show()
	
	sound=np.divide(sound,float(2**15)) #scaling it to 0 - 1
	counter = audio_file.getnchannels() #number of channels mono/sterio
	#-------------------------------------------
	
	# plt.plot(sound)
	# plt.show()

	#fourier transformation from numpy module
	fourier = np.fft.fft(sound)
	fourier = np.absolute(fourier)
	imax=np.argmax(fourier[0:int(file_length/2)]) #index of max element
		
	# plt.plot(fourier)
	# plt.show()

	#peak detection
	i_begin = -1
	threshold = 0.3 * fourier[imax]
	for i in range (0,imax+100):
		if fourier[i] >= threshold:
			if(i_begin==-1):
				i_begin = i				
		if(i_begin!=-1 and fourier[i]<threshold):
			break
	i_end = i
	imax = np.argmax(fourier[0:i_end+100])
	
	freq=(imax*f_s)/file_length #FIXED: formula to convert index into sound frequency
	
	#frequency database
	note=0
	name = np.array(["C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G2#","A2","A2#","B2","C3","C3#","D3","D3#","E3","F3","F3#","G3","G3#","A3","A3#","B3","C4","C4#","D4","D4#","E4","F4","F4#","G4","G4#","A4","A4#","B4","C5","C5#","D5","D5#","E5","F5","F5#","G5","G5#","A5","A5#","B5","C6","C6#","D6","D6#","E6","F6","F6#","G6","G6#","A6","A6#","B6","C7","C7#","D7","D7#","E7","F7","F7#","G7","G7#","A7","A7#","B7","C8","C8#","D8","D8#","E8","F8","F8#","G8","G8#","A8","A8#","B8","Beyond B8"])
	frequencies = np.array([16.35,17.32,18.35,19.45,20.60,21.83,23.12,24.50,25.96	,27.50	,29.14	,30.87	,32.70	,34.65	,36.71	,38.89	,41.20	,43.65	,46.25	,49.00	,51.91	,55.00	,58.27	,61.74	,65.41	,69.30	,73.42	,77.78	,82.41	,87.31	,92.50	,98.00	,103.83	,110.00	,116.54	,123.47	,130.81	,138.59	,146.83	,155.56	,164.81	,174.61	,185.00	,196.00	,207.65	,220.00	,233.08	,246.94	,261.63	,277.18	,293.66	,311.13	,329.63	,349.23	,369.99	,392.00	,415.30	,440.00	,466.16	,493.88	,523.25	,554.37	,587.33	,622.25	,659.26	,698.46	,739.99	,783.99	,830.61	,880.00	,932.33	,987.77	,1046.50	,1108.73	,1174.66	,1244.51	,1318.51	,1396.91	,1479.98	,1567.98	,1661.22	,1760.00	,1864.66	,1975.53	,2093.00	,2217.46	,2349.32	,2489.02	,2637.02	,2793.83	,2959.96	,3135.96	,3322.44	,3520.00	,3729.31	,3951.07	,4186.01	,4434.92	,4698.64	,4978.03	,5274.04	,5587.65	,5919.91	,6271.93	,6644.88	,7040.00	,7458.62	,7902.13,8000])
	
	#searching for matched frequencies
	for i in range(0,frequencies.size-1):
			if(freq<frequencies[0]):
				note=name[0]
				break
			if(freq>frequencies[-1]):
				note=name[-1]
				break
			if freq>=frequencies[i] and frequencies[i+1]>=freq :
				if freq-frequencies[i]<(frequencies[i+1]-frequencies[i])/2 :
					note=name[i]
				else :
					note=name[i+1]
				break

		
	return note

def get_frequency_from_audio(audio_file):
	"""
	Extract the dominant frequency from an audio file
	Returns the frequency in Hz
	"""
	#here we are just storing our sound file as a numpy array
	file_length=audio_file.getnframes() 
	f_s=audio_file.getframerate() #sampling frequency
	channels = audio_file.getnchannels() #number of channels mono/stereo
	sample_width = audio_file.getsampwidth() #bytes per sample
	
	# Read all frames at once for better performance and compatibility
	frames = audio_file.readframes(file_length)
	
	# Handle different bit depths
	if sample_width == 1:  # 8-bit
		sound = np.frombuffer(frames, dtype=np.uint8).astype(np.float32)
		sound = (sound - 128) / 128.0  # Convert to -1 to 1 range
	elif sample_width == 2:  # 16-bit
		sound = np.frombuffer(frames, dtype=np.int16).astype(np.float32)
		sound = sound / 32768.0  # Convert to -1 to 1 range
	elif sample_width == 4:  # 32-bit
		sound = np.frombuffer(frames, dtype=np.int32).astype(np.float32)
		sound = sound / 2147483648.0  # Convert to -1 to 1 range
	else:
		raise ValueError(f"Unsupported sample width: {sample_width} bytes")
	
	# If stereo, convert to mono by taking the average
	if channels == 2:
		sound = sound.reshape(-1, 2).mean(axis=1)
	elif channels > 2:
		sound = sound.reshape(-1, channels).mean(axis=1)
		
	#fourier transformation from numpy module
	fourier = np.fft.fft(sound)
	fourier = np.absolute(fourier)
	
	# Only look at the first half of the spectrum (Nyquist frequency)
	half_length = len(sound) // 2
	fourier_half = fourier[:half_length]
	
	# Find the fundamental frequency (not just the loudest peak)
	# Apply a window to reduce noise
	window_size = max(10, len(fourier_half) // 1000)
	if window_size < len(fourier_half):
		# Smooth the spectrum to find more stable peaks
		smoothed = np.convolve(fourier_half, np.ones(window_size)/window_size, mode='same')
	else:
		smoothed = fourier_half
	
	imax = np.argmax(smoothed)
	
	# Verify this is a reasonable frequency for guitar (80-1500 Hz range)
	freq_candidate = (imax * f_s) / len(sound)
	
	# If the main peak is outside guitar range, look for harmonics
	if freq_candidate < 60 or freq_candidate > 1500:
		# Look for peaks in the guitar frequency range (80-1500 Hz)
		freq_min_idx = int(60 * len(sound) / f_s)
		freq_max_idx = int(1500 * len(sound) / f_s)
		freq_max_idx = min(freq_max_idx, half_length - 1)
		
		if freq_min_idx < freq_max_idx:
			guitar_range = smoothed[freq_min_idx:freq_max_idx]
			if len(guitar_range) > 0:
				local_max = np.argmax(guitar_range)
				imax = freq_min_idx + local_max
	
	#peak detection (refined)
	i_begin = -1
	threshold = 0.2 * fourier[imax]  # Lower threshold for better detection
	search_range = min(imax + 50, len(fourier))
	
	for i in range(max(0, imax-50), search_range):
		if fourier[i] >= threshold:
			if i_begin == -1:
				i_begin = i				
		if i_begin != -1 and fourier[i] < threshold:
			break
	
	if i_begin != -1:
		i_end = i
		peak_range = min(i_end + 50, len(fourier))
		local_spectrum = fourier[i_begin:peak_range]
		if len(local_spectrum) > 0:
			local_max = np.argmax(local_spectrum)
			imax = i_begin + local_max
	
	# FIXED: Correct frequency calculation formula
	freq = (imax * f_s) / len(sound)  # Removed division by channels
	
	# Debug information
	print(f"DEBUG - Audio properties: sample_rate={f_s}, length={len(sound)}, channels={channels}")
	print(f"DEBUG - FFT: imax={imax}, freq={freq:.2f} Hz")
	
	return freq

def get_note_frequency(note_name):
	"""
	Get the frequency of a specific note
	Returns frequency in Hz, or None if note not found
	"""
	name = np.array(["C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G2#","A2","A2#","B2","C3","C3#","D3","D3#","E3","F3","F3#","G3","G3#","A3","A3#","B3","C4","C4#","D4","D4#","E4","F4","F4#","G4","G4#","A4","A4#","B4","C5","C5#","D5","D5#","E5","F5","F5#","G5","G5#","A5","A5#","B5","C6","C6#","D6","D6#","E6","F6","F6#","G6","G6#","A6","A6#","B6","C7","C7#","D7","D7#","E7","F7","F7#","G7","G7#","A7","A7#","B7","C8","C8#","D8","D8#","E8","F8","F8#","G8","G8#","A8","A8#","B8","Beyond B8"])
	frequencies = np.array([16.35,17.32,18.35,19.45,20.60,21.83,23.12,24.50,25.96	,27.50	,29.14	,30.87	,32.70	,34.65	,36.71	,38.89	,41.20	,43.65	,46.25	,49.00	,51.91	,55.00	,58.27	,61.74	,65.41	,69.30	,73.42	,77.78	,82.41	,87.31	,92.50	,98.00	,103.83	,110.00	,116.54	,123.47	,130.81	,138.59	,146.83	,155.56	,164.81	,174.61	,185.00	,196.00	,207.65	,220.00	,233.08	,246.94	,261.63	,277.18	,293.66	,311.13	,329.63	,349.23	,369.99	,392.00	,415.30	,440.00	,466.16	,493.88	,523.25	,554.37	,587.33	,622.25	,659.26	,698.46	,739.99	,783.99	,830.61	,880.00	,932.33	,987.77	,1046.50	,1108.73	,1174.66	,1244.51	,1318.51	,1396.91	,1479.98	,1567.98	,1661.22	,1760.00	,1864.66	,1975.53	,2093.00	,2217.46	,2349.32	,2489.02	,2637.02	,2793.83	,2959.96	,3135.96	,3322.44	,3520.00	,3729.31	,3951.07	,4186.01	,4434.92	,4698.64	,4978.03	,5274.04	,5587.65	,5919.91	,6271.93	,6644.88	,7040.00	,7458.62	,7902.13,8000])
	
	# Find the note in the array
	for i, note in enumerate(name):
		if note.upper() == note_name.upper():
			return frequencies[i]
	return None

def tune_audio(audio_file, target_note, tolerance_cents=10):
	"""
	Compare audio frequency against target note and return tuning feedback
	
	Args:
		audio_file: opened wave file
		target_note: string like "A4", "C3", etc.
		tolerance_cents: tolerance in cents (100 cents = 1 semitone)
	
	Returns:
		dict with tuning result
	"""
	# Get the frequency from the audio
	detected_freq = get_frequency_from_audio(audio_file)
	
	# Get the target frequency
	target_freq = get_note_frequency(target_note)
	
	if target_freq is None:
		return {
			"error": f"Unknown target note: {target_note}",
			"detected_frequency": detected_freq
		}
	
	# Calculate the difference in cents
	# Formula: cents = 1200 * log2(f1/f2)
	if detected_freq > 0:
		cents_diff = 1200 * math.log2(detected_freq / target_freq)
		
		# Debug information
		print(f"DEBUG - Tuning: target={target_note} ({target_freq:.2f} Hz), detected={detected_freq:.2f} Hz")
		print(f"DEBUG - Cents calculation: 1200 * log2({detected_freq:.2f}/{target_freq:.2f}) = {cents_diff:.1f}")
	else:
		return {
			"error": "Could not detect frequency from audio",
			"detected_frequency": detected_freq,
			"target_frequency": target_freq
		}
	
	# Determine if it's in tune, too high, or too low
	if abs(cents_diff) <= tolerance_cents:
		tuning_status = "in tune"
	elif cents_diff > 0:
		tuning_status = "too high"
	else:
		tuning_status = "too low"
	
	return {
		"target_note": target_note,
		"target_frequency": target_freq,
		"detected_frequency": detected_freq,
		"cents_difference": round(cents_diff, 1),
		"tuning_status": tuning_status,
		"tolerance_cents": tolerance_cents
	}

if __name__ == "__main__":
	path = os.getcwd()
	wav_file_name = path + "/uploads/input.wav"
	

	
	# Process the .wav file for note detection
	audio_file = wave.open(wav_file_name)
	Detected_Note = note_detect(audio_file)
	print("\n\tDetected Note = " + str(Detected_Note))
	
	# Clean up the temporary .wav file (optional)
	# os.remove(wav_file_name)

	