import React, { useState, useRef, useEffect } from 'react';
import { Book, Volume2, Pause, Play, Settings, X, SkipForward, SkipBack, Bookmark, Clock, Volume1, Volume, VolumeX } from 'lucide-react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure the worker
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export function PDFAudiobook() {
  const [pdfText, setPdfText] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [fileName, setFileName] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [readingTime, setReadingTime] = useState('');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const utteranceRef = useRef(null);
  const fileInputRef = useRef(null);
  const progressInterval = useRef();

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const voiceOptions = availableVoices.map((voice) => ({
        name: `${voice.name} (${voice.lang})`,
        voice: voice,
      }));
      setVoices(voiceOptions);
      setSelectedVoice(voiceOptions[0] || null);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load saved bookmarks
    const savedBookmarks = localStorage.getItem('pdf-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }

    return () => {
      window.speechSynthesis.cancel();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target.result);
      const pdf = await getDocument(typedarray).promise;
      const textContent = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str).join(' ');
        textContent.push(text);
      }
      setPdfText(textContent);
      setCurrentPage(0);

      // Calculate estimated reading time
      const wordsPerMinute = 150;
      const totalWords = textContent.join(' ').split(' ').length;
      const minutes = Math.ceil(totalWords / wordsPerMinute);
      setReadingTime(`${minutes} minutes`);
      setTotalTime(minutes * 60);
    };
    reader.readAsArrayBuffer(file);
  };

  const addBookmark = () => {
    const newBookmark = {
      page: currentPage,
      timestamp: new Date().toLocaleString(),
      snippet: pdfText[currentPage].slice(0, 100) + '...',
    };
    const updatedBookmarks = [...bookmarks, newBookmark];
    setBookmarks(updatedBookmarks);
    localStorage.setItem('pdf-bookmarks', JSON.stringify(updatedBookmarks));
  };

  const removeBookmark = (index) => {
    const updatedBookmarks = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('pdf-bookmarks', JSON.stringify(updatedBookmarks));
  };

  const goToBookmark = (page) => {
    stop();
    setCurrentPage(page);
  };

  const speak = () => {
    if (!pdfText.length || !selectedVoice) return;
    if (isPlaying) {
      stop();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(pdfText[currentPage]);
    utterance.voice = selectedVoice.voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onend = () => {
      if (currentPage < pdfText.length - 1) {
        setCurrentPage((prev) => prev + 1);
        speak();
      } else {
        stop();
      }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);

    // Start progress tracking
    let startTime = Date.now() - currentTime * 1000;
    progressInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(elapsed);
    }, 1000);
  };

  const togglePause = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const changePage = (direction) => {
    stop();
    if (direction === 'next' && currentPage < pdfText.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX />;
    if (volume < 0.5) return <Volume1 />;
    return <Volume />;
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Book className="w-6 h-6" style={{ color: 'rgba(172, 90, 4, 1)' }} />
          <h2 className="text-2xl font-semibold" style={{ color: 'rgba(172, 90, 4, 1)' }}>PDF Audiobook Converter</h2>
        </div>
        <div className="flex items-center gap-2">
          {readingTime && (
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
              <Clock className="w-4 h-4" />
              <span>{readingTime}</span>
            </div>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" style={{ color: 'rgba(172, 90, 4, 1)' }} />
          </button>
        </div>
      </div>
      <div className="mb-6">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
          ref={fileInputRef}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full p-8 border-2 border-dashed rounded-lg transition-colors"
          style={{ borderColor: 'rgba(172, 90, 4, 0.3)', backgroundColor: 'rgba(172, 90, 4, 0.05)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <Book className="w-8 h-8" style={{ color: 'rgba(172, 90, 4, 0.6)' }} />
            <span style={{ color: 'rgba(172, 90, 4, 0.8)' }}>Click to upload PDF or drag and drop</span>
            {fileName && <span className="text-sm" style={{ color: 'rgba(172, 90, 4, 0.6)' }}>Selected: {fileName}</span>}
          </div>
        </button>
      </div>
      {showSettings && (
        <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(172, 90, 4, 0.05)' }}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium" style={{ color: 'rgba(172, 90, 4, 1)' }}>Voice Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" style={{ color: 'rgba(172, 90, 4, 1)' }} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                Voice
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const voice = voices.find((v) => v.name === e.target.value);
                  setSelectedVoice(voice || null);
                }}
                className="w-full p-2 border rounded-md"
                style={{ borderColor: 'rgba(172, 90, 4, 0.3)' }}
              >
                {voices.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                Speed: {rate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'rgba(172, 90, 4, 1)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                Pitch: {pitch}
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'rgba(172, 90, 4, 1)' }}
              />
            </div>
          </div>
        </div>
      )}
      {pdfText.length > 0 && (
        <>
          <div className="mb-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(172, 90, 4, 0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                  Page {currentPage + 1} of {pdfText.length}
                </span>
                <button
                  onClick={addBookmark}
                  className="flex items-center gap-1 px-3 py-1 rounded-md text-sm"
                  style={{ backgroundColor: 'rgba(172, 90, 4, 0.1)', color: 'rgba(172, 90, 4, 1)' }}
                >
                  <Bookmark className="w-4 h-4" />
                  Bookmark
                </button>
              </div>
              <div className="h-48 overflow-y-auto p-4 bg-white rounded border mb-2" style={{ borderColor: 'rgba(172, 90, 4, 0.3)' }}>
                {pdfText[currentPage]}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                  {formatTime(currentTime)} / {formatTime(totalTime)}
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: 'rgba(172, 90, 4, 1)',
                      width: `${(currentTime / totalTime) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          {bookmarks.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2" style={{ color: 'rgba(172, 90, 4, 1)' }}>Bookmarks</h3>
              <div className="space-y-2">
                {bookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(172, 90, 4, 0.05)' }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'rgba(172, 90, 4, 1)' }}>
                          Page {bookmark.page + 1}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(172, 90, 4, 0.6)' }}>
                          {bookmark.timestamp}
                        </span>
                      </div>
                      <p className="text-sm truncate" style={{ color: 'rgba(172, 90, 4, 0.8)' }}>
                        {bookmark.snippet}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToBookmark(bookmark.page)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <Play className="w-4 h-4" style={{ color: 'rgba(172, 90, 4, 1)' }} />
                      </button>
                      <button
                        onClick={() => removeBookmark(index)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" style={{ color: 'rgba(172, 90, 4, 1)' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => changePage('prev')}
          disabled={currentPage === 0 || isPlaying}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          style={{ color: 'rgba(172, 90, 4, 1)' }}
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={speak}
          disabled={!pdfText.length}
          className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'rgba(172, 90, 4, 1)' }}
        >
          {isPlaying ? (
            <>
              <X className="w-5 h-5" /> Stop
            </>
          ) : (
            <>
              <Play className="w-5 h-5" /> Play
            </>
          )}
        </button>
        {isPlaying && (
          <button
            onClick={togglePause}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: 'rgba(172, 90, 4, 0.8)' }}
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" /> Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            )}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className="p-2 hover:bg-gray-100 rounded-full"
            style={{ color: 'rgba(172, 90, 4, 1)' }}
          >
            <VolumeIcon />
          </button>
          {showVolumeSlider && (
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg shadow-lg"
              style={{ backgroundColor: 'rgba(172, 90, 4, 0.05)' }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-32 h-2"
                style={{ accentColor: 'rgba(172, 90, 4, 1)' }}
              />
            </div>
          )}
        </div>
        <button
          onClick={() => changePage('next')}
          disabled={currentPage === pdfText.length - 1 || isPlaying}
          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          style={{ color: 'rgba(172, 90, 4, 1)' }}
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}