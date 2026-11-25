const DAY = 24 * 60 * 60 * 1000

function due(offsetDays, hour = 23) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, 59, 0, 0)
  return d.toISOString()
}

export const SUBJECTS = [
  { id: 'cp1', code: 'IT111', name: 'Computer Programming 1', blurb: 'Variables, data types, and control flow' },
  { id: 'cp2', code: 'IT112', name: 'Computer Programming 2', blurb: 'Loops, arrays, and problem solving' },
  { id: 'cp3', code: 'IT113', name: 'Computer Programming 3', blurb: 'Functions, recursion, and structures' },
  { id: 'cp4', code: 'IT114', name: 'Computer Programming 4', blurb: 'Objects, classes, and OOP' },
  { id: 'cp5', code: 'IT115', name: 'Computer Programming 5', blurb: 'Algorithms and applied projects' },
]

export const SECTIONS = [
  { id: 't151', code: 'T151', name: 'Section T151', subjectId: 'cp1', room: 'Lab 1', schedule: 'MWF · 8:00–9:00 AM' },
  { id: 't152', code: 'T152', name: 'Section T152', subjectId: 'cp2', room: 'Lab 2', schedule: 'MWF · 9:00–10:00 AM' },
  { id: 't153', code: 'T153', name: 'Section T153', subjectId: 'cp3', room: 'Lab 1', schedule: 'TTh · 8:00–9:30 AM' },
  { id: 't154', code: 'T154', name: 'Section T154', subjectId: 'cp4', room: 'Lab 3', schedule: 'TTh · 10:00–11:30 AM' },
  { id: 't155', code: 'T155', name: 'Section T155', subjectId: 'cp5', room: 'Lab 2', schedule: 'MWF · 1:00–2:00 PM' },
]

export const INSTRUCTOR = {
  id: 'ins-1',
  role: 'instructor',
  name: 'Prof. Elena Reyes',
  email: 'instructor@codeassist.edu',
  title: 'Instructor · Computer Programming',
}

const STUDENT_SEED = [
  { id: 'stu-1', name: 'Juan Dela Cruz', email: 'student@codeassist.edu', sectionId: 't151' },
]

