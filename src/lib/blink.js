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
      ? `Try reworking one small piece at a time, then run it again. You have already submitted, so feel free to resubmit after revising.`
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
  return `${opener} ${body} Review the relevant topic and feel free to resubmit for another look.`
}
