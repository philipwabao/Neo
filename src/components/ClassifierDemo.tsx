import { useState, useEffect, useRef } from 'react';

const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Rule = { label: string; kws: string[] };
type Task = {
  id: string;
  name: string;
  output: string;
  fallback: string;
  samples: string[];
  rules: Rule[];
};

const TASKS: Task[] = [
  {
    id: 'sentiment',
    name: 'Sentiment',
    output: 'Sentiment',
    fallback: 'Neutral',
    samples: [
      'Honestly the best support experience I have had in years, thank you.',
      'This update broke everything and nobody will help me.',
    ],
    rules: [
      { label: 'Positive', kws: ['love', 'great', 'amazing', 'excellent', 'happy', 'awesome', 'good', 'fantastic', 'perfect', 'best', 'thank'] },
      { label: 'Negative', kws: ['hate', 'terrible', 'awful', 'worst', 'bad', 'horrible', 'disappointed', 'broke', 'broken', 'angry', 'never'] },
    ],
  },
  {
    id: 'toxicity',
    name: 'Toxicity',
    output: 'Toxicity',
    fallback: 'Clean',
    samples: [
      'You are literally the worst player I have ever seen, uninstall the game.',
      'Nice play last round, want to team up for the next match?',
    ],
    rules: [
      { label: 'Toxic', kws: ['idiot', 'stupid', 'hate', 'kill', 'uninstall', 'trash', 'loser', 'worst', 'dumb', 'shut up', 'noob', 'garbage'] },
      { label: 'Clean', kws: ['nice', 'thanks', 'good game', 'team up', 'gg', 'well played', 'please', 'sure'] },
    ],
  },
  {
    id: 'intent',
    name: 'Support Intent',
    output: 'Intent',
    fallback: 'General Inquiry',
    samples: [
      'My package never arrived and I want a refund right now.',
      'Can you confirm you received payment for invoice #4492?',
    ],
    rules: [
      { label: 'Refund Request', kws: ['refund', 'money back', 'return', 'cancel order', 'chargeback'] },
      { label: 'Billing Question', kws: ['invoice', 'charge', 'payment', 'bill', 'subscription', 'receipt', 'pricing'] },
      { label: 'Technical Support', kws: ['broken', 'not working', 'error', 'bug', 'crash', 'cannot', "can't", 'fix', 'login'] },
    ],
  },
  {
    id: 'spam',
    name: 'Spam',
    output: 'Spam',
    fallback: 'Not Spam',
    samples: [
      'Get rich quick! Click here to claim your $1000 gift card now!!!',
      'Hi Sarah, attaching the notes from this morning standup. Talk soon.',
    ],
    rules: [
      { label: 'Spam', kws: ['click here', 'free', 'win', 'winner', 'gift card', 'claim', 'prize', 'congratulations', 'limited time', 'act now', '$', '!!!', 'rich'] },
    ],
  },
  {
    id: 'topic',
    name: 'Topic',
    output: 'Topic',
    fallback: 'General',
    samples: [
      'The central bank raised interest rates again to cool inflation.',
      'The new GPU delivers a huge jump in training throughput.',
    ],
    rules: [
      { label: 'Finance', kws: ['bank', 'interest', 'inflation', 'stock', 'market', 'revenue', 'earnings', 'investment', 'rate'] },
      { label: 'Technology', kws: ['gpu', 'software', 'model', 'training', 'chip', 'api', 'app', 'code', 'data', 'compute'] },
      { label: 'Health', kws: ['patient', 'clinical', 'disease', 'treatment', 'doctor', 'symptom', 'health', 'medical'] },
      { label: 'Sports', kws: ['game', 'team', 'season', 'player', 'match', 'score', 'league', 'championship'] },
    ],
  },
];

type Score = { name: string; p: number };
type Result = { label: string; scores: Score[]; latencyMs: number };

function classify(task: Task, text: string): Result {
  const t = text.toLowerCase();

  const labels: string[] = [];
  for (const rule of task.rules) if (!labels.includes(rule.label)) labels.push(rule.label);
  if (!labels.includes(task.fallback)) labels.push(task.fallback);

  const hits: Record<string, number> = {};
  for (const lbl of labels) hits[lbl] = 0;
  for (const rule of task.rules) {
    let h = 0;
    for (const kw of rule.kws) if (t.includes(kw)) h++;
    hits[rule.label] = Math.max(hits[rule.label], h);
  }

  let bestLabel = task.fallback;
  let bestHits = 0;
  for (const rule of task.rules) {
    if (hits[rule.label] > bestHits) {
      bestHits = hits[rule.label];
      bestLabel = rule.label;
    }
  }

  const jitter = text.trim().length % 4;
  const confidence =
    bestHits === 0
      ? Math.min(89, 82 + jitter)
      : Math.min(99.4, 88 + bestHits * 3.2 + jitter);
  const topP = confidence / 100;

  const others = labels.filter((l) => l !== bestLabel);
  const weights = others.map((l) => hits[l] + 0.35);
  const wsum = weights.reduce((a, b) => a + b, 0) || 1;
  const remaining = 1 - topP;

  const scores: Score[] = [{ name: bestLabel, p: topP }];
  others.forEach((l, i) => scores.push({ name: l, p: remaining * (weights[i] / wsum) }));
  scores.sort((a, b) => b.p - a.p);

  const latencyMs = 18 + (text.trim().length % 34);
  return { label: bestLabel, scores, latencyMs };
}

