export interface TutorialLesson {
  id: string;
  title: string;
  eyebrow: string;
  duration: string;
  level: "Beginner" | "Practice" | "Project";
  summary: string;
  code: string[];
  outcomes: string[];
}

export interface TutorialTrack {
  title: string;
  subtitle: string;
  description: string;
  lessons: TutorialLesson[];
}

export const pythonBasicsTrack: TutorialTrack = {
  title: "Python Basics",
  subtitle: "Learn with me",
  description:
    "A course-vlog style path for learning Python from zero: small lessons, notebook-style notes, terminal examples, and tiny projects.",
  lessons: [
    {
      id: "py-001",
      title: "Variables, Types, and Print",
      eyebrow: "Episode 01",
      duration: "12 min",
      level: "Beginner",
      summary: "Start with values, names, strings, numbers, and the habit of printing what your program knows.",
      code: ['name = "Siddharth"', "age = 20", 'print(f"{name} is learning Python")', "print(type(age))"],
      outcomes: ["Create variables", "Use strings and numbers", "Read simple output", "Understand type inspection"],
    },
    {
      id: "py-002",
      title: "If Statements and Decisions",
      eyebrow: "Episode 02",
      duration: "16 min",
      level: "Beginner",
      summary: "Teach your program to choose paths using conditions, comparison operators, and clean indentation.",
      code: ["score = 82", "if score >= 90:", '    print("Excellent")', "elif score >= 60:", '    print("Passed")', "else:", '    print("Try again")'],
      outcomes: ["Write conditions", "Use elif/else", "Avoid indentation mistakes", "Model simple decisions"],
    },
    {
      id: "py-003",
      title: "Loops Without Fear",
      eyebrow: "Episode 03",
      duration: "18 min",
      level: "Practice",
      summary: "Use for-loops and while-loops to repeat work without copying code manually.",
      code: ["tasks = ['read', 'code', 'debug']", "for task in tasks:", '    print("today:", task)', "", "count = 3", "while count > 0:", "    print(count)", "    count -= 1"],
      outcomes: ["Loop through lists", "Use counters safely", "Recognize infinite loops", "Build repetition patterns"],
    },
    {
      id: "py-004",
      title: "Functions as Tiny Machines",
      eyebrow: "Episode 04",
      duration: "20 min",
      level: "Practice",
      summary: "Package logic into reusable functions with inputs, return values, and readable names.",
      code: ["def calculate_average(numbers):", "    total = sum(numbers)", "    return total / len(numbers)", "", "marks = [82, 76, 91]", "print(calculate_average(marks))"],
      outcomes: ["Define functions", "Pass arguments", "Return results", "Refactor repeated code"],
    },
    {
      id: "py-005",
      title: "Mini Project: Study Timer CLI",
      eyebrow: "Episode 05",
      duration: "28 min",
      level: "Project",
      summary: "Bring the basics together by sketching a tiny command-line study timer and task tracker.",
      code: ["tasks = []", 'tasks.append("Python basics")', 'tasks.append("Build CLI timer")', "for index, task in enumerate(tasks, start=1):", "    print(index, task)"],
      outcomes: ["Combine lists and loops", "Design a tiny CLI flow", "Think in user actions", "Prepare for file storage"],
    },
  ],
};