const ACTIVITY_SEED = [
  {
    id: 'a1', sectionId: 't151', subjectId: 'cp1', title: 'Hello, World!',
    language: 'Python', points: 20, allowBlink: true, dueDate: due(-12),
    description: 'Write a program that prints the classic greeting to the console.',
    instructions: '1. Use the print() function.\n2. Match the output exactly, including the comma and exclamation mark.\n3. Submit your code when you are done.',
    starterCode: '# Print the greeting below\n',
    testCases: [{ input: '', expectedOutput: 'Hello, World!' }],
  },
  {
    id: 'a2', sectionId: 't151', subjectId: 'cp1', title: 'Variables & Data Types',
    language: 'Python', points: 20, allowBlink: true, dueDate: due(4),
    description: 'Store a student record in variables, then print each value on its own line.',
    instructions: '1. Create name (text), age (whole number), and average (decimal).\n2. Print name, age, and average on separate lines.\n3. Use the values provided in the starter code.',
    starterCode: 'name = "Ada"\nage = 18\naverage = 92.5\n\n# Print the three values\n',
    testCases: [{ input: '', expectedOutput: 'Ada\n18\n92.5' }],
  },
  {
    id: 'a3', sectionId: 't151', subjectId: 'cp1', title: 'Conditionals: Pass or Fail',
    language: 'Python', points: 25, allowBlink: false, dueDate: due(2),
    description: 'Read an integer grade and print "Pass" if 75 or above, otherwise print "Fail".',
    instructions: '1. Read the grade.\n2. Use an if-else statement.\n3. Print the exact status.',
    starterCode: 'grade = int(input())\n\n# Check pass or fail\n',
    testCases: [
      { input: '82', expectedOutput: 'Pass' },
      { input: '60', expectedOutput: 'Fail' },
      { input: '75', expectedOutput: 'Pass' },
      { type: 'code', check: 'conditional', label: 'Uses if / else' },
    ],
  },
  {
    id: 'a4', sectionId: 't151', subjectId: 'cp1', title: 'Simple Calculator',
    language: 'Python', points: 30, allowBlink: true, dueDate: due(6),
    description: 'Take two numbers and an operator (+, -, *) and print the result.',
    instructions: '1. Read first number, operator, and second number.\n2. Compute result based on the operator.\n3. Print the result.',
    starterCode: 'a = float(input())\nop = input().strip()\nb = float(input())\n\n# Compute and print\n',
    testCases: [
      { input: '2\n+\n3', expectedOutput: '5' },
      { input: '7\n*\n6', expectedOutput: '42' },
      { input: '9\n-\n4', expectedOutput: '5' },
      { type: 'code', check: 'conditional', label: 'Uses if / else' },
    ],
  },
  {
    id: 'b1', sectionId: 't152', subjectId: 'cp2', title: 'Print a Triangle',
    language: 'Python', points: 25, allowBlink: true, dueDate: due(3),
    description: 'Print a right triangle of stars with N rows using nested loops.',
    instructions: 'Read N, then print N rows where row i has i stars.',
    starterCode: 'n = int(input())\n',
    testCases: [
      { input: '3', expectedOutput: '*\n**\n***' },
      { input: '1', expectedOutput: '*' },
      { type: 'code', check: 'nestedLoop', label: 'Uses nested loops' },
    ],
  },
  {
    id: 'b2', sectionId: 't152', subjectId: 'cp2', title: 'Sum of N Numbers (Loops)',
    language: 'Python', points: 30, allowBlink: false, dueDate: due(7),
    description: 'Read a positive integer N and compute the sum of all whole numbers from 1 to N.',
    instructions: '1. Read N from input.\n2. Use a for or while loop to add the numbers.\n3. Do not use the built-in sum() shortcut.\n4. Print the total.',
    starterCode: 'n = int(input())\n\n# Compute the sum with a loop\n',
    testCases: [
      { input: '5', expectedOutput: '15' },
      { input: '1', expectedOutput: '1' },
      { type: 'code', check: 'loop', label: 'Uses a for/while loop' },
      { type: 'code', check: 'noSum', label: 'Avoids built-in sum()' },
    ],
  },
  {
    id: 'c1', sectionId: 't153', subjectId: 'cp3', title: 'Prime Checker',
    language: 'Python', points: 30, allowBlink: true, dueDate: due(5),
    description: 'Determine whether a given integer is prime. Print "Prime" or "Not Prime".',
    instructions: 'A prime is greater than 1 and divisible only by 1 and itself.',
    starterCode: 'n = int(input())\n',
    testCases: [
      { input: '7', expectedOutput: 'Prime' },
      { input: '8', expectedOutput: 'Not Prime' },
      { type: 'code', check: 'loop', label: 'Uses a for/while loop' },
    ],
  },
  {
    id: 'c2', sectionId: 't153', subjectId: 'cp3', title: 'Recursive Fibonacci',
    language: 'Python', points: 40, allowBlink: false, dueDate: due(9),
    description: 'Implement a recursive function that returns the nth Fibonacci number.',
    instructions: '1. Do not use loops.\n2. fib(0) is 0 and fib(1) is 1.\n3. Print fib(n) for the input n.',
    starterCode: 'def fib(n):\n    pass\n\nn = int(input())\n',
    testCases: [
      { input: '0', expectedOutput: '0' },
      { input: '6', expectedOutput: '8' },
      { input: '10', expectedOutput: '55' },
      { type: 'code', check: 'function', label: 'Defines a function' },
      { type: 'code', check: 'recursion', label: 'Uses recursion' },
      { type: 'code', check: 'noLoop', label: 'Avoids loops' },
    ],
  },
  {
    id: 'd1', sectionId: 't154', subjectId: 'cp4', title: 'Build a Student Class',
    language: 'Python', points: 40, allowBlink: true, dueDate: due(1),
    description: 'Create a Student class that stores a name, course, and grade, plus a describe() method.',
    instructions: '1. Add an __init__ that sets name, course, and grade.\n2. Add describe() returning "Name is taking Course with a grade of X".\n3. Create one Student and print its description.',
    starterCode: 'class Student:\n    pass\n',
    testCases: [
      { type: 'code', check: 'class', label: 'Defines a class' },
      { type: 'code', check: 'init', label: 'Defines __init__' },
    ],
  },
  {
    id: 'd2', sectionId: 't154', subjectId: 'cp4', title: 'Bank Account Class',
    language: 'Python', points: 40, allowBlink: true, dueDate: due(8),
    description: 'Create a BankAccount class with deposit() and withdraw() methods and a balance attribute.',
    instructions: 'Withdrawing more than the balance should print "Insufficient funds" and leave the balance unchanged.',
    starterCode: 'class BankAccount:\n    pass\n',
    testCases: [
      { type: 'code', check: 'class', label: 'Defines a class' },
      { type: 'code', check: 'init', label: 'Defines __init__' },
    ],
  },
  {
    id: 'e1', sectionId: 't155', subjectId: 'cp5', title: 'Bubble Sort',
    language: 'Python', points: 40, allowBlink: false, dueDate: due(8),
    description: 'Sort a list of integers using bubble sort and print the sorted list.',
    instructions: 'Do not use the built-in sort(). Print the result separated by spaces.',
    starterCode: 'values = list(map(int, input().split()))\n',
    testCases: [
      { input: '5 3 1 4 2', expectedOutput: '1 2 3 4 5' },
      { input: '2 2 1', expectedOutput: '1 2 2' },
      { type: 'code', check: 'nestedLoop', label: 'Uses nested loops' },
      { type: 'code', check: 'noSort', label: 'Avoids built-in sort()' },
    ],
  },
  {
    id: 'e2', sectionId: 't155', subjectId: 'cp5', title: 'Greeting Program',
    language: 'Python', points: 15, allowBlink: true, dueDate: due(-3),
    description: 'Ask for a name and print a greeting.',
    instructions: 'Print exactly: Hello, <name>!',
    starterCode: 'name = input()\n',
    testCases: [{ input: 'Ada', expectedOutput: 'Hello, Ada!' }],
  },
]

const SUBMISSION_SEED = [
  {
    id: 's1', activityId: 'a1', studentId: 'stu-1', status: 'graded', grade: 95,
    submittedAt: due(-13), feedback: 'Clean and correct. Remember to keep experimenting with print formatting.',
    code: 'print("Hello, World!")\n',
  },
  {
    id: 's3', activityId: 'a4', studentId: 'stu-1', status: 'submitted', grade: null,
    submittedAt: due(-1), feedback: '',
    code: 'values = input().split()\nrev = []\nfor i in range(len(values) - 1, -1, -1):\n    rev.append(values[i])\nprint(" ".join(rev))\n',
  },
]

export function createSeed() {
  return {
    version: 4,
    subjects: SUBJECTS,
    sections: SECTIONS,
    users: [
      INSTRUCTOR,
      ...STUDENT_SEED.map((s) => ({ ...s, role: 'student' })),
    ],
    activities: ACTIVITY_SEED,
    submissions: SUBMISSION_SEED,
  }
}
