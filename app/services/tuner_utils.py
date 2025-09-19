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
	
	freq=(imax*f_s)/(file_length*counter) #formula to convert index into sound frequency
	
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
	Extract the fundamental frequency from an audio file using autocorrelation with octave correction
	Returns the frequency in Hz
	"""
	#here we are just storing our sound file as a numpy array
	file_length=audio_file.getnframes() 
	f_s=audio_file.getframerate() #sampling frequency
	channels = audio_file.getnchannels() #number of channels mono/stereo
	sample_width = audio_file.getsampwidth() #sample width in bytes
	
	sound = np.zeros(file_length) #blank array

	for i in range(file_length):
		wdata=audio_file.readframes(1)
		if channels == 1:
			# Mono audio
			if sample_width == 1:
				data=struct.unpack("<B",wdata)
				sound[i] = int(data[0]) - 128
			elif sample_width == 2:
				data=struct.unpack("<h",wdata)
				sound[i] = int(data[0])
			elif sample_width == 4:
				data=struct.unpack("<i",wdata)
				sound[i] = int(data[0])
		else:
			# Stereo audio - take average of channels
			if sample_width == 1:
				data=struct.unpack("<BB",wdata)
				sound[i] = (int(data[0]) + int(data[1])) / 2 - 128
			elif sample_width == 2:
				data=struct.unpack("<hh",wdata)
				sound[i] = (int(data[0]) + int(data[1])) / 2
			elif sample_width == 4:
				data=struct.unpack("<ii",wdata)
				sound[i] = (int(data[0]) + int(data[1])) / 2
	
	# Normalize sound based on sample width
	if sample_width == 1:
		sound=np.divide(sound,float(2**7)) #scaling it to -1 to 1
	elif sample_width == 2:
		sound=np.divide(sound,float(2**15)) #scaling it to -1 to 1
	elif sample_width == 4:
		sound=np.divide(sound,float(2**31)) #scaling it to -1 to 1
	
	# Use autocorrelation to find fundamental frequency
	# This is better for musical pitch detection
	
	# Apply window to reduce edge effects
	if len(sound) > 1024:
		# Use middle section of audio
		start = len(sound) // 4
		end = 3 * len(sound) // 4
		sound = sound[start:end]
	
	# Apply high-pass filter to remove DC component
	sound = sound - np.mean(sound)
	
	# Try multiple methods and choose the most consistent result
	frequencies_detected = []
	
	# Method 1: Autocorrelation method
	autocorr = np.correlate(sound, sound, mode='full')
	autocorr = autocorr[len(autocorr)//2:]
	
	# For guitar tuning, look for periods corresponding to 60-800Hz
	min_period = int(f_s / 800)  # Max frequency
	max_period = int(f_s / 60)   # Min frequency

	if max_period >= len(autocorr):
		max_period = len(autocorr) - 1
	
	# Find multiple peaks in the valid range
	if min_period < len(autocorr) and max_period > min_period:
		# Find the strongest peak
		peak_index = np.argmax(autocorr[min_period:max_period]) + min_period
		
		# Parabolic interpolation for better accuracy
		if peak_index > 0 and peak_index < len(autocorr) - 1:
			y1, y2, y3 = autocorr[peak_index-1], autocorr[peak_index], autocorr[peak_index+1]
			x0 = peak_index + (y3 - y1) / (2 * (2*y2 - y1 - y3))
		else:
			x0 = peak_index
		
		freq_autocorr = f_s / x0
		frequencies_detected.append(freq_autocorr)
		
		# Also check for octave multiples (fundamental frequency might be missed)
		for octave_mult in [2, 4]:  # Check 1 and 2 octaves higher
			octave_freq = freq_autocorr * octave_mult
			if 60 <= octave_freq <= 800:  # Still in valid guitar range
				frequencies_detected.append(octave_freq)
	
	# Method 2: FFT method with harmonic analysis
	fourier = np.fft.fft(sound)
	fourier = np.absolute(fourier)
	
	# Focus on fundamental frequency range for musical notes
	freq_resolution = f_s / len(sound)
	min_bin = int(60 / freq_resolution)   
	max_bin = int(800 / freq_resolution)  
	max_bin = min(max_bin, len(fourier)//2)
	
	if min_bin < max_bin:
		# Find the strongest peak
		imax = np.argmax(fourier[min_bin:max_bin]) + min_bin
		freq_fft = (imax * f_s) / len(sound)
		frequencies_detected.append(freq_fft)
		
		# Look for potential fundamental frequency if this might be a harmonic
		for divisor in [2, 3, 4]:  # Check if current peak is 2nd, 3rd, or 4th harmonic
			potential_fundamental = freq_fft / divisor
			if 60 <= potential_fundamental <= 800:
				frequencies_detected.append(potential_fundamental)
	
	# Choose the most likely fundamental frequency
	if not frequencies_detected:
		return 0
	
	# For guitar strings, prefer frequencies in the expected ranges:
	# E2: ~82Hz, A2: ~110Hz, D3: ~147Hz, G3: ~196Hz, B3: ~247Hz, E4: ~330Hz
	guitar_ranges = [
		(75, 90),   # E2 range
		(100, 120), # A2 range  
		(140, 155), # D3 range
		(185, 210), # G3 range
		(235, 260), # B3 range
		(315, 350)  # E4 range
	]
	
	# Score each detected frequency based on how well it fits guitar ranges
	best_freq = 0
	best_score = -1
	
	for freq in frequencies_detected:
		score = 0
		
		# Give higher score if frequency is in a typical guitar range
		for low, high in guitar_ranges:
			if low <= freq <= high:
				score += 10
				break
		else:
			# Even if not in exact range, closer to guitar ranges is better
			min_distance = min(abs(freq - (low + high)/2) for low, high in guitar_ranges)
			score += max(0, 5 - min_distance / 20)
		
		# Prefer frequencies that are not too high or too low
		if 70 <= freq <= 400:
			score += 2
		
		if score > best_score:
			best_score = score
			best_freq = freq
	
	# If no good candidate found, fall back to the first detection
	if best_freq == 0 and frequencies_detected:
		best_freq = frequencies_detected[0]
	
	return best_freq

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
	
	if detected_freq <= 0:
		return {
			"error": "Could not detect frequency from audio",
			"detected_frequency": detected_freq,
			"target_frequency": target_freq
		}
	
	# Calculate the difference in cents
	# Formula: cents = 1200 * log2(f1/f2)
	cents_diff = 1200 * math.log2(detected_freq / target_freq)
	
	# Check for octave errors and correct them
	# If the difference is close to ±1200 cents (1 octave) or ±2400 cents (2 octaves), 
	# the detection might have picked up a harmonic instead of fundamental
	original_cents_diff = cents_diff
	corrected_freq = detected_freq
	
	# Check for octave errors (within ±50 cents of exact octave multiples)
	octave_corrections = []
	for octave_shift in [-2, -1, 1, 2]:  # Check 2 octaves down, 1 octave down, 1 octave up, 2 octaves up
		corrected_candidate = detected_freq * (2 ** octave_shift)
		candidate_cents_diff = 1200 * math.log2(corrected_candidate / target_freq)
		octave_corrections.append((abs(candidate_cents_diff), candidate_cents_diff, corrected_candidate, octave_shift))
	
	# Sort by absolute cents difference to find the best correction
	octave_corrections.sort(key=lambda x: x[0])
	
	# If the best octave correction is significantly better than the original, use it
	best_abs_cents, best_cents_diff, best_freq, best_octave_shift = octave_corrections[0]
	
	if best_abs_cents < abs(original_cents_diff) and best_abs_cents < 200:  # Much better and reasonable
		print(f"DEBUG: Octave correction applied - shifted {best_octave_shift} octaves")
		print(f"DEBUG: Original: {detected_freq:.2f}Hz ({original_cents_diff:.1f} cents)")
		print(f"DEBUG: Corrected: {best_freq:.2f}Hz ({best_cents_diff:.1f} cents)")
		cents_diff = best_cents_diff
		corrected_freq = best_freq
	
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
		"detected_frequency": corrected_freq,  # Return the corrected frequency
		"original_detected_frequency": detected_freq,  # Also include original for debugging
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

	