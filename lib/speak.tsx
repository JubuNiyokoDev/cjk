"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { preSpeech } from "./preSpeech";

interface SegmentInfo {
  paragraphIndex: number;
  startWordIndex: number;
  endWordIndex: number;
  text: string;
  preSpeechText: string;
}

function buildSegmentQueue(paragraphs: string[]): SegmentInfo[] {
  const queue: SegmentInfo[] = [];
  paragraphs.forEach((para, pIndex) => {
    const tokens = para.match(/\S+|\s+/g) || [];
    let wordIndex = 0;
    let segmentStartWordIndex = 0;
    let currentSegmentTokens: string[] = [];

    const flushSegment = () => {
      if (currentSegmentTokens.length === 0) return;
      const text = currentSegmentTokens.join(" ");
      queue.push({
        paragraphIndex: pIndex,
        startWordIndex: segmentStartWordIndex,
        endWordIndex: wordIndex - 1,
        text,
        preSpeechText: preSpeech(text),
      });
      currentSegmentTokens = [];
      segmentStartWordIndex = wordIndex;
    };

    tokens.forEach((token) => {
      if (/^\s+$/.test(token)) {
        return;
      }

      const isPunctuation = /^[.!?,;:]$/.test(token);
      currentSegmentTokens.push(token);

      if (isPunctuation) {
        flushSegment();
      }

      wordIndex++;
    });

    if (currentSegmentTokens.length > 0) {
      flushSegment();
    }
  });

  return queue;
}

export default function ReadButton({ paragraphs }: { paragraphs: string[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<SegmentInfo | null>(null);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const queueRef = useRef<SegmentInfo[]>([]);
  const indexRef = useRef(0);

  const speakNext = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current) {
      return;
    }

    const queue = queueRef.current;
    const idx = indexRef.current;

    if (idx >= queue.length) {
      isPlayingRef.current = false;
      isPausedRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSegment(null);
      return;
    }

    const segment = queue[idx];
    setCurrentSegment(segment);

    const utterance = new SpeechSynthesisUtterance(segment.preSpeechText);
    utterance.lang = "fr-FR";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      if (!isPlayingRef.current || isPausedRef.current) {
        return;
      }
      indexRef.current = idx + 1;
      speakNext();
    };

    utterance.onerror = () => {
      isPlayingRef.current = false;
      isPausedRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSegment(null);
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, []);

  const ensureQueue = useCallback(() => {
    const queue = buildSegmentQueue(paragraphs);
    queueRef.current = queue;
    indexRef.current = 0;
  }, [paragraphs]);

  const toggleSpeech = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (!queueRef.current.length) {
      ensureQueue();
    }

    if (isPlayingRef.current && !isPausedRef.current) {
      speechSynthesis.pause();
      isPausedRef.current = true;
      setIsPaused(true);
      return;
    }

    if (isPausedRef.current) {
      speechSynthesis.resume();
      isPausedRef.current = false;
      setIsPaused(false);
      return;
    }

    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);
    setIsPaused(false);
    speakNext();
  }, [ensureQueue, speakNext]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegment(null);
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
      isPlayingRef.current = false;
      isPausedRef.current = false;
    };
  }, []);

  const renderParagraphs = () => {
    return paragraphs.map((para, pIndex) => {
      const tokens = para.match(/\S+|\s+/g) || [];
      let wordCounter = 0;

      return (
        <p key={pIndex} className="text-gray-700 leading-relaxed">
          {tokens.map((token, tIndex) => {
            if (/^\s+$/.test(token)) {
              return <span key={tIndex}>{token}</span>;
            }

            const isCurrent =
              currentSegment?.paragraphIndex === pIndex &&
              wordCounter >= currentSegment.startWordIndex &&
              wordCounter <= currentSegment.endWordIndex;

            const isSegmentEnd = /^[.!?,;:]$/.test(token);

            const content = (
              <span
                key={tIndex}
                className={
                  isCurrent
                    ? "bg-yellow-200 rounded px-0.5"
                    : isSegmentEnd
                    ? "font-semibold"
                    : ""
                }
              >
                {token}
              </span>
            );

            wordCounter++;
            const rendered = [content];
            if (isSegmentEnd) {
              rendered.push(
                <span key={`sep-${tIndex}`} className="inline-block w-1" />
              );
            }
            return rendered;
          })}
        </p>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={toggleSpeech}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          {isPlaying && !isPaused ? "Pause" : isPaused ? "Reprendre" : "Lire le texte"}
        </button>
        {isPlaying && (
          <button
            onClick={stopSpeech}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Arrêter
          </button>
        )}
      </div>
      <div className="space-y-4">
        {renderParagraphs()}
      </div>
    </div>
  );
}
