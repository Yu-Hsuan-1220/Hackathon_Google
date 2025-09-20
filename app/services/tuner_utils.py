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
	name = np.array(["C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8","C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8","Beyond B8"])
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
	Extract the fundamental frequency from an audio file using autocorrelation
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
		# Use middle section of audio for stability
		start = len(sound) // 4
		end = 3 * len(sound) // 4
		sound = sound[start:end]
	
	# Apply high-pass filter to remove DC component and low-frequency noise
	sound = sound - np.mean(sound)
	
	# 加強信號預處理，特別針對高音檢測
	# Apply a gentle high-pass filter to enhance higher frequencies
	if f_s > 0 and len(sound) > 100:
		# Simple high-pass filter using differential
		sound_filtered = np.diff(sound)
		if len(sound_filtered) > 0:
			sound_filtered = np.concatenate(([0], sound_filtered))  # 保持長度一致
			# 混合原始信號和高通濾波信號，增強高頻
			sound = 0.7 * sound + 0.3 * sound_filtered
	
	# Autocorrelation method
	autocorr = np.correlate(sound, sound, mode='full')
	autocorr = autocorr[len(autocorr)//2:]
	
	# For guitar tuning, look for periods corresponding to 80-1500Hz (針對吉他音域優化)
	min_period = int(f_s / 1500)  # Max frequency (針對高把位)
	max_period = int(f_s / 80)    # Min frequency (針對低音弦)

	if max_period >= len(autocorr):
		max_period = len(autocorr) - 1
	
	# Find the peak in the valid range (skip the first few samples)
	if min_period < len(autocorr) and max_period > min_period:
		# 更精確的峰值檢測
		search_range = autocorr[min_period:max_period]
		
		# 找到所有局部峰值
		local_peaks = []
		for i in range(1, len(search_range) - 1):
			if (search_range[i] > search_range[i-1] and 
				search_range[i] > search_range[i+1] and 
				search_range[i] > np.max(search_range) * 0.3):  # 至少是最大值的30%
				local_peaks.append((i + min_period, search_range[i]))
		
		if local_peaks:
			# 選擇最強的峰值
			peak_index = max(local_peaks, key=lambda x: x[1])[0]
		else:
			# 如果沒找到局部峰值，使用原始方法
			peak_index = np.argmax(search_range) + min_period
		
		# Parabolic interpolation for better accuracy
		if peak_index > 0 and peak_index < len(autocorr) - 1:
			y1, y2, y3 = autocorr[peak_index-1], autocorr[peak_index], autocorr[peak_index+1]
			if 2*y2 - y1 - y3 != 0:  # 避免除零錯誤
				x0 = peak_index + (y3 - y1) / (2 * (2*y2 - y1 - y3))
			else:
				x0 = peak_index
		else:
			x0 = peak_index
		
		freq = f_s / x0
	else:
		# Fallback to FFT method with fundamental frequency bias
		fourier = np.fft.fft(sound)
		fourier = np.absolute(fourier)
		
		# Focus on fundamental frequency range for musical notes (針對吉他音域)
		freq_resolution = f_s / len(sound)
		min_bin = int(80 / freq_resolution)   # 吉他最低音E2 ≈ 82Hz
		max_bin = int(1500 / freq_resolution) # 高把位音符上限
		max_bin = min(max_bin, len(fourier)//2)
		
		if min_bin < max_bin:
			imax = np.argmax(fourier[min_bin:max_bin]) + min_bin
			freq = (imax * f_s) / len(sound)
		else:
			freq = 0
	
	return freq

def get_note_frequency(note_name):
	"""
	Get the frequency of a specific note
	Returns frequency in Hz, or None if note not found
	"""
	name = np.array(["C0","C#0","D0","D#0","E0","F0","F#0","G0","G#0","A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1","A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2","A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D5#","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6","A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7","A7","A#7","B7","C8","C#8","D8","D#8","E8","F8","F#8","G8","G#8","A8","A#8","B8","Beyond B8"])
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
	
	# 八度錯誤檢測和修正邏輯
	# 檢查是否檢測到了錯誤的八度
	original_detected_freq = detected_freq
	octave_candidates = []
	
	# 生成可能的八度候選頻率（上下3個八度）
	for octave_shift in [-3, -2, -1, 0, 1, 2, 3]:
		candidate_freq = detected_freq * (2 ** octave_shift)
		if 80 <= candidate_freq <= 1500:  # 在吉他合理範圍內
			cents_diff = abs(1200 * math.log2(candidate_freq / target_freq))
			octave_candidates.append((candidate_freq, cents_diff, octave_shift))
	
	# 選擇cents差異最小的候選頻率
	if octave_candidates:
		best_candidate = min(octave_candidates, key=lambda x: x[1])
		detected_freq = best_candidate[0]
		octave_correction = best_candidate[2]
		
		# 如果進行了八度修正，記錄日誌
		if octave_correction != 0:
			print(f"八度修正: 原始頻率 {original_detected_freq:.2f}Hz -> 修正頻率 {detected_freq:.2f}Hz (八度偏移: {octave_correction})")
	
	# Calculate the difference in cents
	# Formula: cents = 1200 * log2(f1/f2)
	cents_diff = 1200 * math.log2(detected_freq / target_freq)
	
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
		"original_detected_frequency": original_detected_freq,  # 添加原始檢測頻率
		"cents_difference": round(cents_diff, 1),
		"tuning_status": tuning_status,
		"tolerance_cents": tolerance_cents,
		"octave_corrected": octave_correction if 'octave_correction' in locals() else 0
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

	