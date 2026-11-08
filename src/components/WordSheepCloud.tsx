import React, { useState, useMemo } from 'react';
import { Cloud, Sparkles, Filter, Volume2, BookOpen, Heart, Eye } from 'lucide-react';
import { SheepCreature, DreamType } from '../types/sheep';
import { Language, translations, getDreamTypeLabel } from '../i18n/translations';
import { soundEngine } from '../audio/synth';

interface WordSheepCloudProps {
  sheepList: SheepCreature[];
  currentLang?: Language;
  onSelectSheep?: (s: SheepCreature) => void;
}

interface DreamKeyword {
  word: string;
  count: number;
  sentiment: 'good' | 'bad' | 'neutral';
  sheep: Array<{
    id: number;
    name: string;
    hours: number;
    woolColor: string;
    dreamType: DreamType;
    diaryExcerpt: string;
  }>;
}

// Common English stop words to filter out
const ENGLISH_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'got', 'sat', 'stood', 'flew',
]);

export const WordSheepCloud: React.FC<WordSheepCloudProps> = ({
  sheepList,
  currentLang = 'en',
  onSelectSheep,
}) => {
  const t = translations[currentLang].wordSheep;
  const [selectedWord, setSelectedWord] = useState<DreamKeyword | null>(null);
  const [filterMood, setFilterMood] = useState<'all' | 'good' | 'neutral' | 'bad'>('all');

  // Parse words from diaries
  const { keywords, totalParsedWords, moodCounts } = useMemo(() => {
    const wordMap = new Map<string, DreamKeyword>();
    let totalCount = 0;
    const moodStats = { good: 0, neutral: 0, bad: 0 };

    sheepList.forEach((s) => {
      const diary = (s.diary || '').trim();
      if (!diary) return;

      moodStats[s.dreamType] = (moodStats[s.dreamType] || 0) + 1;

      // Extract English words
      const rawWords = diary.split(/[\s,.:;!?"'()[\]{}<>/\\]+/);
      const processedWords: string[] = [];

      // Check if text has Chinese characters
      const hasChinese = /[\u4e00-\u9fa5]/.test(diary);

      if (hasChinese) {
        // Extract 2-to-4 character Chinese tokens
        const cleanZh = diary.replace(/[^\u4e00-\u9fa5]/g, '');
        for (let i = 0; i < cleanZh.length - 1; i++) {
          const bigram = cleanZh.slice(i, i + 2);
          processedWords.push(bigram);
          if (i + 3 <= cleanZh.length) {
            processedWords.push(cleanZh.slice(i, i + 3));
          }
        }
      }

      // Process standard alphabetic words
      rawWords.forEach((rw) => {
        const cleaned = rw.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
        if (cleaned.length >= 3 && !ENGLISH_STOP_WORDS.has(cleaned) && !/^\d+$/.test(cleaned)) {
          processedWords.push(cleaned);
        }
      });

      // Filter and count unique occurrences per sheep
      const uniqueInThisSheep = new Set(processedWords);
      uniqueInThisSheep.forEach((w) => {
        totalCount++;
        const existing = wordMap.get(w);
        if (existing) {
          existing.count += 1;
          existing.sheep.push({
            id: s.id,
            name: s.name,
            hours: s.hours,
            woolColor: s.woolColor,
            dreamType: s.dreamType,
            diaryExcerpt: diary,
          });
        } else {
          wordMap.set(w, {
            word: w,
            count: 1,
            sentiment: s.dreamType,
            sheep: [
              {
                id: s.id,
                name: s.name,
                hours: s.hours,
                woolColor: s.woolColor,
                dreamType: s.dreamType,
                diaryExcerpt: diary,
              },
            ],
          });
        }
      });
    });

    const sorted = Array.from(wordMap.values()).sort((a, b) => b.count - a.count);
    return { keywords: sorted, totalParsedWords: totalCount, moodCounts: moodStats };
  }, [sheepList]);

  // Filtered by mood
  const filteredKeywords = useMemo(() => {
    if (filterMood === 'all') return keywords;
    return keywords.filter((k) => k.sentiment === filterMood);
  }, [keywords, filterMood]);

  // Max count for scaling
  const maxCount = useMemo(() => {
    if (filteredKeywords.length === 0) return 1;
    return Math.max(...filteredKeywords.map((k) => k.count), 1);
  }, [filteredKeywords]);

  const handleWordClick = (kw: DreamKeyword) => {
    setSelectedWord(kw);
    soundEngine.playHappyChirpSound();
  };

  // Dominant mood
  const dominantMoodKey: DreamType =
    moodCounts.good >= moodCounts.neutral && moodCounts.good >= moodCounts.bad
      ? 'good'
      : moodCounts.bad >= moodCounts.neutral
      ? 'bad'
      : 'neutral';

  return (
    <div className="space-y-6">
      
      {/* Header & Concept Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Cloud className="w-5 h-5 text-pink-300" />
              <span>{t.title}</span>
            </h2>
            <span className="text-xs font-mono font-medium text-pink-300 bg-pink-950/70 border border-pink-500/30 px-2 py-0.5 rounded-full">
              {t.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* Quick Mood Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterMood('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterMood === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setFilterMood('good')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterMood === 'good'
                ? 'bg-pink-950/80 text-pink-300 border border-pink-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterGood}
          </button>
          <button
            onClick={() => setFilterMood('neutral')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterMood === 'neutral'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterNeutral}
          </button>
          <button
            onClick={() => setFilterMood('bad')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterMood === 'bad'
                ? 'bg-slate-800 text-slate-200 border border-slate-600 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterBad}
          </button>
        </div>
      </div>

      {/* Live Biometric & Semantic Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-950/60 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{t.statsTotalWords}</span>
            <span className="text-lg font-bold font-mono text-white">{totalParsedWords}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{t.statsUniqueKeywords}</span>
            <span className="text-lg font-bold font-mono text-cyan-300">{keywords.length}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block">{t.statsDominantMood}</span>
            <span className="text-sm font-semibold text-amber-300">
              {getDreamTypeLabel(dominantMoodKey, currentLang)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Word Sheep (Word Cloud Container Shaped Like a Fluffy Valais Blacknose Sheep) */}
      <div className="relative rounded-3xl bg-slate-950/90 border-2 border-slate-800/90 p-6 sm:p-10 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[420px]">
        
        {/* Soft Ambient Aurora & Star Dust */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* The Fluffy Cloud Sheep Outline Container */}
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/60 border border-slate-700/60 rounded-[3rem] p-8 sm:p-12 shadow-inner backdrop-blur-sm">
          
          {/* Sheep Face Badge on Top-Right */}
          <div className="absolute -top-6 -right-3 sm:-top-7 sm:right-4 flex items-center gap-2 bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-2xl shadow-xl">
            {/* Valais Blacknose Mini Face */}
            <div className="w-8 h-7 rounded-full bg-[#1c1917] flex items-center justify-center gap-1 border border-white/20 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full border border-white inline-block"></span>
              <span className="w-1.5 h-1.5 rounded-full border border-white inline-block"></span>
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-white block font-display leading-tight">Word Sheep</span>
              <span className="text-[9px] text-pink-300 font-mono block">Cloud Morphology</span>
            </div>
          </div>

          {/* Tail on Top-Left */}
          <div className="absolute -top-3 -left-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px]">
            ☁️
          </div>

          {/* Cloud Words Fleecing */}
          {filteredKeywords.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Cloud className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm text-slate-400">
                {t.emptyFilter || t.noDiariesYet}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                {t.sampleSheepTip}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 py-4">
              {filteredKeywords.map((kw, idx) => {
                // Dynamic sizing based on frequency count
                const ratio = kw.count / maxCount;
                const fontSize = Math.max(12, Math.min(32, 13 + ratio * 18));
                const isSelected = selectedWord?.word === kw.word;

                // Color based on dream mood
                let textColor = 'text-pink-300 hover:text-pink-100 hover:bg-pink-950/60 border-pink-500/20';
                if (kw.sentiment === 'good') {
                  textColor = idx % 2 === 0
                    ? 'text-pink-300 hover:text-pink-100 hover:bg-pink-950/60 border-pink-500/25'
                    : 'text-purple-300 hover:text-purple-100 hover:bg-purple-950/60 border-purple-500/25';
                } else if (kw.sentiment === 'neutral') {
                  textColor = 'text-emerald-300 hover:text-emerald-100 hover:bg-emerald-950/60 border-emerald-500/25';
                } else {
                  textColor = 'text-slate-300 hover:text-white hover:bg-slate-800/80 border-slate-600/30';
                }

                return (
                  <button
                    key={`${kw.word}-${idx}`}
                    type="button"
                    onClick={() => handleWordClick(kw)}
                    style={{ fontSize: `${fontSize}px` }}
                    className={`group relative transition-all duration-200 transform px-3 py-1 rounded-2xl border font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-200 scale-110 shadow-lg shadow-cyan-950/50 z-20'
                        : `${textColor} hover:scale-105 active:scale-95 bg-slate-950/40`
                    }`}
                  >
                    <span>{kw.word}</span>
                    {kw.count > 1 && (
                      <span className="ml-1 text-[10px] font-mono opacity-60 group-hover:opacity-100">
                        ×{kw.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Little Sheep Hooves at the bottom of the Cloud */}
          <div className="absolute -bottom-3 left-1/4 -translate-x-1/2 w-4 h-5 rounded-b-md bg-[#1c1917] border border-white/20 shadow-md"></div>
          <div className="absolute -bottom-3 left-1/3 -translate-x-1/2 w-4 h-5 rounded-b-md bg-[#1c1917] border border-white/20 shadow-md"></div>
          <div className="absolute -bottom-3 right-1/3 translate-x-1/2 w-4 h-5 rounded-b-md bg-[#1c1917] border border-white/20 shadow-md"></div>
          <div className="absolute -bottom-3 right-1/4 translate-x-1/2 w-4 h-5 rounded-b-md bg-[#1c1917] border border-white/20 shadow-md"></div>
        </div>

        {/* Bottom Click Hint */}
        <p className="text-[11px] text-slate-500 font-mono mt-5 text-center">
          {t.clickHint}
        </p>
      </div>

      {/* Selected Word Dream Inspector Card */}
      {selectedWord && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-display text-white">
                “{selectedWord.word}”
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                {t.wordFrequency}: {selectedWord.count}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {getDreamTypeLabel(selectedWord.sentiment, currentLang)}
              </span>
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              className="text-xs text-slate-500 hover:text-slate-300 font-mono"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              {t.dreamedBy}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedWord.sheep.map((s, idx) => (
                <div
                  key={`${s.id}-${idx}`}
                  onClick={() => {
                    const fullSheep = sheepList.find((item) => item.id === s.id);
                    if (fullSheep && onSelectSheep) {
                      onSelectSheep(fullSheep);
                    }
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer flex items-start gap-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/20"
                    style={{ backgroundColor: s.woolColor }}
                  >
                    <div className="w-5 h-4 rounded-full bg-[#1c1917] flex items-center justify-center gap-0.5">
                      <span className="w-1 h-1 rounded-full border border-white inline-block"></span>
                      <span className="w-1 h-1 rounded-full border border-white inline-block"></span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{s.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{s.hours}h</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic mt-0.5 line-clamp-2">
                      “{s.diaryExcerpt}”
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