export default function ClassifierDemo() {
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [sampleIdx, setSampleIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [shown, setShown] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const task = TASKS.find((t) => t.id === taskId)!;
  const text = task.samples[sampleIdx];

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function reset() {
    setStatus('idle');
    setResult(null);
    setShown(false);
  }
  function pickTask(id: string) {
    setTaskId(id);
    setSampleIdx(0);
    reset();
  }
  function pickSample(idx: number) {
    setSampleIdx(idx);
    reset();
  }
  function run() {
    if (!text.trim()) return;
    setStatus('analyzing');
    setResult(null);
    setShown(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const r = classify(task, text);
      setResult(r);
      setStatus('done');
      if (REDUCED) setShown(true);
      else requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    }, 650);
  }

  return (
    <section className="w-full px-6 md:px-8 py-20 md:py-28 border-t border-[#E6E1D6] bg-[#EFEBE2]">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl text-left md:text-center mx-auto mb-10 md:mb-12">
          <p className="text-[0.65rem] font-mono tracking-[0.2em] uppercase text-[#B8541F]">
            Try it
          </p>
          <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-sans font-semibold tracking-tight leading-tight">
            See a classifier respond.
          </h2>
          <p className="mt-4 text-sm md:text-base text-[#6B6760] leading-relaxed">
            Pick a task and run a sample. An illustrative demo; your own model is
            fine-tuned on your labels.
          </p>
        </div>

        {/* Task tabs */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2 mb-6">
          {TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTask(t.id)}
              className={
                'px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full text-[0.65rem] md:text-[0.7rem] font-mono uppercase tracking-wide border transition-colors ' +
                (t.id === taskId
                  ? 'bg-[#1A1815] text-white border-[#1A1815]'
                  : 'bg-white text-[#4A463F] border-[#E6E1D6] hover:border-[#CCC6BA] hover:text-[#1A1815]')
              }
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Console */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#E6E1D6] border border-[#E6E1D6] rounded-xl overflow-hidden">
          {/* Input */}
          <div className="bg-white p-5 md:p-6 lg:p-7 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[0.6rem] font-mono uppercase tracking-wide text-[#928C82]">
                Input
              </span>
              <div className="flex gap-1.5">
                {task.samples.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => pickSample(i)}
                    aria-label={`Sample ${i === 0 ? 'A' : 'B'}`}
                    className={
                      'text-[0.58rem] font-mono uppercase tracking-wide rounded-full px-3 py-1 border transition-colors ' +
                      (i === sampleIdx
                        ? 'bg-[#1A1815] text-white border-[#1A1815]'
                        : 'bg-white text-[#807A70] border-[#E6E1D6] hover:border-[#CCC6BA] hover:text-[#1A1815]')
                    }
                  >
                    {i === 0 ? 'A' : 'B'}
                  </button>
                ))}
              </div>
            </div>
            <p className="flex-1 min-h-[110px] text-[0.9rem] text-[#1A1815] italic bg-[#F5F2EB] border border-[#E6E1D6] rounded-lg p-4 leading-relaxed">
              {text}
            </p>
            <button
              onClick={run}
              disabled={status === 'analyzing'}
              className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#B8541F] text-white text-[0.72rem] uppercase tracking-[0.15em] font-semibold rounded-lg hover:bg-[#9f4519] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'analyzing' ? 'Classifying…' : 'Classify'}
              {status !== 'analyzing' && <span aria-hidden>→</span>}
            </button>
          </div>

          {/* Result */}
          <div className="bg-white p-5 md:p-6 lg:p-7 flex flex-col">
            <span className="text-[0.6rem] font-mono uppercase tracking-wide text-[#928C82] mb-3">
              Result
            </span>

            <div key={status} className="tab-fade flex-1 flex flex-col min-h-0">
            {status === 'idle' && (
              <div className="flex-1 flex items-center justify-center text-[0.75rem] font-mono text-[#928C82] min-h-[200px]">
                Run a classification to see the result.
              </div>
            )}

            {status === 'analyzing' && (
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <span className="flex items-center gap-2 text-[0.75rem] font-mono text-[#B8541F]">
                  <span className="w-2 h-2 rounded-full bg-[#B8541F] animate-pulse" />
                  Analyzing…
                </span>
              </div>
            )}

            {status === 'done' && result && (
              <div className="flex-1 flex flex-col min-h-[200px]">
                <div className="flex items-baseline justify-between gap-3 pb-4 border-b border-[#E6E1D6]">
                  <span className="font-sans text-xl md:text-2xl font-semibold tracking-tight text-[#1A1815]">
                    {result.label}
                  </span>
                  <span className="text-[0.6rem] font-mono uppercase tracking-wide text-[#928C82]">
                    {task.output}
                  </span>
                </div>

                <div className="mt-5 space-y-3.5">
                  {result.scores.slice(0, 3).map((s, i) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={'text-[0.7rem] font-mono uppercase tracking-wide ' + (i === 0 ? 'text-[#1A1815]' : 'text-[#928C82]')}>
                          {s.name}
                        </span>
                        <span className={'text-[0.7rem] font-mono ' + (i === 0 ? 'text-[#1A1815] font-semibold' : 'text-[#928C82]')}>
                          {(s.p * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-[#ECE8DF] rounded-full h-2 overflow-hidden">
                        <div
                          className={'h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ' + (i === 0 ? 'bg-[#B8541F]' : 'bg-[#D8C9BC]')}
                          style={{ width: shown ? `${(s.p * 100).toFixed(1)}%` : '0%', transitionDelay: `${i * 80}ms` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-auto pt-5 text-[0.6rem] font-mono uppercase tracking-wide text-[#928C82]">
                  Responded in {result.latencyMs} ms
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
