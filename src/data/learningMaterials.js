// Sample content only — add another language by adding a key with the same lesson shape.
export const LEARNING_MATERIALS = {
  Python: [
    {
      id: 'py-1',
      title: 'Getting Started with Python',
      summary: 'Write your first program and learn how print() and comments work.',
      minutes: 8,
      objectives: [
        'Run a Python program from top to bottom',
        'Display text and numbers with print()',
        'Use comments to explain your code',
      ],
      paragraphs: [
        'Python runs each line from top to bottom. The print() function displays a value on the screen. Text must be wrapped in quotes, while numbers can be printed as they are.',
        'Comments start with a # and are ignored by Python. Use them to explain why a piece of code exists or to leave notes for yourself.',
      ],
      example: {
        file: 'hello.py',
        code: `# My first Python program
print("Hello, World!")
print("I am learning Python.")
print(42)`,
      },
      tip: 'Each print() call starts a new line. Try changing the text and run it again in the Playground.',
      quiz: [
        {
          question: 'What does this program display?',
          code: 'print("Hello")\nprint(42)',
          options: ['Hello 42', 'Hello\\n42', 'Hello, 42', 'Nothing'],
          answer: 1,
          explanation: 'Each print() call writes its value and then moves to a new line.',
        },
        {
          question: 'Which line is a comment?',
          options: ['# print("Hi")', 'print("#")', '"# print"', '// print("Hi")'],
          answer: 0,
          explanation: 'Python comments begin with #. The other options either print a # or use a comment style from another language.',
        },
      ],
    },
    {
      id: 'py-2',
      title: 'Variables and Data Types',
      summary: 'Store values in variables and choose the right data type for each value.',
      minutes: 10,
      objectives: [
        'Create variables with the = operator',
        'Tell the difference between int, float, str, and bool',
        'Combine values into a readable message with an f-string',
      ],
      paragraphs: [
        'A variable is a name that stores a value. Use = to assign it. Python works out the type from the value: whole numbers are int, decimals are float, text is str, and True/False are bool.',
        'Use clear lowercase names with underscores, such as student_name. An f-string lets you place a variable inside text by adding f before the quotes and putting the variable name in braces.',
      ],
      example: {
        file: 'profile.py',
        code: `name = "Ada"
age = 18
average = 92.5
is_enrolled = True

print(name)
print(age)
print(average)
print(f"{name} is {age} years old.")`,
      },
      tip: 'Print the values separately first, then try an f-string to combine them into one sentence.',
      quiz: [
        {
          question: 'What data type is 92.5?',
          options: ['int', 'float', 'str', 'bool'],
          answer: 1,
          explanation: 'Numbers with a decimal point are floats. Whole numbers such as 18 are ints.',
        },
        {
          question: 'What does this code display?',
          code: 'name = "Ada"\nprint("Hi, " + name)',
          options: ['Hi, Ada', 'Hi, name', 'Hi, "Ada"', 'An error'],
          answer: 0,
          explanation: 'The + operator joins the two strings, so the value stored in name is printed.',
        },
        {
          question: 'Which variable name is valid in Python?',
          options: ['2score', 'student-name', 'student_name', 'class'],
          answer: 2,
          explanation: 'Names can use letters, numbers, and underscores, but cannot start with a number or use a hyphen. class is a reserved keyword.',
        },
      ],
    },
    {
      id: 'py-3',
      title: 'Making Decisions with Conditionals',
      summary: 'Use if, elif, and else so your program can choose between paths.',
      minutes: 10,
      objectives: [
        'Write an if / else statement',
        'Compare values with operators such as >= and !=',
        'Use indentation to define each branch',
      ],
      paragraphs: [
        'Conditionals let a program make a choice. The if block runs when its condition is true; otherwise the else block runs. Use elif when you need to test more than two possibilities.',
        'Indentation marks the block that belongs to each branch, so keep it consistent (four spaces is the usual choice). Common comparisons are == (equal), != (not equal), >, <, >=, and <=.',
      ],
      example: {
        file: 'pass_or_fail.py',
        code: `grade = int(input("Grade: "))

if grade >= 75:
    print("Pass")
else:
    print("Fail")`,
      },
      tip: 'Trace the program with 60 and with 82 to see both branches run.',
      quiz: [
        {
          question: 'What is printed when grade is 60?',
          code: 'grade = 60\n\nif grade >= 75:\n    print("Pass")\nelse:\n    print("Fail")',
          options: ['Pass', 'Fail', 'Nothing', 'An error'],
          answer: 1,
          explanation: '60 is less than 75, so the condition is false and the else block runs.',
        },
        {
          question: 'Which operator means "not equal to"?',
          options: ['==', '=', '!=', '>='],
          answer: 2,
          explanation: '!= checks that two values are different. == checks that they are equal, and = assigns a value.',
        },
      ],
    },
  ],
}
