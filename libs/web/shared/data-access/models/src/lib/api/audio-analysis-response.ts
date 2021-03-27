// Audio analysis crash course - Mark Koh
// https://www.youtube.com/watch?v=goUzHd7cTuA
// https://www.slideshare.net/MarkKoh9/audio-analysis-with-spotifys-web-api

export interface SpotifyApiAudioAnalysisResponse {
  meta: SpotifyApiAudioAnalysisMeta;
  track: SpotifyApiAudioAnalysisTrack;
  bars: SpotifyApiAudioAnalysisBar[];
  beats: SpotifyApiAudioAnalysisBeat[];
  sections: SpotifyApiAudioAnalysisSection[];
  segments: SpotifyApiAudioAnalysisSegment[];
  tatums: SpotifyApiAudioAnalysisTatum[];
}

export interface SpotifyApiAudioAnalysisMeta {
  analyzer_version: string;
  platform: string;
  detailed_status: string;
  status_code: number;
  timestamp: number;
  analysis_time: number;
  input_process: string;
}

export interface SpotifyApiAudioAnalysisTrack {
  num_samples: number;
  duration: number;
  sample_md5: string;
  offset_seconds: number;
  window_seconds: number;
  analysis_sample_rate: number;
  analysis_channels: number;
  end_of_fade_in: number;
  start_of_fade_out: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  codestring: string;
  code_version: number;
  echoprintstring: string;
  echoprint_version: number;
  synchstring: string;
  synch_version: number;
  rhythmstring: string;
  rhythm_version: number;
}

export interface SpotifyApiAudioAnalysisBar {
  start: number;
  duration: number;
  confidence: number;
}

export interface SpotifyApiAudioAnalysisBeat {
  start: number;
  duration: number;
  confidence: number;
}

export interface SpotifyApiAudioAnalysisSection {
  start: number;
  duration: number;
  confidence: number;
  loudness: number;
  tempo: number;
  tempo_confidence: number;
  key: number;
  key_confidence: number;
  mode: number;
  mode_confidence: number;
  time_signature: number;
  time_signature_confidence: number;
}

export interface SpotifyApiAudioAnalysisSegment {
  start: number;
  duration: number;
  confidence: number;
  loudness_start: number;
  loudness_max_time: number;
  loudness_max: number;
  loudness_end: number;
  pitches: number[];
  timbre: number[];
}

export interface SpotifyApiAudioAnalysisTatum {
  start: number;
  duration: number;
  confidence: number;
}
