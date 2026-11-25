import { CODE_CHECKS } from './codeChecks'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const TEMPLATES = {
  cp1: [
    {
      title: 'Personal Info Card',
      description: 'Store a person\'s name, age, and favorite subject in variables, then print them as a neat info card.',
      instructions:
        '1. Declare three variables.\n2. Print each value on its own line.\n3. Match the sample format exactly.',
      pythonStarter: 'name = ""\nage = 0\nsubject = ""\n\n# Print the info card\n',
    },
    {
      title: 'Temperature Converter',
      description: 'Convert a Celsius value to Fahrenheit and print the result.',
      instructions:
        'Use the formula F = C x 9/5 + 32.\nPrint the result rounded to one decimal place.',
      pythonStarter: 'celsius = float(input())\n\n# Convert and print\n',
    },
  ],
  cp2: [
    {
      title: 'Count the Vowels',
      description: 'Read a word and count how many vowels it contains using a loop.',
      instructions:
        '1. Loop through each character.\n2. Count a, e, i, o, u (case-insensitive).\n3. Print the total count.',
      pythonStarter: 'word = input().lower()\ncount = 0\n\n# Count vowels with a loop\n',
    },
    {
      title: 'Find the Largest',
      description: 'Read a list of numbers and print the largest value without using max().',
      instructions:
        '1. Read space-separated numbers.\n2. Use a loop to track the largest value seen so far.\n3. Print the largest.',
      pythonStarter: 'values = list(map(int, input().split()))\n\n# Find the largest value\n',
    },
  ],
  cp3: [
    {
      title: 'Power Function',
      description: 'Write a recursive function power(base, exp) that returns base raised to exp.',
      instructions:
        '1. Handle exp = 0 as the base case.\n2. Do not use the ** operator.\n3. Print the result.',
      pythonStarter: 'def power(base, exp):\n    pass\n\nprint(power(int(input()), int(input())))\n',
    },
    {
      title: 'Palindrome Checker',
      description: 'Write a function that checks whether a word reads the same forwards and backwards.',
      instructions:
        '1. Return True or False.\n2. Print "Palindrome" or "Not a palindrome".',
      pythonStarter: 'def is_palindrome(word):\n    pass\n\nprint(is_palindrome(input()))\n',
    },
  ],
  cp4: [
    {
      title: 'Library Book Class',
      description: 'Create a Book class with a title, author, and borrowed status, plus borrow() and return_book() methods.',
      instructions:
        '1. Track whether the book is borrowed.\n2. borrow() marks it borrowed; calling it twice prints "Already borrowed".\n3. return_book() makes it available again.',
      pythonStarter: 'class Book:\n    pass\n',
    },
    {
      title: 'Shape Area Classes',
      description: 'Create a base Shape class and Circle/Rectangle subclasses that implement area().',
      instructions:
        '1. Use inheritance.\n2. Each subclass overrides area().\n3. Print the area of one circle and one rectangle.',
      pythonStarter: 'class Shape:\n    pass\n',
    },
  ],
  cp5: [
    {
      title: 'Binary Search',
      description: 'Implement binary search on a sorted list and return the index of a target, or -1 if absent.',
      instructions:
        '1. Do not use the built-in index() or in operator.\n2. Return the index of the target.\n3. Print the result.',
      pythonStarter:
        'def binary_search(values, target):\n    pass\n\nvalues = list(map(int, input().split()))\ntarget = int(input())\nprint(binary_search(values, target))\n',
    },
    {
      title: 'Word Frequency',
      description: 'Count how many times each word appears in a sentence using a dictionary.',
      instructions:
        '1. Split the sentence into words.\n2. Count each word with a dictionary.\n3. Print each word and count in first-seen order.',
      pythonStarter: 'sentence = input().lower().split()\n\n# Build a frequency dictionary\n',
    },
  ],
}

const POINTS = { easy: 20, medium: 30, hard: 40 }

function starterFor(language, pythonStarter) {
  if (!language || language === 'Python') return pythonStarter
  const skeletons = {
    'C++':
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: read input and solve the problem\n    return 0;\n}\n',
    Java:
      'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // TODO: read input and solve the problem\n    }\n}\n',
    JavaScript: '// TODO: read input and solve the problem\n',
  }
  return skeletons[language] || pythonStarter
}

