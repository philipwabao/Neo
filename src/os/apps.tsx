import { useState, useRef, useEffect } from 'react'
import type { ReactNode, ComponentType } from 'react'
import { FlockMark, SpecimenPlate, KestrelCard, ComingSoonCard } from '../components/Hero'
import ClassifierDemo from '../components/ClassifierDemo'
import SSMBenefits from '../components/SSMBenefits'

export type AppDef = {
  id: string
  title: string
  code: string
  w: number
  h: number
  x: number
  y: number
  Body: ComponentType
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[0.62rem] font-mono uppercase tracking-[0.24em] text-[#B8541F]">{children}</p>
}

/* ── Terminal: a small archive you can walk (ls / cd / cat / tree) ── */
type Line = { out: ReactNode }
function classifyText(text: string): string {
  const t = text.toLowerCase()
  const pos = ['love', 'great', 'amazing', 'excellent', 'happy', 'good', 'best', 'thank', 'awesome', 'perfect']
  const neg = ['hate', 'terrible', 'awful', 'worst', 'bad', 'broken', 'angry', 'disappointed', 'never', 'horrible']
  let p = 0, n = 0
  for (const k of pos) if (t.includes(k)) p++
  for (const k of neg) if (t.includes(k)) n++
  if (p === 0 && n === 0) return 'Neutral · 0.84'
  return p >= n ? `Positive · 0.9${Math.min(8, 1 + p)}` : `Negative · 0.9${Math.min(8, 1 + n)}`
}

/* the field record, as a tiny read-only filesystem */
const HOME = '/home/kestrel'
type FsNode = { kind: 'dir' | 'file'; content: string; action: string }
type RawNode = { path: string; kind: 'dir' | 'file'; content: string; action: string }

const FS_RAW: RawNode[] = [
  { path: '/home/kestrel', kind: 'dir', content: '', action: '' },
  { path: '/home/kestrel/readme.txt', kind: 'file', action: '', content: `Neognathae archive
==================

You are in the field record for Neognathae, a small growing
family of focused single-task AI models, by the research lab
Auxerta.

One model is live today: Kestrel (NEO-001), a custom text
classifier. The rest of the family is in preparation.

Walk it like any directory.

  kestrel/       what Kestrel is, and how to try it
  engagement/    the method, the pricing, what we need
  family/        the model family, one entry per slot
  lab/           about Neognathae, Auxerta, and our honesty rule

  start-here.txt the short path through the archive
  status.txt     a quick system summary
  contact.txt    how to reach us

Move with cd, look with ls, read with cat, map it with tree.
Type help for every command.

New here? cat start-here.txt` },
  { path: '/home/kestrel/start-here.txt', kind: 'file', action: '', content: `Start here
==========

The shortest path through the archive, top to bottom:

  cat kestrel/what-it-is.txt      what Kestrel is
  cat engagement/method.txt       how an engagement runs
  cat engagement/pricing.txt      what it costs
  cat kestrel/try-it.txt          run a classification
  cat contact.txt                 talk to a person

Prefer the live window? Some files open a tab as you read them.
From anywhere you can also run:

  classify the support team was wonderful, thank you
  open Try it

When in doubt: ls, then cd, then cat.` },
  { path: '/home/kestrel/status.txt', kind: 'file', action: '', content: `System status
=============

SYSTEM     Neognathae OS, Edition 2026
KESTREL    live, text classification, private API
FAMILY     01 collected, 07 in preparation
LATENCY    ~18 ms (illustrative, established per deployment)
LAB        Auxerta, auxerta.com

The latency figure is illustrative. Real numbers are set on
your data, per deployment, before anything goes live.` },
  { path: '/home/kestrel/contact.txt', kind: 'file', action: '', content: `Contact
=======

  Email    contact@auxerta.com
  Web      auxerta.com

The best first step is the free data evaluation. Tell us what
your text looks like and what you would like to sort it into,
and we will tell you honestly whether Kestrel is a good fit.

We take on a limited number of projects at a time, and only
when we are confident we can help.

You can also type contact in this terminal, or open Plate to
start an inquiry in the window.` },

  { path: '/home/kestrel/kestrel', kind: 'dir', content: '', action: '' },
  { path: '/home/kestrel/kestrel/card.txt', kind: 'file', action: '', content: `Specimen card
=============

  Accession   NEO-001
  Name        Kestrel
  Status      live
  Task        text classification
  Serving     private API

Kestrel is a custom text classifier. It is trained on your
labels and your terminology, then served behind a private API.
You send text in. You get back one label and a confidence
score, in milliseconds.

The kestrel is the small falcon that hunts by holding still in
the air over one patch of ground. We borrowed the name on
purpose. This model does one narrow thing, in one place, with
a steady eye.

Keep reading in this drawer:

  cat what-it-is.txt     the plain description
  cat how-it-reads.txt   input and output
  cat try-it.txt         run a classification
  cat uses.txt           where teams point it
  cat specs.txt          the shape and the numbers` },
  { path: '/home/kestrel/kestrel/what-it-is.txt', kind: 'file', action: '', content: `What Kestrel is
===============

Kestrel is a custom text classifier. We fine-tune it on your
labels and your terminology, then serve it behind a private
API that only you call.

Send text in. Get back a label and a confidence score, in
milliseconds.

That is the whole job. One task, done well. It is not a
chatbot and not a general assistant. It reads a piece of text
and tells you which of your categories it belongs to, the way
your own team would, only faster and at scale.

It is yours alone. The model is fine-tuned on your data and
not shared with anyone else.

Kestrel is the code NEO-001, the first model in the family.
See family/census.txt for the rest.` },
  { path: '/home/kestrel/kestrel/how-it-reads.txt', kind: 'file', action: '', content: `How it reads
============

  IN     a piece of text
  OUT    one label, plus a confidence score

  in:    my order never arrived and I want my money back
  out:   Refund Request, 0.95 (illustrative)

The label is whichever of your categories fits best. The score
says how sure the model is. Both come back in milliseconds
over a private API you call from your own application.

Every score shown in this archive is illustrative. The model
that runs on your data is fine-tuned on your labels, and its
accuracy is measured on your data, not promised in advance.` },
  { path: '/home/kestrel/kestrel/try-it.txt', kind: 'file', action: 'Try it', content: `Try it
======

Opening the Try it tab, where you can paste text and watch a
classification run.

You can also run one here without leaving the terminal:

  classify the support team was wonderful, thank you
  classify this update broke everything and nobody helps

It returns a label and a confidence score, for example:

  Positive, 0.94 (illustrative)

This demo uses simple keyword matching, so it is only a sketch
of the shape of a result. A real Kestrel model is fine-tuned
on your data and your categories, and its accuracy is
established per deployment.` },
  { path: '/home/kestrel/kestrel/uses.txt', kind: 'file', action: 'Uses', content: `Where a classifier helps
========================

Opening the Uses tab.

If your team is reading text and sorting it into the same
handful of buckets all day, that is the job. Common shapes:

  - routing support tickets to the right queue
  - tagging feedback by topic or sentiment
  - flagging content for review against your policy
  - separating real inbound from spam
  - labeling records with your own taxonomy

These are illustrations of the kind of task, not a fixed menu.
The categories are yours. Kestrel learns the labels and the
wording your team already uses, rather than a generic
off-the-shelf scheme. If your text has categories and enough
examples to learn from, the free evaluation will tell you
whether it is in range.` },
  { path: '/home/kestrel/kestrel/specs.txt', kind: 'file', action: '', content: `Shape and numbers
=================

  Input      a piece of text
  Output     one label, plus a confidence score
  Transport  private API, called from your app
  Latency    ~18 ms per call (illustrative)
  Accuracy   ~88 to 98% (illustrative)

All figures here are illustrative. Real accuracy is
established per deployment, on your data, before anything
goes live. We do not quote benchmarks we have not run for you.

For the live instruments, run open Insights.` },

  { path: '/home/kestrel/engagement', kind: 'dir', content: '', action: '' },
  { path: '/home/kestrel/engagement/method.txt', kind: 'file', action: 'Method', content: `Method, four steps
==================

Opening the Method tab. From raw data to a live API:

  01  Data         send whatever you have, raw and unlabeled
  02  Annotation   we turn it into clean labeled pairs, in-house
  03  Fine-tuning  we train a model on your data and terminology
  04  Live API     your model goes live behind a private API

The first step, the data evaluation, is free. Each step has
its own file in this folder:

  cat 01-data.txt
  cat 02-annotation.txt
  cat 03-fine-tuning.txt
  cat 04-live-api.txt

For what it costs, cat pricing.txt.` },
  { path: '/home/kestrel/engagement/01-data.txt', kind: 'file', action: '', content: `01  Data
========

Send whatever you have: raw, messy, unlabeled. We typically
start from 10,000 examples and up.

You do not need to clean or sort it first. The mess is
expected. Getting it to us is the only work on your side at
this stage.

Next: cat 02-annotation.txt` },
  { path: '/home/kestrel/engagement/02-annotation.txt', kind: 'file', action: '', content: `02  Annotation
==============

We turn your data into clean labeled pairs, in-house under
direct oversight. It is never routed to third-party vendors.

This is where your categories and your terminology get pinned
down precisely, so the model learns the distinctions you
actually care about.

Next: cat 03-fine-tuning.txt` },
  { path: '/home/kestrel/engagement/03-fine-tuning.txt', kind: 'file', action: '', content: `03  Fine-tuning
===============

We train a model on your data and your terminology. It is
yours alone.

It is not shared across customers and not a generic model with
a prompt bolted on. The result is a classifier shaped to your
label schema.

Next: cat 04-live-api.txt` },
  { path: '/home/kestrel/engagement/04-live-api.txt', kind: 'file', action: '', content: `04  Live API
============

Your model goes live behind a private API, ready to call from
your app.

Send text in, get a label and a confidence score back in
milliseconds. Latency is around 18 ms, illustrative and
established per deployment.

That is the full arc. For what it costs, cat pricing.txt. To
begin, cat ../contact.txt.` },
  { path: '/home/kestrel/engagement/pricing.txt', kind: 'file', action: 'Pricing', content: `Pricing
=======

Opening the Pricing tab.

  Data evaluation       Free
      Scope, feasibility, and label-schema review.

  Initial fine-tuning   $3k to $5k, one-time
      Setup and optimization of your model.

  Dedicated hosting     $2,500 to $5,000+/mo, flat
      Tiered by volume. No per-use billing.

Free to scope. Then a one-time setup fee, then a flat monthly
subscription once the model is live. You are not billed per
call, and there are no long contracts to start.

We take on a limited number of projects at a time, and only
when we are confident we can help.

To begin, cat ../contact.txt.` },
  { path: '/home/kestrel/engagement/what-we-need.txt', kind: 'file', action: '', content: `What we need from you
=====================

To scope a model, the useful things to send are:

  - your text, as it really is. Raw, messy, unlabeled is fine.
  - the categories you want to sort it into, if you know them
  - roughly how much you have. We usually start from 10,000+.

You do not need to clean it or label it first. Annotation is
our job, done in-house, never handed to a third-party vendor.

The data evaluation is free. It is where we check whether the
task is a fit before anyone commits to building.

Next: cat method.txt, or cat ../contact.txt to send it.` },

  { path: '/home/kestrel/family', kind: 'dir', content: '', action: '' },
  { path: '/home/kestrel/family/census.txt', kind: 'file', action: 'app:catalogue', content: `Census
======

Opening the Catalogue.

  collected       01
  in preparation  07
  ------------------
  family          08

  NEO-001  Kestrel   live, text classification
  NEO-002  ----      in preparation
  NEO-003  ----      in preparation
  NEO-004  ----      in preparation
  NEO-005  ----      in preparation
  NEO-006  ----      in preparation
  NEO-007  ----      in preparation
  NEO-008  ----      in preparation

The dashes are not redactions. Those models do not exist yet,
so there is nothing to enter. We will name and describe them
when they are real, not before.

  cat neo-001-kestrel.txt   the one live model
  cat in-preparation.txt    the seven open slots` },
  { path: '/home/kestrel/family/neo-001-kestrel.txt', kind: 'file', action: '', content: `NEO-001, Kestrel
================

  Status     live
  Task       text classification
  Serving    private API
  Training   fine-tuned on your labels and terminology
  Returns    a label and a confidence score, in milliseconds

The first model in the family, and the only one live today.
A custom text classifier, fine-tuned to your data alone.

For the full story, cat ../kestrel/card.txt.` },
  { path: '/home/kestrel/family/in-preparation.txt', kind: 'file', action: '', content: `In preparation
==============

  NEO-002    in preparation
  NEO-003    in preparation
  NEO-004    in preparation
  NEO-005    in preparation
  NEO-006    in preparation
  NEO-007    in preparation
  NEO-008    in preparation

Seven slots are held open for future single-task models. We
have not built them, so we will not name them, describe their
tasks, or give them dates. We would rather leave a slot empty
than invent a capability that does not exist.

When one is real, it gets its own entry in census.txt with a
name and a task.` },

  { path: '/home/kestrel/lab', kind: 'dir', content: '', action: '' },
  { path: '/home/kestrel/lab/about.txt', kind: 'file', action: 'About', content: `About Neognathae
================

Opening the About tab.

Neognathae is a small, growing family of focused single-task
AI models, by the research lab Auxerta. Each model is built
for one task, and tuned to do it well. Not a general
assistant, not one model stretched across many jobs. One
model, one task, named like a specimen in a field guide.

Kestrel, for text classification, is the first one collected.
The family will grow only as real models are built. We would
rather show one live model than eight promises.

  cat auxerta.txt   the parent lab
  cat honesty.txt   what is real, plainly` },
  { path: '/home/kestrel/lab/auxerta.txt', kind: 'file', action: '', content: `Auxerta
=======

The research lab behind Neognathae. We build focused
single-task models, one at a time, and run them for the teams
that use them.

  Web      auxerta.com
  Email    contact@auxerta.com

Neognathae is the family of models. Auxerta is the lab that
builds and keeps them. Reach out any time. Data evaluation is
free, and we will be straight with you about whether we can
help.` },
  { path: '/home/kestrel/lab/honesty.txt', kind: 'file', action: '', content: `What is real, plainly
=====================

The rule for this archive is simple: nothing invented.

Real and live today:
  - Kestrel (NEO-001), a custom text classifier served behind
    a private API.
  - The method: data, annotation, fine-tuning, live API.
  - The pricing: free evaluation, $3k to $5k setup,
    $2,500 to $5,000+/mo hosting.
  - The lab: Auxerta, contact@auxerta.com, auxerta.com.

Illustrative, not promised:
  - Any accuracy figure, for example around 88 to 98%.
  - Any latency figure, for example around 18 ms.
  These are established per deployment, on your data.

Not built yet:
  - NEO-002 through NEO-008. No names, no tasks, no specs,
    until they are real.

Annotation is done in-house, never handed to third-party
vendors. Your fine-tuned model is yours alone. If data
evaluation shows we cannot help, we will say so, at no cost.` },
]

const ENTRIES: Map<string, FsNode> = (() => {
  const m = new Map<string, FsNode>()
  m.set('/', { kind: 'dir', content: '', action: '' })
  for (const node of FS_RAW) {
    m.set(node.path, { kind: node.kind, content: node.content, action: node.action })
    const parts = node.path.split('/').filter(Boolean)
    for (let i = 1; i < parts.length; i++) {
      const anc = '/' + parts.slice(0, i).join('/')
      if (!m.has(anc)) m.set(anc, { kind: 'dir', content: '', action: '' })
    }
  }
  return m
})()

const base = (p: string): string => p.split('/').pop() || p
const isDir = (p: string): boolean => ENTRIES.get(p)?.kind === 'dir'
const isFile = (p: string): boolean => ENTRIES.get(p)?.kind === 'file'
const parentOf = (p: string): string => {
  if (p === '/') return '/'
  const i = p.lastIndexOf('/')
  return i <= 0 ? '/' : p.slice(0, i)
}

function resolvePath(arg: string, cwd: string): string {
  let a = arg.trim()
  if (a === '' || a === '~') return HOME
  if (a.startsWith('~/')) a = HOME + a.slice(1)
  else if (!a.startsWith('/')) a = cwd + '/' + a
  const stack: string[] = []
  for (const seg of a.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') stack.pop()
    else stack.push(seg)
  }
  return '/' + stack.join('/')
}

function childrenOf(dir: string): { dirs: string[]; files: string[] } {
  const dirs: string[] = []
  const files: string[] = []
  for (const p of ENTRIES.keys()) {
    if (p === '/' || p === dir) continue
    if (parentOf(p) !== dir) continue
    if (ENTRIES.get(p)?.kind === 'dir') dirs.push(p)
    else files.push(p)
  }
  const byName = (x: string, y: string) => base(x).localeCompare(base(y))
  return { dirs: dirs.sort(byName), files: files.sort(byName) }
}

function formatCwd(cwd: string): string {
  if (cwd === HOME) return '~'
  if (cwd.startsWith(HOME + '/')) return '~' + cwd.slice(HOME.length)
  return cwd
}

function buildTree(root: string): string[] {
  const out: string[] = [root === HOME ? '~' : root === '/' ? '/' : base(root) + '/']
  const walk = (dir: string, prefix: string) => {
    const { dirs, files } = childrenOf(dir)
    const ordered = [...dirs, ...files]
    ordered.forEach((p, idx) => {
      const last = idx === ordered.length - 1
      const dirNode = isDir(p)
      out.push(prefix + (last ? '└── ' : '├── ') + base(p) + (dirNode ? '/' : ''))
      if (dirNode) walk(p, prefix + (last ? '    ' : '│   '))
    })
  }
  walk(root, '')
  return out
}

const NAV_HELP: [string, string][] = [
  ['ls [path]', 'list a directory'],
  ['cd <path>', 'change directory (.., /, ~)'],
  ['pwd', 'print working directory'],
  ['cat <file>', 'read a file'],
  ['tree', 'map the tree from here'],
]
const ACT_HELP: [string, string][] = [
  ['classify <text>', 'run an illustrative classification'],
  ['open <tab>', 'jump to a window tab'],
  ['status', 'system summary'],
  ['contact', 'how to reach us'],
  ['about', 'about Neognathae'],
  ['clear', 'clear the console'],
]

/* open the Kestrel window and switch it to a tab (used by cat actions and `open`) */
function gotoTab(tab: string) {
  window.dispatchEvent(new CustomEvent('neo-open', { detail: 'kestrel' }))
  window.dispatchEvent(new CustomEvent('neo-tab', { detail: tab }))
}

/* a file action is either a Kestrel tab name or `app:<id>` to open another app */
function runAction(action: string) {
  if (action.startsWith('app:')) { window.dispatchEvent(new CustomEvent('neo-open', { detail: action.slice(4) })); return }
  gotoTab(action)
}

function Terminal() {
  const [history, setHistory] = useState<Line[]>([
    {
      out: (
        <div className="text-[#928C82] space-y-0.5">
          <div>Neognathae archive. You are in <span className="text-[#1A1815]">~</span>, the field record for Kestrel and its family.</div>
          <div>Type <span className="text-[#B8541F]">ls</span> to look around, <span className="text-[#B8541F]">cat readme.txt</span> to begin, or <span className="text-[#B8541F]">help</span> for the full command list.</div>
        </div>
      ),
    },
  ])
  const [cwd, setCwd] = useState(HOME)
  const [input, setInput] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [history])

  const print = (out: ReactNode) => setHistory((h) => [...h, { out }])

  const run = (raw: string) => {
    const cmd = raw.trim()
    print(<span><span className="text-[#B8541F]">{`kestrel:${formatCwd(cwd)} ›`}</span> {cmd}</span>)
    if (!cmd) return
    const parts = cmd.split(/\s+/)
    const name = parts[0].toLowerCase()
    const arg = parts.slice(1).join(' ')

    switch (name) {
      case 'pwd':
        print(<span className="text-[#4A463F]">{formatCwd(cwd)}</span>)
        break
      case 'ls': {
        const target = resolvePath(arg || '.', cwd)
        if (!isDir(target)) {
          print(<span className="text-[#928C82]">ls: {isFile(target) ? 'not a directory' : 'no such directory'}: {arg || formatCwd(cwd)}</span>)
          break
        }
        const { dirs, files } = childrenOf(target)
        if (dirs.length === 0 && files.length === 0) { print(<span className="text-[#928C82]">(empty)</span>); break }
        print(
          <div className="flex flex-wrap gap-x-5 gap-y-0.5">
            {dirs.map((d) => <span key={d} className="text-[#1A1815]">{base(d)}/</span>)}
            {files.map((f) => <span key={f} className="text-[#6B6760]">{base(f)}</span>)}
          </div>,
        )
        break
      }
      case 'cd': {
        const target = resolvePath(arg, cwd)
        if (isDir(target)) setCwd(target)
        else print(<span className="text-[#928C82]">cd: {isFile(target) ? 'not a directory' : 'no such directory'}: {arg}</span>)
        break
      }
      case 'cat': {
        if (!arg) { print(<span className="text-[#928C82]">cat: missing file operand</span>); break }
        const target = resolvePath(arg, cwd)
        const node = ENTRIES.get(target)
        if (node && node.kind === 'file') {
          print(<span className="text-[#4A463F]">{node.content}</span>)
          if (node.action) runAction(node.action)
        } else if (isDir(target)) {
          print(<span className="text-[#928C82]">cat: {arg}: is a directory</span>)
        } else {
          print(<span className="text-[#928C82]">cat: no such file: {arg}</span>)
        }
        break
      }
      case 'tree': {
        const target = resolvePath(arg || '.', cwd)
        if (!isDir(target)) {
          print(<span className="text-[#928C82]">tree: {isFile(target) ? 'not a directory' : 'no such directory'}: {arg || formatCwd(cwd)}</span>)
          break
        }
        print(<div className="text-[#4A463F]">{buildTree(target).map((ln, i) => <div key={i}>{ln}</div>)}</div>)
        break
      }
      case 'help':
        print(
          <div className="space-y-2">
            <div className="space-y-0.5">
              <div className="text-[#928C82]">walk the archive</div>
              {NAV_HELP.map(([c, d]) => (
                <div key={c}><span className="text-[#1A1815]">{c.padEnd(13, ' ')}</span><span className="text-[#928C82]">{d}</span></div>
              ))}
            </div>
            <div className="space-y-0.5">
              <div className="text-[#928C82]">act</div>
              {ACT_HELP.map(([c, d]) => (
                <div key={c}><span className="text-[#1A1815]">{c.padEnd(17, ' ')}</span><span className="text-[#928C82]">{d}</span></div>
              ))}
            </div>
            <div className="text-[#928C82]">New here? Type <span className="text-[#B8541F]">ls</span> to look around, or <span className="text-[#B8541F]">cat start-here.txt</span>.</div>
          </div>,
        )
        break
      case 'classify':
        if (!arg) print(<span className="text-[#928C82]">usage: classify &lt;text&gt;</span>)
        else print(<span className="text-[#4A463F]">label: <span className="text-[#1A1815]">{classifyText(arg)}</span> <span className="text-[#928C82]">(illustrative)</span></span>)
        break
      case 'open': {
        if (!arg) { print(<span className="text-[#928C82]">usage: open &lt;tab&gt;</span>); break }
        const a = arg.toLowerCase()
        const appHit = APPS.find((ap) => ap.id === a)
        if (appHit) {
          window.dispatchEvent(new CustomEvent('neo-open', { detail: appHit.id }))
          print(<span className="text-[#928C82]">opening {appHit.title}…</span>)
          break
        }
        const match = (KESTREL_TABS as readonly string[]).find((tab) => tab.toLowerCase() === a)
        if (match) { gotoTab(match); print(<span className="text-[#928C82]">opening {match}…</span>) }
        else print(<span className="text-[#928C82]">open: no such tab: {arg}</span>)
        break
      }
      case 'insights':
        gotoTab('Insights')
        print(<span className="text-[#928C82]">opening Insights…</span>)
        break
      case 'status':
        print(<span className="text-[#4A463F]">{ENTRIES.get(HOME + '/status.txt')?.content}</span>)
        break
      case 'contact':
        print(
          <div className="text-[#4A463F] space-y-0.5">
            <div>contact@auxerta.com</div>
            <div>auxerta.com</div>
            <div className="text-[#928C82]">The best first step is the free data evaluation.</div>
          </div>,
        )
        break
      case 'about':
        print(<span className="text-[#4A463F]">A growing family of focused single-task models, by the research lab Auxerta. Kestrel, for text classification, is the first.</span>)
        break
      case 'clear':
        setHistory([])
        return
      default:
        print(<span className="text-[#928C82]">command not found: {name}. try <span className="text-[#B8541F]">help</span></span>)
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#FBF9F4]" onClick={() => inputRef.current?.focus()}>
      <div ref={scroller} className="neo-scroll flex-1 overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed text-[#4A463F]">
        {history.map((l, i) => <div key={i} className="whitespace-pre-wrap break-words mb-0.5">{l.out}</div>)}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); run(input); setInput('') }}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-t border-[#E6E1D6] font-mono text-[12px]"
      >
        <span className="text-[#B8541F] shrink-0">{`kestrel:${formatCwd(cwd)} ›`}</span>
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} autoComplete="off" className="flex-1 bg-transparent outline-none text-[#1A1815] caret-[#B8541F]" aria-label="Terminal input" />
      </form>
    </div>
  )
}