export async function generateProblem({ lesson, subjectId, difficulty = 'medium', language = 'Python' }) {
  await wait(1100)
  const bank = TEMPLATES[subjectId] || TEMPLATES.cp1
  const template = bank[Math.floor(Math.random() * bank.length)]
  const context = lesson && lesson.trim() ? `Based on your lesson: ${lesson.trim()}` : ''

  return {
    title: template.title,
    description: context ? `${context}\n\n${template.description}` : template.description,
    instructions: template.instructions,
    starterCode: starterFor(language, template.pythonStarter),
    language,
    points: POINTS[difficulty] || 30,
  }
}

export async function customizeLesson({ lesson, request }) {
  await wait(900)
  const clean = request.trim().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
  const lower = clean.toLowerCase()
  const notes = []

  if (/simpl|easy|beginner|slow/.test(lower)) {
    notes.push('We will go through this lesson step by step and define each new term before using it.')
  }
  if (/example|real.world|scenario|situation/.test(lower)) {
    notes.push('We will spend extra time on a real-world example that connects this topic to something familiar.')
  }
  if (/quiz|question|practice|test/.test(lower)) {
    notes.push('We will review the quiz answers together and discuss why each option is correct or incorrect.')
  }
  if (/error|mistake|debug|confus/.test(lower)) {
    notes.push('We will pause on common mistakes and see how to spot and fix them.')
  }
  if (/challenge|advanced|fast|extra/.test(lower)) {
    notes.push('There is a short challenge for students who finish early.')
  }
  if (notes.length === 0) {
    notes.push(`This lesson focuses on: ${clean}.`)
  }

  return {
    note: notes.join(' '),
    reply: `Done — I applied your focus to "${lesson.title}". Review the lesson preview above, then publish when it looks right.`,
  }
}

const TEST_CASE_BANK = [
  {
    match: /hello,?\s*world/i,
    cases: [{ input: '', expectedOutput: 'Hello, World!' }],
  },
  {
    match: /greeting|ask for a name/i,
    cases: [{ input: 'Ada', expectedOutput: 'Hello, Ada!' }],
  },
  {
    match: /personal info|info card/i,
    cases: [{ input: '', expectedOutput: 'Ada\n18\nMath' }],
  },
  {
    match: /variables|data types|student record/i,
    cases: [{ input: '', expectedOutput: 'Ada\n18\n92.5' }],
  },
  {
    match: /pass or fail|pass\/fail|conditionals/i,
    cases: [
      { input: '82', expectedOutput: 'Pass' },
      { input: '60', expectedOutput: 'Fail' },
      { input: '75', expectedOutput: 'Pass' },
    ],
    checks: ['conditional'],
  },
  {
    match: /temperature|celsius|fahrenheit/i,
    cases: [
      { input: '100', expectedOutput: '212.0' },
      { input: '0', expectedOutput: '32.0' },
    ],
  },
  {
    match: /calculator|operator/i,
    cases: [
      { input: '2\n+\n3', expectedOutput: '5' },
      { input: '7\n*\n6', expectedOutput: '42' },
      { input: '9\n-\n4', expectedOutput: '5' },
    ],
    checks: ['conditional'],
  },
  {
    match: /triangle|pyramid|stars/i,
    cases: [
      { input: '3', expectedOutput: '*\n**\n***' },
      { input: '1', expectedOutput: '*' },
    ],
    checks: ['nestedLoop'],
  },
  {
    match: /sum/i,
    cases: [
      { input: '5', expectedOutput: '15' },
      { input: '1', expectedOutput: '1' },
    ],
    checks: ['loop', 'noSum'],
  },
  {
    match: /prime/i,
    cases: [
      { input: '7', expectedOutput: 'Prime' },
      { input: '8', expectedOutput: 'Not Prime' },
    ],
    checks: ['loop'],
  },
  {
    match: /fibonacci|\bfib\b/i,
    cases: [
      { input: '0', expectedOutput: '0' },
      { input: '6', expectedOutput: '8' },
      { input: '10', expectedOutput: '55' },
    ],
    checks: ['function', 'recursion', 'noLoop'],
  },
  {
    match: /palindrome/i,
    cases: [
      { input: 'racecar', expectedOutput: 'Palindrome' },
      { input: 'hello', expectedOutput: 'Not a palindrome' },
    ],
    checks: ['function'],
  },
  {
    match: /bubble sort|sort a list|sort the list|sorting/i,
    cases: [
      { input: '5 3 1 4 2', expectedOutput: '1 2 3 4 5' },
      { input: '2 2 1', expectedOutput: '1 2 2' },
    ],
    checks: ['nestedLoop', 'noSort'],
  },
  {
    match: /binary search/i,
    cases: [
      { input: '1 3 5 7 9\n5', expectedOutput: '2' },
      { input: '1 3 5\n4', expectedOutput: '-1' },
    ],
    checks: ['loop'],
  },
  {
    match: /vowel/i,
    cases: [
      { input: 'education', expectedOutput: '5' },
      { input: 'xyz', expectedOutput: '0' },
    ],
    checks: ['loop'],
  },
  {
    match: /largest|find the max|maximum value/i,
    cases: [
      { input: '3 9 2', expectedOutput: '9' },
      { input: '4 4 1', expectedOutput: '4' },
    ],
    checks: ['loop', 'noMax'],
  },
  {
    match: /word frequency|frequency|dictionary/i,
    cases: [{ input: 'the cat the', expectedOutput: 'the 2\ncat 1' }],
    checks: ['loop', 'dictionary'],
  },
  {
    match: /power function|power\s*\(/i,
    cases: [
      { input: '2\n5', expectedOutput: '32' },
      { input: '3\n0', expectedOutput: '1' },
    ],
    checks: ['function', 'recursion'],
  },
  {
    match: /reverse/i,
    cases: [{ input: '1 2 3', expectedOutput: '3 2 1' }],
    checks: ['loop'],
  },
  {
    match: /\bclass(es)?\b/i,
    cases: [],
    checks: ['class', 'init'],
  },
]

export async function generateTestCases({ title = '', description = '', instructions = '' }) {
  await wait(900)
  const text = [title, description, instructions].join('\n')
  const entry = TEST_CASE_BANK.find((item) => item.match.test(text))
  if (!entry) return []
  return [
    ...(entry.cases || []).map((testCase) => ({ type: 'output', ...testCase })),
    ...(entry.checks || []).map((check) => ({
      type: 'code',
      check,
      label: CODE_CHECKS[check].label,
    })),
  ]
}

function analyze(activity, code) {
  const text = code || ''
  const notes = []
  const review = []
  const subject = activity?.subjectId

  if (!text.trim()) notes.push('Your submission is empty, so start by writing the smallest working version you can.')

  if (subject === 'cp2') {
    if (!/\b(for|while)\b/.test(text)) {
      notes.push('This activity is about loops, but I do not see a for or while loop in your code.')
      review.push('for and while loops, and how to update a counter inside them')
    }
    if (/\bsum\s*\(/.test(text)) {
      notes.push('You reached for the built-in sum(). Try computing the total manually with a loop so you practice the pattern.')
      review.push('accumulator patterns (total = total + value)')
    }
  }

  if (subject === 'cp3') {
    if (!/\bdef\b/.test(text)) {
      notes.push('The problem expects a function, but your code does not define one yet.')
      review.push('defining functions and returning values')
    }
    if (activity?.title?.toLowerCase().includes('reverse') && /\[::-1\]|\.reverse\s*\(/.test(text)) {
      notes.push('You used a shortcut to reverse. Try doing it with your own loop so you understand the mechanics.')
      review.push('indexing from the end of a list')
    }
    if (/fib/i.test(activity?.title || '') && !/\breturn\b/.test(text)) {
      notes.push('Recursive functions need a base case and a return statement. Check that both are present.')
      review.push('base cases and recursive calls')
    }
  }

  if (subject === 'cp4') {
    if (!/\bclass\b/.test(text)) {
      notes.push('The task is about classes, but I do not see a class definition yet.')
      review.push('class definitions, __init__, and methods')
    }
    if (/\bpass\b/.test(text)) {
      notes.push('There is still a pass placeholder in your code, which means a part of the solution is unfinished.')
      review.push('filling in methods and attributes')
    }
  }

  if (subject === 'cp5') {
    if (activity?.title?.toLowerCase().includes('bubble') && !/\bfor\b|\bwhile\b/.test(text)) {
      notes.push('Bubble sort needs a loop that compares neighbouring values and swaps them.')
      review.push('nested loops and swapping values')
    }
  }

  if (/range\s*\(\s*len\s*\([^)]*\)\s*-\s*1/.test(text)) {
    notes.push('Your loop walks the list backwards with hand-computed bounds. That is a common place for off-by-one errors.')
    review.push('loop boundaries and reverse iteration')
  }

  if (/\w+\s*\[\s*\w+\s*\]/.test(text)) {
    notes.push('You index the list manually in several places. Double-check that every index stays in range.')
    review.push('array indexing and bounds checking')
  }

  if (!/\bprint\s*\(|console\.log|cout|System\.out/.test(text)) {
    notes.push('I do not see any output statement, so the program may not print anything.')
    review.push('printing output in the expected format')
  }

  if (notes.length === 0) {
    notes.push('Your structure looks reasonable at a glance. Focus on edge cases: empty input, single values, and the exact output format.')
    review.push('testing edge cases and matching the expected output')
  }

  return { notes, review }
}

export async function studentBlinkReply({ activity, code, question, subject }) {
  await wait(900)
  const { notes, review } = analyze(activity, code)
  const q = (question || '').toLowerCase()

  const wantsReview = /learn|review|study|improve|topic|lesson/.test(q)
  const wantsMistake = /wrong|mistake|error|bug|why|where/.test(q)

  const lines = []
  lines.push(`Let's look at "${activity?.title || 'this activity'}" together.`)

  if (wantsMistake || !wantsReview) {
    lines.push('')
    lines.push('What I noticed in your submission:')
    notes.forEach((n) => lines.push(`- ${n}`))
  }

  if (wantsReview || wantsMistake) {
    lines.push('')
    lines.push('What I would review next:')
    review.forEach((r) => lines.push(`- ${r}`))
  }

  lines.push('')
  lines.push(
    subject
      ? `Review the feedback above and keep practicing with small test cases to solidify your understanding.`
      : 'Try reworking one small piece at a time, then run it again.',
  )
  lines.push('')
  lines.push('I will guide you toward the answer, but I will not hand you the full solution — that part is yours to write.')

  return lines.join('\n')
}

export async function instructorFeedback({ activity, submission }) {
  await wait(800)
  const { notes } = analyze(activity, submission?.code)
  const grade = submission?.grade
  const opener =
    grade == null
      ? 'Thanks for submitting.'
      : grade >= 90
        ? 'Excellent work overall.'
        : grade >= 75
          ? 'Good attempt overall.'
          : 'This needs another pass.'

  const body = notes.slice(0, 2).join(' ')
  return `${opener} ${body} Review the relevant topic to keep improving.`
}

const ISSUE_GROUPS = [
  { label: 'Incorrect loop conditions', topic: 'loop conditions', test: /loop/i, advice: 'Review loop boundaries and iteration logic.' },
  { label: 'Array index errors', topic: 'array indexing', test: /index/i, advice: 'Review index bounds and off-by-one errors.' },
  { label: 'Missing or incorrect output', topic: 'output formatting', test: /output statement/i, advice: 'Check that printed output matches the expected format exactly.' },
  { label: 'Unfinished placeholders', topic: 'incomplete placeholders', test: /pass placeholder/i, advice: 'Look for remaining pass statements and unfinished branches.' },
  { label: 'Incorrect function or class usage', topic: 'function and class usage', test: /function|class|return statement/i, advice: 'Review function returns, class definitions, and how methods are called.' },
  { label: 'Shortcut patterns', topic: 'built-in shortcuts', test: /shortcut|built-in/i, advice: 'Practice the underlying pattern instead of relying on built-ins.' },
  { label: 'Empty submissions', topic: 'empty submissions', test: /submission is empty/i, advice: 'Follow up with students who submitted an empty solution.' },
]

export async function analyzeSubmissions({ activity, submissions }) {
  await wait(1000)
  const counts = new Map()

  submissions.forEach((submission) => {
    const { notes } = analyze(activity, submission.code)
    const counted = new Set()
    notes.forEach((note) => {
      const group = ISSUE_GROUPS.find((item) => item.test.test(note))
      if (!group || counted.has(group.label)) return
      counted.add(group.label)
      counts.set(group.label, (counts.get(group.label) || 0) + 1)
    })
  })

  const categories = [...counts.entries()]
    .map(([label, count]) => {
      const group = ISSUE_GROUPS.find((item) => item.label === label)
      return {
        label,
        topic: group.topic,
        advice: group.advice,
        count,
        percent: submissions.length ? (count / submissions.length) * 100 : 0,
      }
    })
    .sort((a, b) => b.count - a.count)

  const top = categories[0]
  const who = submissions.length === 1 ? 'The student' : 'Students'
  let observation = 'Most submissions look structurally sound. Focus feedback on edge cases and matching the expected output exactly.'
  if (top) {
    observation =
      top.label === 'Empty submissions'
        ? `${who} submitted an empty solution. Follow up before grading.`
        : `${who} frequently ${submissions.length === 1 ? 'makes' : 'make'} mistakes involving ${top.topic}. ${top.advice}`
  }

  return { analyzed: submissions.length, categories, observation }
}