/* ── Insights (in-brand charts) ── */
const ACC = [['No examples', 88], ['One example', 92], ['A few examples', 96], ['Many examples', 98]] as const

function Insights() {
  const [shown, setShown] = useState(false)
  const [series, setSeries] = useState<number[]>([22, 34, 30, 46, 52, 48, 63, 70])
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(t)
  }, [])
  const simulate = () => {
    setShown(false)
    setSeries((s) => s.map(() => 20 + Math.round(Math.random() * 70)))
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
  }
  const max = Math.max(...series, 1)
  const pts = series.map((v, i) => `${(i / (series.length - 1)) * 100},${100 - (v / max) * 92 - 4}`).join(' ')
  const r = 30, circ = 2 * Math.PI * r, frac = 1 / 8

  return (
    <div className="bg-white p-6 md:p-8 border-t border-[#E6E1D6]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <Eyebrow>Instruments</Eyebrow>
          <h2 className="mt-2 font-sans text-xl font-semibold tracking-tight text-[#1A1815]">Observatory</h2>
        </div>
        <button onClick={simulate} className="rounded-full bg-[#1A1815] px-3.5 py-1.5 text-[0.62rem] font-mono uppercase tracking-[0.14em] text-[#F5F2EB] hover:bg-[#2A2723] transition-colors">Simulate load</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#E6E1D6] border border-[#E6E1D6] rounded-xl overflow-hidden">
        <div className="bg-white p-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">Classification accuracy</p>
          <div className="mt-4 space-y-3">
            {ACC.map(([label, pct]) => (
              <div key={label}>
                <div className="flex justify-between mb-1.5"><span className="text-[0.65rem] font-mono uppercase tracking-wide text-[#4A463F]">{label}</span><span className="text-[0.65rem] font-mono text-[#1A1815] font-semibold">{pct}.0%</span></div>
                <div className="w-full h-2 rounded-full bg-[#ECE8DF] overflow-hidden"><div className="h-full rounded-full bg-[#B8541F] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: shown ? `${pct}%` : '0%' }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-5">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">Throughput · illustrative</p>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-4 w-full h-[120px]">
            <polyline points={`0,100 ${pts} 100,100`} fill="#B8541F" opacity={shown ? 0.06 : 0} style={{ transition: 'opacity 700ms' }} />
            <polyline points={pts} fill="none" stroke="#B8541F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 700ms cubic-bezier(0.16,1,0.3,1)', opacity: shown ? 1 : 0 }} />
          </svg>
        </div>
        <div className="bg-white p-5 flex items-center gap-6">
          <svg width="86" height="86" viewBox="0 0 86 86" className="shrink-0">
            <circle cx="43" cy="43" r={r} fill="none" stroke="#ECE8DF" strokeWidth="9" />
            <circle cx="43" cy="43" r={r} fill="none" stroke="#B8541F" strokeWidth="9" strokeLinecap="round" transform="rotate(-90 43 43)" style={{ transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)', strokeDasharray: shown ? `${circ * frac} ${circ}` : `0 ${circ}` }} />
          </svg>
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">The models</p>
            <p className="mt-2 font-sans text-lg font-semibold text-[#1A1815]">01 in production</p>
            <p className="text-sm text-[#6B6760]">07 in development</p>
          </div>
        </div>
        <div className="bg-white p-5 flex flex-col justify-center">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">Response time</p>
          <p className="mt-2 font-sans text-3xl font-semibold tracking-tight text-[#1A1815]">~18<span className="text-lg text-[#928C82]"> ms</span></p>
          <p className="mt-1 text-xs text-[#807A70]">Illustrative. Established per deployment.</p>
        </div>
      </div>
      <p className="mt-4 text-[0.6rem] font-mono uppercase tracking-[0.16em] text-[#928C82]">Figures are illustrative; accuracy on customer data is established per deployment.</p>
    </div>
  )
}

/* ── Kestrel app (everything, tabbed) ── */
const METHOD: [string, string, string][] = [
  ['01', 'Data', 'Send whatever you have: raw, messy, unlabeled. We typically start from 10,000 examples and up.'],
  ['02', 'Annotation', 'We turn it into clean labeled pairs, in-house under direct oversight. Never routed to third-party vendors.'],
  ['03', 'Fine-tuning', 'We train a model on your data and your terminology. It is yours alone.'],
  ['04', 'Live API', 'Your model goes live behind a private API, ready to call from your app.'],
]
const PRICING: [string, string, string, boolean][] = [
  ['Data evaluation', 'Scope, feasibility, and label-schema review.', 'Free', true],
  ['Initial fine-tuning', 'One-time setup and optimization.', '$3k – $5k', false],
  ['Dedicated hosting', 'Flat monthly, tiered by volume. No per-use billing.', '$2,500 – $5,000+/mo', false],
]
const KDATA: { intro: string; points: [string, string][] } = {
  intro: 'Your data stays yours. Here is exactly how Kestrel handles it, from the first evaluation to the live model.',
  points: [
    ['Your data is yours', 'You send us your text to scope, build, and run your model, and that is the only thing we use it for. We treat it as confidential, we do not sell it, and we do not pass it to anyone who is not working directly on your project.'],
    ['Your model is yours alone', 'The model we fine-tune on your data is built for you and you only. It is not shared across customers, and your data is never used to train or improve a model for anyone else. What we learn from your task stays on your task.'],
    ['Annotation is done in-house', 'We turn your raw text into clean labeled pairs ourselves, under direct oversight. Your data is never routed to third-party annotation vendors. This is also where your categories and your terminology get pinned down precisely.'],
    ['The free evaluation is where fit is checked', 'The data evaluation is free, and it is where we look at whether the task is a good fit before anyone commits to building. You do not need to clean or label anything first. Getting your text to us is the only work on your side at this stage.'],
    ['Figures here are illustrative', 'Any latency, accuracy, or confidence numbers shown in this app are illustrative, meant to show the shape of a result. The real numbers are established per deployment, on your data, before anything goes live. We do not quote figures we have not measured for you.'],
  ],
}
export const KESTREL_TABS = ['Plate', 'Try it', 'Uses', 'Method', 'Pricing', 'Data', 'Insights', 'About'] as const

function KestrelApp() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollToSection = (name: string) => {
    const c = scrollRef.current
    const el = c?.querySelector(`[data-section="${name}"]`)
    if (!c || !el) return
    const target = el.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop
    const start = c.scrollTop
    const dist = target - start
    let t0 = 0
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min(1, (ts - t0) / 420)
      c.scrollTop = start + dist * (1 - Math.pow(1 - p, 3))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent).detail; if (typeof d === 'string') scrollToSection(d) }
    window.addEventListener('neo-tab', h)
    return () => window.removeEventListener('neo-tab', h)
  }, [])

  return (
    <div ref={scrollRef} className="neo-scroll h-full overflow-auto bg-white">
      <section data-section="Plate" className="p-6 md:p-8 flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-[220px] shrink-0">
          <div className="group rounded-xl overflow-hidden border border-[#E6E1D6]"><SpecimenPlate /></div>
        </div>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[0.62rem] font-mono uppercase tracking-[0.22em] text-[#B8541F]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#B8541F]" /> NEO-001 · Kestrel
          </p>
          <h2 className="mt-3 font-sans text-2xl md:text-[1.8rem] font-semibold tracking-tight leading-tight text-[#1A1815]">A classifier, fine-tuned to your data.</h2>
          <p className="mt-3 text-sm md:text-[0.95rem] leading-relaxed text-[#4A463F]">Kestrel is a custom text classifier, trained on your labels and your terminology, then served behind a private API. Send text in; get back a label and a confidence score in milliseconds.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href="mailto:contact@auxerta.com?subject=Kestrel%20-%20Inquiry" className="inline-flex items-center gap-2 rounded-full bg-[#1A1815] px-4 py-2 text-[0.72rem] font-medium text-[#F5F2EB] hover:bg-[#2A2723] transition-colors">Talk to us <span aria-hidden>→</span></a>
            <button onClick={() => scrollToSection('Try it')} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Try it <span aria-hidden>↓</span></button>
          </div>
        </div>
      </section>

      <section data-section="Try it"><ClassifierDemo /></section>
      <section data-section="Uses"><SSMBenefits /></section>

      <section data-section="Method" className="p-6 md:p-8 border-t border-[#E6E1D6]">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-[#1A1815]">From raw data to a live API.</h2>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
          {METHOD.map(([n, t, b]) => (
            <div key={n} className="border-t border-[#E6E1D6] pt-4">
              <div className="font-mono text-[0.7rem] tracking-[0.2em] text-[#B8541F]">{n}</div>
              <h3 className="mt-2 font-sans text-lg font-semibold tracking-tight text-[#1A1815]">{t}</h3>
              <p className="mt-2 text-sm text-[#6B6760] leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section data-section="Pricing" className="p-6 md:p-8 border-t border-[#E6E1D6]">
        <Eyebrow>Engagement</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-[#1A1815]">Free to scope. Then a setup fee and a flat subscription.</h2>
        <div className="mt-6 rounded-xl border border-[#E6E1D6] bg-[#FBF9F4] p-5 md:p-6">
          {PRICING.map(([label, note, price, free], i) => (
            <div key={label} className={'flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 ' + (i < PRICING.length - 1 ? 'border-b border-[#E6E1D6] pb-5 mb-5' : '')}>
              <div><strong className="block text-sm font-semibold text-[#1A1815]">{label}</strong><p className="mt-1 text-xs text-[#6B6760]">{note}</p></div>
              <span className={'shrink-0 font-mono text-sm font-medium ' + (free ? 'text-[#B8541F]' : 'text-[#1A1815]')}>{price}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#807A70] leading-relaxed">We take on a limited number of projects at a time, and only when we're confident we can help.</p>
      </section>

      <section data-section="Data" className="p-6 md:p-8 border-t border-[#E6E1D6]">
        <Eyebrow>Your data</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl font-semibold tracking-tight text-[#1A1815]">How Kestrel handles your data.</h2>
        <p className="mt-3 text-sm text-[#4A463F] leading-relaxed max-w-xl">{KDATA.intro}</p>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
          {KDATA.points.map(([t, b]) => (
            <div key={t} className="border-t border-[#E6E1D6] pt-4">
              <h3 className="font-sans text-base font-semibold tracking-tight text-[#1A1815]">{t}</h3>
              <p className="mt-2 text-sm text-[#6B6760] leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 pt-5 border-t border-[#E6E1D6]">
          <button onClick={() => window.dispatchEvent(new CustomEvent('neo-open', { detail: 'privacy' }))} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Read the site privacy policy <span aria-hidden>→</span></button>
        </div>
      </section>

      <section data-section="Insights"><Insights /></section>

      <section data-section="About" className="p-7 md:p-9 border-t border-[#E6E1D6]">
        <FlockMark className="w-8 h-8 text-[#1A1815]" leadStroke="#B8541F" />
        <h2 className="mt-5 font-sans text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-[#1A1815]">A line of single-task models.</h2>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-[#4A463F] max-w-md">Neognathae is a line of narrow, single-task AI models developed by the research lab Auxerta. Each model is built for one task and fine-tuned to perform it. Kestrel, for text classification, is the first in production.</p>
        <div className="mt-7 pt-5 border-t border-[#E6E1D6] flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-[#928C82]">
          <span>Neognathae · A product by Auxerta</span>
          <a href="mailto:contact@auxerta.com" className="text-[#1A1815] hover:text-[#B8541F] transition-colors">contact@auxerta.com</a>
          <a href="https://auxerta.com" target="_blank" rel="noreferrer" className="text-[#1A1815] hover:text-[#B8541F] transition-colors">Auxerta ↗</a>
        </div>
      </section>
    </div>
  )
}

/* ── Catalogue (the model family, its own app) ── */
function CatalogueApp() {
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-6 md:p-7">
        <Eyebrow>The models</Eyebrow>
        <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[#1A1815]">The Neognathae models.</h2>
        <p className="mt-2 text-sm text-[#6B6760] max-w-xl leading-relaxed">A line of narrow, single-task AI models. Kestrel is in production; the rest are in preparation. Each is built and fine-tuned for one task.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KestrelCard onOpen={() => gotoTab('Plate')} />
          {Array.from({ length: 7 }).map((_, i) => <ComingSoonCard key={i} index={i} />)}
        </div>
      </div>
    </div>
  )
}

/* ── Contact (reach the lab) ── */
function ContactApp() {
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-7 md:p-9 max-w-xl">
        <Eyebrow>Get in touch</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#1A1815]">Tell us about your text.</h2>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-[#4A463F]">
          The best first step is the free data evaluation. Send a note about what your text looks like and what you would like to sort it into, and we will tell you honestly whether Kestrel is a good fit.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href="mailto:contact@auxerta.com?subject=Kestrel%20inquiry" className="inline-flex items-center gap-2 rounded-full bg-[#1A1815] px-5 py-2.5 text-[0.75rem] font-medium text-[#F5F2EB] hover:bg-[#2A2723] transition-colors">Email us <span aria-hidden>→</span></a>
          <a href="https://auxerta.com" target="_blank" rel="noreferrer" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">auxerta.com ↗</a>
        </div>
        <div className="mt-8 pt-6 border-t border-[#E6E1D6] space-y-3 text-sm">
          <div className="flex gap-3"><span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82] w-16 shrink-0 pt-0.5">Email</span><a href="mailto:contact@auxerta.com" className="text-[#1A1815] hover:text-[#B8541F] transition-colors">contact@auxerta.com</a></div>
          <div className="flex gap-3"><span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82] w-16 shrink-0 pt-0.5">Web</span><a href="https://auxerta.com" target="_blank" rel="noreferrer" className="text-[#1A1815] hover:text-[#B8541F] transition-colors">auxerta.com</a></div>
          <div className="flex gap-3"><span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82] w-16 shrink-0 pt-0.5">Lab</span><span className="text-[#4A463F]">Auxerta, the research lab behind Neognathae</span></div>
        </div>
        <p className="mt-6 text-xs text-[#807A70] leading-relaxed">We take on a limited number of projects at a time, and only when we are confident we can help.</p>
      </div>
    </div>
  )
}

/* ── Auxerta (the parent lab) ── */
function AuxertaApp() {
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-7 md:p-9 max-w-xl">
        <Eyebrow>The lab</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#1A1815]">Auxerta.</h2>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-[#4A463F]">
          Auxerta is the research lab that develops Neognathae, a line of narrow, single-task AI models. For each model we run the full pipeline: data evaluation, in-house annotation, fine-tuning, and deployment behind a dedicated private API.
        </p>
        <p className="mt-4 text-sm md:text-base leading-relaxed text-[#4A463F]">
          Each model is built for one task and fine-tuned on the customer's own data. Kestrel, a text classification model, is the first in production. Additional models are in development and enter production only after they are built and validated.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a href="https://auxerta.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1A1815] px-5 py-2.5 text-[0.75rem] font-medium text-[#F5F2EB] hover:bg-[#2A2723] transition-colors">Visit auxerta.com <span aria-hidden>↗</span></a>
          <a href="mailto:contact@auxerta.com" className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">contact@auxerta.com</a>
        </div>
        <div className="mt-8 pt-6 border-t border-[#E6E1D6] inline-flex items-center gap-2 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-[#928C82]">
          <FlockMark className="w-4 h-4 text-[#1A1815]" leadStroke="#B8541F" />
          Neognathae, a product by Auxerta
        </div>
      </div>
    </div>
  )
}

/* ── Privacy (standard site privacy policy) ── */
const PRIVACY_DOC = {
  updated: 'Last updated: June 8, 2026',
  intro: 'This Privacy Policy explains how Auxerta handles information in connection with the Neognathae website (neognathae.com). Auxerta is the research lab that operates the site and builds the Neognathae models, a family of single-task models named after birds. Neognathae is a static website, so it collects very little, and this policy is meant to be read plainly and honestly. If you have any questions, you can reach us at contact@auxerta.com.',
  sections: [
    { heading: 'What this policy covers', body: `This policy covers the Neognathae website and how Auxerta handles information generally. It describes the small amount of data the website itself involves, how Auxerta uses information you choose to send us, and the limited ways information is shared.

Project specific data terms, including how your data and your fine-tuned model are handled during a paid engagement, live in the Kestrel app. This policy gives a brief summary and points you there for the details.` },
    { heading: 'Information we collect', body: `We aim to collect only what we need.

Information you send us. If you email us at contact@auxerta.com, we receive your message and whatever you include in it, such as your name, email address, and any details about your use case. We use this only to reply to you and to scope possible work.

Website information. The website is static and has no accounts, no login, and no server side database of visitors. It does not collect form submissions or build a profile of you. We do use Google Analytics, which, if you allow it, sets cookies and collects usage information about your visit, such as the pages you view, your approximate location, and your device and browser. This is described under This website below.` },
    { heading: 'How we use it', body: `We use the limited information we have for plain, expected purposes:

- to reply to messages you send us and, where agreed, to scope, build, and run a project for you;
- to understand how the website is used, through analytics, so we can improve it;
- to operate and maintain the website; and
- to respond to legal obligations if they apply.

We do not sell your information, and we do not use it for advertising.` },
    { heading: 'This website', body: `The website is static and simple, and we use no advertising trackers.

Analytics. We use Google Analytics (Google Analytics 4) to understand how the site is used so we can improve it. It runs only if you allow it. Until you accept the cookie banner, it sets no cookies and collects nothing. If you accept, it sets cookies in your browser and collects usage information about your visit, such as the pages you view, your approximate location, and your device and browser, and sends this to Google, which processes it under its own privacy policy. We use it only to measure and improve the site, never for advertising, and you can change your choice at any time from Your choices below.

Your cookie choice is remembered in your browser so we do not ask again. The fonts, icons, and images are served from this site itself, not from third parties. Google Analytics, described above, is the only third party the site uses, and it collects nothing until you allow it.` },
    { heading: 'Sharing and service providers', body: `We do not sell personal information.

We share information only in limited, ordinary ways: with service providers as needed to run the service and our business, with each provider acting on our instructions; and where required by law or valid legal process.

In particular, if you allow analytics, Google Analytics receives usage information about your visit. Google processes this data under its own privacy policy.` },
    { heading: 'Your data and your models', body: `Auxerta does take on paid projects. A typical engagement includes a free evaluation, a one time setup fee, and a flat monthly hosting subscription, so billing exists for customers.

For a paid project, Auxerta receives the data you send in order to scope, build, and run your model. That fine-tuned model is yours alone. It is not shared across customers and is not used to train anything for anyone else. Annotation is done in house under direct oversight and is never routed to third party annotation vendors.

This is only a brief summary. The full, project specific data terms live in the Kestrel app. For details, or for a data processing agreement, contact us at contact@auxerta.com.` },
    { heading: 'Your choices', body: `You are always in control of what you send us. You do not need to provide any information to read the website.

Analytics and cookies. Analytics is off until you accept it in the cookie banner, so declining keeps Google Analytics from running. You can change your choice at any time using Cookie settings below, which reopens the banner. You can also use your browser's privacy and cookie controls, clear or block cookies for this site, or install Google's Analytics opt-out browser add-on. The site works the same either way.

If you have emailed us and would like us to update or delete the message and contact details you sent, just let us know at contact@auxerta.com and we will take care of it, subject to any records we are required to keep.` },
    { heading: 'Changes', body: 'We may update this policy from time to time. When we do, we will post the updated version here and revise the date above. Significant changes will be made clear. We encourage you to review this page from time to time.' },
    { heading: 'Contact', body: 'If you have any questions about this policy or how we handle data, email us at contact@auxerta.com. We will be glad to help, and we can provide more detail or a data processing agreement on request.' },
  ],
  bittern: {
    url: 'https://en.wikipedia.org/wiki/American_bittern',
    credit: 'The Privacy mascot is the American Bittern, a marsh bird that hides by standing still among the reeds.',
  },
}
function PrivacyApp() {
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-7 md:p-9 max-w-2xl">
        <Eyebrow>Privacy</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#1A1815]">Privacy Policy</h2>
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">{PRIVACY_DOC.updated}</p>
        <p className="mt-5 text-sm md:text-[0.95rem] leading-relaxed text-[#4A463F]">{PRIVACY_DOC.intro}</p>
        <div className="mt-7 space-y-7">
          {PRIVACY_DOC.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="font-sans text-base font-semibold tracking-tight text-[#1A1815]">{s.heading}</h3>
              <p className="mt-2 text-sm text-[#4A463F] leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-7 pt-6 border-t border-[#E6E1D6] flex flex-wrap items-center gap-x-6 gap-y-2">
          <button onClick={() => window.dispatchEvent(new CustomEvent('neo-consent-open'))} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Cookie settings</button>
          <button onClick={() => gotoTab('Data')} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Kestrel data terms <span aria-hidden>→</span></button>
          <button onClick={() => window.dispatchEvent(new CustomEvent('neo-open', { detail: 'terms' }))} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Terms of Service <span aria-hidden>→</span></button>
        </div>
        <p className="mt-6 text-xs text-[#807A70] leading-relaxed">
          {PRIVACY_DOC.bittern.credit}{' '}
          <a href={PRIVACY_DOC.bittern.url} target="_blank" rel="noreferrer" className="text-[#1A1815] hover:text-[#B8541F] underline decoration-[#CCC6BA] underline-offset-2 transition-colors">Read about it ↗</a>
        </p>
      </div>
    </div>
  )
}

/* ── Terms of Service ── */
const TERMS_DOC = {
  updated: 'Last updated: June 8, 2026',
  intro: `These Terms of Service (the "Terms") are a binding agreement between Auxerta (Auxerta, Inc., a Delaware corporation) ("Auxerta", "we", "us", or "our") and you ("you" or "your"), and they govern your access to and use of the Neognathae website at neognathae.com (the "Site") and any custom model engagement you enter into with us (each, an "Engagement"). The Site and any Engagement are referred to together as the "Service".

Auxerta is a research lab that builds the Neognathae models, a family of focused, single-task AI models named after birds. Kestrel, a custom text classifier, is our first and only currently live model. The other Neognathae models are in preparation and are described on the Site as such.

The Site is a static, informational marketing site. It has no accounts, no login, no user-generated content, and no purchases made on the Site. A separate paid relationship, which we call an Engagement, exists only if you and Auxerta sign a written agreement for a custom model.

By accessing or using the Site, or by entering into an Engagement with us, you agree to be bound by these Terms and by our Privacy Policy, where one is published, which is incorporated here by reference. If you do not agree to these Terms, do not use the Site and do not enter into an Engagement. If you are accepting these Terms on behalf of a company or other organization, you represent and warrant that you have authority to bind that organization, and "you" refers to that organization.`,
  sections: [
    { heading: '1. Acceptance of these Terms', body: `These Terms govern your access to and use of the Site and any Engagement you enter into with Auxerta. By visiting, browsing, or otherwise using the Site, or by signing, ordering, or otherwise agreeing to an Engagement, you confirm that you have read, understood, and agree to be bound by these Terms.

The Site requires no account, login, or registration, it does not host user-generated content, and you cannot purchase anything directly on the Site. Your acceptance of these Terms with respect to the Site is made by using the Site.

An Engagement may be further defined by a separate written agreement, order form, statement of work, proposal, or master services agreement that the parties sign or otherwise agree to in writing (each, a "Customer Agreement"). Except as expressly stated in a Customer Agreement, these Terms apply to every Engagement. If there is a conflict between these Terms and a signed Customer Agreement, the Customer Agreement controls for that Engagement, but only to the extent of the conflict and only as between the parties to that Customer Agreement.

We may update these Terms from time to time as described in the section titled "Changes to these Terms" below. We may make these Terms available in other languages for convenience, but the English version governs.` },
    { heading: '2. Who we are and definitions', body: `Auxerta is the research lab that operates the Site and builds the Neognathae models. Auxerta is operated by Auxerta, Inc., a Delaware corporation.

For convenience, the following terms are used throughout these Terms:

- "Site" means the informational marketing website at neognathae.com.
- "Engagement" means the paid relationship under which Auxerta scopes, builds, and hosts a custom model for a Customer.
- "Service" means the Site and any Engagement, together.
- "Customer" or "you" means the person or organization that accesses the Site or engages our services.
- "Customer Agreement" means a signed written agreement, order form, statement of work, proposal, or master services agreement for an Engagement.
- "Customer Data" means the data, content, and materials you provide to us, or that we process on your behalf, in connection with an Engagement, including data submitted for evaluation, training, fine-tuning, and inference, and any labels, annotations, or derived datasets created from it in the course of building your model.
- "Customer Model" means the custom model that Auxerta fine-tunes and builds for you under an Engagement.
- "Auxerta Platform" means our pre-existing and independently developed tools, methods, know-how, processes, software, infrastructure, base models, model architecture, documentation, the Neognathae platform, and the Site, together with all improvements and components of them and all intellectual property rights in them.

Headings are for convenience only. "Including" means "including without limitation."` },
    { heading: '3. The Service', body: `The Service has two parts.

The Site. The Site is a static, informational marketing site about Auxerta and the Neognathae models. It does not offer accounts, logins, user profiles, user-generated content, or any feature that lets you submit or publish content, and it does not process payments. We use a single, consent-gated analytics tool (Google Analytics) that runs only if you grant consent through our consent banner. Analytics storage is denied by default, and no analytics cookies are set until you consent. You can change your choice at any time. Fonts and other assets used on the Site are self-hosted. Our handling of any information collected through the Site is described in our Privacy Policy, where one is published.

Any accuracy, latency, throughput, or other performance figures shown on the Site are illustrative only. They reflect internal evaluation and are provided to give a general sense of what a focused model can do. They are not a promise of performance, an offer capable of acceptance, a warranty, or a commitment to provide any particular result. Real performance figures are established per deployment during an Engagement, as described below. The content of the Site may change without notice.

The Engagement. For paying customers, Auxerta scopes, builds, and hosts a custom model. A typical Engagement follows this flow:

- Free data evaluation. We review a sample of your data to assess whether a focused model is a good fit and to scope the work. This evaluation is provided at no charge and with no commitment by either party to proceed to a paid Engagement.
- Setup and fine-tuning. If you proceed, we perform a one-time setup and fine-tuning of a model for you, for a one-time fee.
- Hosting. We host and serve the resulting Customer Model behind a private API on a flat monthly subscription, tiered by volume, with no per-use billing.

The specific scope, deliverables, data inputs, fees, volume tier, and any deployment-specific performance figures for your Engagement are set out in your Customer Agreement, which controls if it conflicts with the general descriptions in these Terms. Performance figures established for a deployment reflect the data, configuration, and conditions in effect for that deployment, are not warranties of future results, and may change if those inputs change. Figures stated here and on the Site are indicative and do not constitute a binding quote until set out in a Customer Agreement.` },
    { heading: '4. Eligibility', body: `You may use the Site only if you can form a legally binding contract with Auxerta and only in compliance with these Terms and all applicable laws. To use the Site or enter into an Engagement, you must be at least 18 years old, or the age of legal majority in your jurisdiction if that is older, and able to form a binding contract.

The Site is intended for a general business and professional audience and is not directed to children. The Engagement is offered to businesses and organizations for professional, commercial purposes. It is not directed to consumers and is not intended for personal, family, or household use.

If you use the Service on behalf of an organization, you represent and warrant that you are authorized to bind that organization to these Terms and to any applicable Customer Agreement, and that the organization accepts these Terms.

You are responsible for your own access to the Site, including your devices, network, and any third-party costs. We may restrict or refuse access to the Site, in whole or in part, to any person at any time and for any lawful reason.` },
    { heading: '5. Acceptable use and prohibited conduct', body: `You agree to use the Service lawfully and respectfully. You agree that you will not, and will not attempt to or permit any third party to, do any of the following in connection with the Service:

- use the Service in violation of any applicable law or regulation, or in violation of the rights of any third party;
- submit to us, as Customer Data or otherwise, any content that you do not have the lawful right to provide, or that infringes, misappropriates, or violates the rights of any person or any law;
- submit special categories of personal data, or other highly sensitive data, unless we have agreed in writing to receive it as part of your Engagement;
- use the hosted Customer Model, the private API, or any output of the Service to develop, train, or improve a competing product or model, or to benchmark for the purpose of marketing a competing product, without our prior written consent;
- reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code, model weights, training methods, structure, or underlying technology or architecture of any Neognathae model, the Auxerta Platform, or the Service, except to the extent this restriction is prohibited by applicable law;
- resell, sublicense, rent, or otherwise make the Service available to any third party except as expressly permitted in your Customer Agreement;
- access, tamper with, probe, scan, or test the vulnerability of the Site, the private API, or any related system or network, or breach or circumvent any security or authentication measure, without our prior written authorization;
- introduce malware, viruses, or other harmful code, or interfere with or disrupt the integrity, availability, or performance of the Service or the data it contains;
- use any robot, spider, scraper, crawler, or other automated means to access, copy, or harvest content or data from the Site, or to place an unreasonable load on our infrastructure, except for well-behaved indexing by general-purpose search engines acting in accordance with our published instructions;
- frame, mirror, or republish the Site or substantial portions of it, or remove or obscure any proprietary notice;
- use the Site to send unsolicited communications, or to collect personal information about other visitors;
- exceed the volume or usage limits of your subscription tier other than as your Customer Agreement permits;
- misrepresent your identity or affiliation, or use the Service to facilitate any fraudulent, harmful, or deceptive activity; or
- use the Service, or any output of the Service, to develop, deploy, or operate any classifier or system for an unlawful, harmful, deceptive, or rights-infringing purpose, or in any manner that could expose Auxerta to legal liability.

You are responsible for the use of any private API issued to you and for keeping any credentials secure. We may investigate suspected violations of this section and may suspend or block access to the Service, after notice where practicable, if we reasonably believe a violation has occurred or is likely to occur or that your use poses a security or legal risk, without prejudice to our other rights and remedies.` },
    { heading: '6. Intellectual property', body: `Auxerta property. Auxerta and its licensors own all right, title, and interest in and to the Auxerta Platform and the Service, including the Site, the Neognathae models, our base models and model architecture, our software, tooling, methods, know-how, processes, and documentation, together with the text, copy, layout, design, graphics, illustrations, the specimen and catalogue presentation, fonts and other assets, code, and the overall look and feel of the Site, and all related intellectual property rights. These are protected by copyright, trademark, and other laws. Except for the limited rights expressly granted in these Terms or in your Customer Agreement, nothing in these Terms grants you any right, title, or interest in our intellectual property, and nothing on the Site transfers any ownership in our models or technology to you.

Limited Site license. We grant you a limited, personal, non-exclusive, non-transferable, revocable permission to access and view the Site for your own informational and evaluation purposes. You may not copy, reproduce, distribute, modify, create derivative works from, publicly display, republish, or otherwise exploit any part of the Site, or exploit Site content for commercial purposes, except as expressly permitted by these Terms or your Customer Agreement, by applicable law, or for incidental and ordinary use such as viewing pages in your browser or printing a page for your own reference.

Trademarks. The names Auxerta, Neognathae, Kestrel, and our other Neognathae model names, logos, and brand features, together with the related branding and trade dress, are owned by Auxerta. You may not use them without our prior written consent, except to refer to Auxerta or the Service truthfully and fairly to identify the Service.

Feedback. If you send us feedback, ideas, or suggestions about the Site, the Service, or our models, you grant Auxerta a perpetual, irrevocable, worldwide, royalty-free license to use that feedback for any purpose without restriction, obligation, or compensation to you. We will not identify you as the source of feedback in public materials without your consent. This does not apply to your Confidential Information, your Customer Data, or your Customer Model, and using feedback does not affect your ownership of the Customer Data or your Customer Model.

Your Customer Model. Ownership and licensing of the Customer Model built for you in an Engagement are addressed in the section titled "Customer data, confidentiality, and ownership" below.` },
    { heading: '7. Engagements, fees, and payment', body: `No charge for the Site. Using the Site is free and creates no payment obligation. A paid relationship with Auxerta exists only under a Customer Agreement that you and Auxerta sign for a specific custom model. Submitting an inquiry, requesting a data evaluation, or otherwise contacting us does not by itself create an Engagement or any obligation to proceed.

Fee structure. Fees for an Engagement are set out in your Customer Agreement. As a general structure:

- Data evaluation. The initial data evaluation is free.
- Setup and fine-tuning fee. The one-time setup and fine-tuning fee is generally in the range of about $3,000 to $5,000, with the exact amount stated in your Customer Agreement, and is payable to begin building your Customer Model.
- Monthly hosting subscription. Hosting is a flat monthly subscription, generally in the range of about $2,500 to $5,000 or more per month, tiered by your volume rather than billed per use. The applicable tier and amount are stated in your Customer Agreement.

The figures stated here are indicative ranges only. Billing is flat and subscription-based, and there is no per-use or per-call billing unless your Customer Agreement expressly states otherwise. Each Customer Model is served behind a private API.

Payment terms. Unless your Customer Agreement states otherwise:

- the setup and fine-tuning fee is due before we begin building your Customer Model, and the monthly hosting subscription is billed in advance for each subscription period;
- invoices are payable within 30 days of the invoice date, in United States dollars (USD);
- fees are stated exclusive of taxes, and you are responsible for all applicable sales, use, value-added, goods and services, withholding, and similar taxes and duties, other than taxes based on Auxerta's net income, and if we are required to collect such taxes they will be added to your invoice. If you are required by law to withhold any amount from a payment to us, you will pay us such additional amount as is necessary so that we receive the full invoiced amount; and
- fees already paid are non-refundable once the applicable work or hosting period has begun, except where these Terms or your Customer Agreement expressly provide for a refund, or where a refund is required by applicable law.

Late payment. If you do not pay an undisputed invoice when due, we may charge interest on the overdue amount at the lower of 1.5 percent per month or the maximum rate permitted by applicable law, accruing from the due date until paid. We may also, after written notice and a reasonable opportunity to cure, suspend the hosted Customer Model and the private API until payment is made, without limiting our other rights. Suspension for non-payment does not relieve you of your obligation to pay amounts due.

Changes to fees. We may revise the fees for a future subscription period or future Customer Agreement on reasonable prior written notice. Where the parties have agreed to a fixed term in a Customer Agreement, the fees for that term are as stated in that agreement, and any change takes effect on renewal or by mutual written agreement.

Precedence. These Terms apply to your use of the Site at all times and apply to an Engagement to the extent they are not addressed by, or do not conflict with, your Customer Agreement. In the event of a conflict between these Terms and a Customer Agreement regarding that Engagement, the Customer Agreement governs.` },
    { heading: '8. Customer data, confidentiality, and ownership', body: `This section sets out commitments that are central to how we work. They apply to every Engagement and are not changed or limited by any other section of these Terms.

Your data stays yours. As between you and Auxerta, you retain all right, title, and interest in your Customer Data, including any labels, annotations, and derived datasets created from it in the course of building your Customer Model. We claim no ownership of your Customer Data.

Your model is yours alone. As between the parties, you own the Customer Model that Auxerta builds for you. Your Customer Model is yours alone. It is not shared across customers, and we do not use your Customer Data, your Customer Model, or anything derived from them to train, fine-tune, build, or improve any model for any other customer or for anyone else. To the extent any rights in the Customer Model would otherwise vest in Auxerta, Auxerta assigns those rights to you on full payment of the fees due for the Engagement, subject to Auxerta's retained rights below.

Limited purpose. We use your Customer Data only to scope, build, and run your Customer Model, and for no other purpose, except as you direct in writing or as required by law.

In-house annotation. Where annotation of Customer Data is required, it is performed in-house under our direct oversight. It is never routed to third-party annotation vendors.

Private serving. Your Customer Model is served behind a private API intended to be reachable only by you and your infrastructure.

Our retained property. We retain all right, title, and interest in the Auxerta Platform, including our base models, model architecture, software, tooling, infrastructure, and general knowledge and methods, together with any improvements to them that do not embody your Customer Data. Your Customer Model may run on or be served through the Auxerta Platform, and your ownership of your Customer Model does not give you any rights in the Auxerta Platform itself. Nothing in this section transfers ownership of the Auxerta Platform to you. To the extent any element of the Auxerta Platform is embedded in or necessary to use a deliverable, Auxerta grants you a non-exclusive, non-transferable license to use that element solely as part of, and for the duration of your permitted use of, that deliverable.

Your responsibilities and license to us. You grant Auxerta a limited, non-exclusive license to use, process, and store the Customer Data solely for the purposes described above and for the duration necessary to provide the Engagement. You are responsible for having the rights and any necessary consents to provide the Customer Data to us and for our processing of it as contemplated by these Terms, for the accuracy and legality of the Customer Data, and for ensuring that your provision of Customer Data and your use of your Customer Model comply with applicable law.

Confidentiality. Each party may receive non-public information of the other party that is marked confidential or that a reasonable person would understand to be confidential given its nature and the circumstances of disclosure ("Confidential Information"). Your Customer Data is your Confidential Information. Our non-public technical and business information, including details of our models, architecture, methods, platform, and pricing, is our Confidential Information. The terms of a Customer Agreement are the Confidential Information of both parties. The receiving party will use the disclosing party's Confidential Information only as necessary to perform or receive the Service under these Terms and any Customer Agreement, will protect it using at least reasonable care, and in no event less than the degree of care it uses to protect its own Confidential Information, and will not disclose it except to its employees, contractors, and advisors who need it for the Engagement and who are bound by confidentiality obligations at least as protective as these. Confidential Information does not include information that the receiving party can show is or becomes public through no fault of the receiving party, was rightfully known to it without a duty of confidentiality before disclosure, is rightfully received from a third party without a duty of confidentiality, or is independently developed without use of the disclosing party's Confidential Information. The receiving party may disclose Confidential Information if required by law or legal process, provided that, where legally permitted, it gives the disclosing party reasonable prior notice and cooperates in any effort to limit or contest the disclosure. These confidentiality obligations continue for the term of the Engagement and for 5 years after it ends, except that obligations with respect to information that is a trade secret continue for as long as the information remains a trade secret under applicable law.

Data protection. If the parties process personal data in connection with an Engagement, the parties will, where required by applicable law, enter into a separate data processing agreement or addendum that governs that processing, and that agreement controls over this section to the extent of any conflict on those matters. Specific data protection, security, retention, and deletion terms, where applicable, are set out in your Customer Agreement.` },
    { heading: '9. Third-party services and links', body: `The Site uses a consent-gated Google Analytics as its only analytics, as described in the section titled "The Service". Your use of analytics, where consented, is also subject to the relevant Google terms and privacy notices. For details on what we collect and how we handle it, see our Privacy Policy, where one is published.

The Site may contain links to third-party websites or resources. Those are provided for convenience only. We do not control, endorse, or assume responsibility for any third-party site, service, or content, and your use of them is at your own risk and subject to their own terms and policies.` },
    { heading: '10. Service availability', body: `We work to provide a reliable, well-run service, to keep the Site accurate and available, and to host your Customer Model with appropriate care.

We do not, however, guarantee any specific uptime, availability, response time, latency, or throughput unless a service level commitment is separately agreed in writing in a Customer Agreement. Absent such a written commitment, the Service, including the Site, the hosted Customer Model, and the private API, is provided on a reasonable-efforts basis, and any availability or performance figures discussed are targets and not guarantees.

We may perform maintenance, updates, and changes to the Auxerta Platform, and we may need to interrupt or suspend the Service for maintenance, security, or operational reasons. Where practicable, we will give reasonable advance notice of planned maintenance that we expect to materially affect the Service. We may also modify, suspend, or discontinue the Site, in whole or in part, at any time.` },
    { heading: '11. Warranties and disclaimers', body: `Mutual authority. Each party represents and warrants that it has the authority to enter into these Terms and any Customer Agreement, and that doing so does not breach any other agreement to which it is a party.

Limited performance warranty. We warrant that we will perform any Engagement services in a professional and workmanlike manner, consistent with general industry standards, these Terms, and the applicable Customer Agreement.

Disclaimer. Except for the express warranties stated above and any warranty expressly stated in a signed Customer Agreement, and to the maximum extent permitted by applicable law, the Site and the Service, and all content, information, and materials on them, are provided on an "AS IS" and "AS AVAILABLE" basis, with all faults, and Auxerta disclaims all other warranties, conditions, and representations of any kind, whether express, implied, statutory, or arising from course of dealing or usage of trade, including any implied warranties of merchantability, fitness for a particular purpose, title, accuracy, and non-infringement.

Without limiting the foregoing, Auxerta does not warrant that the Site or the Service, or any model output, will be accurate, complete, reliable, uninterrupted, timely, secure, or error-free, that any defects will be corrected, that the Site or its servers are free of harmful components, that the Service will meet your requirements, or that the Customer Model will produce any particular result, level of accuracy, or output for any given input. AI models, including focused single-task models, produce probabilistic predictions and can produce incorrect or unexpected results. Any accuracy, latency, or other performance figures shown on the Site or in marketing materials are illustrative only and are not warranted, and real performance is established per deployment. You are responsible for evaluating the suitability of the Customer Model and its outputs for your purposes, for reviewing model outputs before relying on them, and for any decisions made in reliance on them.

Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.` },
    { heading: '12. Limitation of liability', body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NEITHER PARTY, AND IN THE CASE OF AUXERTA NONE OF ITS AFFILIATES OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, GOODWILL, BUSINESS, BUSINESS OPPORTUNITY, ANTICIPATED SAVINGS, OR DATA, OR FOR THE COST OF SUBSTITUTE SERVICES, ARISING OUT OF OR RELATING TO THE SITE, THESE TERMS, OR ANY ENGAGEMENT, WHETHER BASED IN CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER THEORY, EVEN IF THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES AND EVEN IF A LIMITED REMEDY FAILS OF ITS ESSENTIAL PURPOSE.

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, AUXERTA'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THE SITE, THESE TERMS, AND ANY ENGAGEMENT WILL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY YOU TO AUXERTA FOR THE APPLICABLE ENGAGEMENT IN THE TWELVE (12) MONTHS IMMEDIATELY BEFORE THE EVENT GIVING RISE TO THE LIABILITY. BECAUSE USE OF THE SITE IS FREE, AND IF YOU HAVE NOT PAID AUXERTA ANY FEES, AUXERTA'S TOTAL AGGREGATE LIABILITY FOR CLAIMS ARISING SOLELY FROM YOUR USE OF THE SITE OR WHERE NO FEES HAVE BEEN PAID WILL NOT EXCEED ONE HUNDRED UNITED STATES DOLLARS ($100).

Exception. The exclusions and the aggregate cap above do not apply to a party's breach of its confidentiality obligations or of the data and model commitments in the section titled "Customer data, confidentiality, and ownership", to your obligation to pay fees due, to a party's indemnification obligations under these Terms, or to liability that cannot be excluded or limited under applicable law.

These limitations form an essential basis of the bargain between the parties, are a reasonable allocation of risk, and apply to all claims in the aggregate. Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above may not apply to you, in which case Auxerta's liability is limited to the maximum extent permitted by applicable law.` },
    { heading: '13. Indemnification', body: `By you. To the maximum extent permitted by applicable law, you will defend, indemnify, and hold harmless Auxerta and its affiliates, and their respective officers, directors, employees, and agents (the "Auxerta Parties"), from and against any third-party claims, demands, suits, or proceedings, and any resulting losses, damages, liabilities, settlements, costs, and expenses, including reasonable attorneys' fees, arising out of or relating to:

- your Customer Data, including any claim that the Customer Data, or our processing of it as contemplated by these Terms, infringes, misappropriates, or violates the rights of any person or any law, and your right to provide it;
- your use of the Service in violation of these Terms, any Customer Agreement, or applicable law, including the section titled "Acceptable use and prohibited conduct";
- your model outputs and any decisions or actions you take based on them;
- your infringement or misappropriation of any intellectual property or other right of Auxerta or any third party; or
- your breach of any representation, warranty, covenant, or obligation in these Terms.

By Auxerta. We will defend, indemnify, and hold harmless the Customer from and against any third-party claim, and any resulting losses, damages, liabilities, costs, and reasonable legal fees, alleging that the Auxerta Platform as provided by us, when used as permitted under these Terms, infringes that third party's intellectual property rights. This obligation does not apply to the extent a claim arises from the Customer Data, from modifications not made by us, from combination of a deliverable with items not provided by us, or from use of the Service in violation of these Terms.

Procedure. The party seeking indemnification will promptly notify the other of the claim, give the indemnifying party control of the defense and settlement of the claim, provided that no settlement imposing a non-monetary obligation or admitting fault on the indemnified party may be made without that party's prior written consent, not to be unreasonably withheld, and provide reasonable cooperation. The indemnified party may participate in the defense with its own counsel at its own expense. This section states the indemnifying party's entire liability, and the indemnified party's exclusive remedy, for the claims it covers.` },
    { heading: '14. Term and termination', body: `Site. These Terms apply from the first time you access the Site and continue while you use it. You may stop using the Site at any time. We may modify, suspend, or discontinue the Site, in whole or in part, at any time, and may restrict or terminate your access to it at any time and for any lawful reason, including for any breach of these Terms.

Engagement term. An Engagement begins on the start date stated in the applicable Customer Agreement, or on the start of fine-tuning work if no date is stated, and continues for the term set out in that agreement. If the Customer Agreement does not state a term, the hosting subscription continues on a month-to-month basis until terminated. Unless the Customer Agreement states otherwise, either party may terminate a month-to-month hosting subscription for convenience on at least 30 days' written notice before the end of the then-current subscription period.

Termination for cause. Either party may terminate these Terms or an affected Engagement for cause if the other party materially breaches these Terms or the applicable Customer Agreement and does not cure the breach within thirty (30) days after written notice describing it. We may suspend or terminate an Engagement for non-payment as described in the section titled "Engagements, fees, and payment", and for use that violates the section titled "Acceptable use and prohibited conduct". We may suspend or terminate your access to the Service, in whole or in part, immediately and without liability if we reasonably believe that your continued use poses a security, legal, or operational risk or that suspension or termination is required to comply with law.

Effect of termination. On termination or expiration of an Engagement:

- you will pay all fees accrued and payable up to the effective date of termination, and fees already paid for the terminated period are non-refundable except where these Terms or the Customer Agreement expressly provide otherwise or as required by law;
- we will stop hosting and serving your Customer Model, and access to the private API will end;
- at your request made within a reasonable period after termination, we will make your Customer Data, and, where technically feasible, your Customer Model, available to you for export in a commercially reasonable format. After that period, we may delete the Customer Data and the hosted instance of your Customer Model from our systems in the ordinary course, subject to any legal retention obligations and to routine backups that are deleted on a routine cycle, which remain subject to the confidentiality obligations in these Terms; and
- each party will, on request, return or destroy the other party's Confidential Information, subject to the export rights above and to routine backups.

Independence. Termination of your access to the Site does not by itself terminate an Engagement, and termination of an Engagement does not by itself terminate your ability to view the Site.

Survival. Provisions that by their nature should survive termination will survive, including the sections titled "Intellectual property", "Engagements, fees, and payment" for amounts accrued before termination, "Customer data, confidentiality, and ownership", "Warranties and disclaimers", "Limitation of liability", "Indemnification", "Governing law and dispute resolution", and "General".` },
    { heading: '15. Governing law and dispute resolution', body: `These Terms, and any dispute arising out of or relating to them or to the Service, are governed by the laws of the State of Delaware, United States, without regard to its conflict of laws rules and excluding the United Nations Convention on Contracts for the International Sale of Goods.

Informal resolution. Before bringing a formal proceeding, the parties will first try in good faith to resolve any dispute informally by negotiation between representatives with authority to settle. Either party may begin this process by sending written notice of the dispute to the other party, including by contacting us at contact@auxerta.com. If the dispute is not resolved within thirty (30) days after that notice, either party may proceed as set out below.

Arbitration. Any unresolved dispute will be finally settled by binding arbitration administered by the American Arbitration Association (AAA) under its then-current rules, by a single arbitrator, conducted in the English language, with the seat and venue in Wilmington, Delaware. Judgment on the award may be entered in any court of competent jurisdiction. Each party bears its own costs unless the rules or the tribunal provide otherwise.

Courts and injunctive relief. To the extent any dispute is not subject to arbitration, the parties submit to the exclusive jurisdiction of the courts located in the State of Delaware, United States. Notwithstanding the foregoing, either party may bring an individual action for small claims, or may seek injunctive or other equitable relief, in any court of competent jurisdiction to protect its intellectual property or Confidential Information.

Individual basis. To the extent permitted by applicable law, each party waives any right to a trial by jury and agrees that disputes will be resolved on an individual basis and not as part of any class, collective, or representative proceeding. Any dispute resolution provisions in a signed Customer Agreement govern disputes arising under that Engagement to the extent they differ from this section. Where the law applicable to you grants you mandatory rights that cannot be waived, including any mandatory consumer rights under the law of your place of residence, nothing in this section limits those rights.` },
    { heading: '16. Changes to these Terms', body: `We may update these Terms from time to time. When we make changes, we will revise the "Last updated" date above and post the updated version on the Site.

If we make a material change, we will take reasonable steps to provide notice before it takes effect, for example by posting a notice on the Site or, for customers with an active Engagement, by sending notice to the contact associated with the Customer Agreement.

Changes to the Site portion of these Terms take effect when posted unless we state otherwise, and your continued use of the Site after they take effect constitutes acceptance of the revised Terms. For an active Engagement, material changes that adversely affect you will not apply to the then-current subscription period or fixed term already paid for. They take effect on renewal or as otherwise agreed in writing. Material changes do not apply retroactively to a dispute of which we have notice. If you do not agree to a change, your remedy is to stop using the Site and, for an Engagement, to decline renewal in accordance with the termination provisions. Changes to these general Terms do not by themselves amend a signed Customer Agreement, which can be amended only as that agreement provides.` },
    { heading: '17. General', body: `Entire agreement. These Terms, together with our Privacy Policy and, for any Engagement, the applicable Customer Agreement and any document expressly incorporated by reference, are the entire agreement between you and Auxerta regarding the Service and supersede all prior or contemporaneous understandings on that subject.

Severability. If any provision of these Terms is held invalid or unenforceable, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will remain in full force and effect.

Waiver. A party's failure or delay in enforcing any provision of these Terms is not a waiver of that or any other right or provision, and no waiver is effective unless made in writing.

Assignment. You may not assign or transfer these Terms or any Customer Agreement, or any rights or obligations under them, in whole or in part, without our prior written consent, and any attempted assignment in violation of this provision is void. We may assign these Terms, in whole or in part, to an affiliate or successor or in connection with a merger, acquisition, reorganization, financing, or sale of all or substantially all of our assets. These Terms bind and benefit the parties and their permitted successors and assigns.

Force majeure. Neither party is liable for any delay or failure to perform, other than an obligation to pay money, caused by events beyond its reasonable control, including acts of God, natural disasters, fire, flood, epidemic or pandemic, war, terrorism, civil unrest, labor disputes, governmental action, failure of utilities or telecommunications, internet, hosting provider, or other third-party infrastructure outages, and denial of service or other malicious attacks.

Relationship of the parties. The parties are independent contractors. These Terms do not create any partnership, joint venture, agency, fiduciary, or employment relationship between them.

No third-party beneficiaries. Except for the Auxerta Parties named in the section titled "Indemnification", these Terms do not create any rights for any person other than the parties.

Notices. We may provide notices to you by posting on the Site or, for an Engagement, by sending them to the contact associated with your Customer Agreement or otherwise on file. You may send legal notices to us at contact@auxerta.com, which is our preferred address for notices. Our registered office is Auxerta, Inc., 8 The Green, Dover, Delaware. Notices are effective when posted, when received, or, for email, when sent absent a delivery failure notice.

Interpretation. Headings are for convenience only. "Including" means "including without limitation."` },
    { heading: '18. Contact', body: `If you have questions about these Terms or the Service, contact Auxerta at contact@auxerta.com or visit auxerta.com.

Operator: Auxerta, Inc., a Delaware corporation, 8 The Green, Dover, Delaware.` },
  ],
}
function TermsApp() {
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-7 md:p-9 max-w-2xl">
        <Eyebrow>Terms</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#1A1815]">Terms of Service</h2>
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]">{TERMS_DOC.updated}</p>
        <p className="mt-5 text-sm md:text-[0.95rem] leading-relaxed text-[#4A463F] whitespace-pre-line">{TERMS_DOC.intro}</p>
        <div className="mt-7 space-y-7">
          {TERMS_DOC.sections.map((s) => (
            <section key={s.heading}>
              <h3 className="font-sans text-base font-semibold tracking-tight text-[#1A1815]">{s.heading}</h3>
              <p className="mt-2 text-sm text-[#4A463F] leading-relaxed whitespace-pre-line">{s.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-7 pt-6 border-t border-[#E6E1D6]">
          <button onClick={() => window.dispatchEvent(new CustomEvent('neo-open', { detail: 'privacy' }))} className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[#1A1815] hover:text-[#B8541F] transition-colors">Privacy Policy <span aria-hidden>→</span></button>
        </div>
      </div>
    </div>
  )
}

/* ── News (placeholder, no content yet) ── */
function NewsApp() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const mos = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const stamp = `${days[now.getDay()]} ${now.getDate()} ${mos[now.getMonth()]} ${now.getFullYear()} · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return (
    <div className="neo-scroll h-full overflow-auto bg-white">
      <div className="p-7 md:p-9">
        <Eyebrow>News</Eyebrow>
        <h2 className="mt-3 font-sans text-2xl md:text-3xl font-semibold tracking-tight text-[#1A1815]">Updates.</h2>
        <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82] tabular-nums">As of {stamp}</p>
        <div className="mt-8 flex flex-col items-center text-center gap-3 py-16 px-6 border border-dashed border-[#E6E1D6] rounded-xl bg-[#FBF9F4]">
          <FlockMark className="w-10 h-10 text-[#DCD6C9]" />
          <p className="font-sans text-lg font-semibold text-[#928C82]">No updates yet</p>
          <p className="text-sm text-[#807A70] max-w-xs leading-relaxed">Auxerta announcements and product updates will appear here.</p>
          <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[#928C82]"><span aria-hidden className="h-1.5 w-1.5 rounded-full border border-[#CCC6BA]" /> In preparation</span>
        </div>
      </div>
    </div>
  )
}

export const APPS: AppDef[] = [
  { id: 'kestrel', title: 'Kestrel', code: 'NEO-001', w: 900, h: 640, x: 280, y: 84, Body: KestrelApp },
  { id: 'catalogue', title: 'Catalogue', code: 'FAMILY', w: 820, h: 600, x: 360, y: 120, Body: CatalogueApp },
  { id: 'terminal', title: 'Terminal', code: 'SHELL', w: 680, h: 460, x: 320, y: 150, Body: Terminal },
  { id: 'contact', title: 'Contact', code: 'CONTACT', w: 560, h: 520, x: 380, y: 132, Body: ContactApp },
  { id: 'auxerta', title: 'Auxerta', code: 'LAB', w: 560, h: 520, x: 400, y: 150, Body: AuxertaApp },
  { id: 'privacy', title: 'Privacy', code: 'NOTES', w: 600, h: 560, x: 420, y: 168, Body: PrivacyApp },
  { id: 'terms', title: 'Terms', code: 'TOS', w: 640, h: 600, x: 440, y: 186, Body: TermsApp },
  { id: 'news', title: 'News', code: 'WIRE', w: 560, h: 480, x: 460, y: 204, Body: NewsApp },
]
