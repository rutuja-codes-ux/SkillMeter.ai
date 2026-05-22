import os
import json
import google.generativeai as genai

# Setup API Key
API_KEY = os.environ.get("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

def generate_roadmap_ai(goal, skill_level, hours_per_week):
    if not model:
        # Fallback simulator
        return simulate_roadmap(goal, skill_level, hours_per_week)

    prompt = f"""
    Create a comprehensive and structured learning roadmap for: {goal}
    Skill level: {skill_level}
    Available commitment time: {hours_per_week} hours/week

    Provide the output as a valid JSON document matching this exact schema:
    {{
      "title": "roadmap title string",
      "total_weeks": number,
      "phases": [
        {{
          "phase_number": 1,
          "title": "phase title string",
          "description": "what learner will achieve in this phase",
          "subtopics": ["detailed subtopic topic string 1", "detailed subtopic topic string 2"],
          "estimated_hours": number
        }}
      ]
    }}
    
    Ensure you return ONLY the JSON content. Do not wrap in markdown ```json blocks or include any extra text.
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Clean markdown codeblocks if Gemini still outputs them
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini API roadmap call failed, using simulator: {e}")
        return simulate_roadmap(goal, skill_level, hours_per_week)

def generate_notes_ai(topic):
    if not model:
        return simulate_notes(topic)

    prompt = f"""
    Generate highly structured study notes for: {topic}
    Include definitions, core concepts, code examples (if relevant), and a concise summary.
    Format your response as markdown. Keep it engaging, clear, and professional.
    """
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini API notes call failed, using simulator: {e}")
        return simulate_notes(topic)

def generate_quiz_ai(topic):
    if not model:
        return simulate_quiz(topic)

    prompt = f"""
    Generate 5 Multiple Choice Questions (MCQ) for the topic: {topic}.
    Each question must have 4 options and a correct answer index (0-3).
    Return ONLY a valid JSON array matching this exact schema:
    {{
      "topic": "{topic}",
      "questions": [
        {{
          "id": 1,
          "question": "question text",
          "options": ["option 0", "option 1", "option 2", "option 3"],
          "correct_answer": 0
        }}
      ]
    }}
    Ensure you return ONLY the JSON content. Do not wrap in markdown code blocks.
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini API quiz call failed, using simulator: {e}")
        return simulate_quiz(topic)

def generate_interview_questions_ai(topic, difficulty, count=5):
    if not model:
        return simulate_interview_questions(topic, difficulty, count)

    prompt = f"""
    Generate {count} technical interview questions for the topic: {topic} at {difficulty} difficulty level.
    Return ONLY a valid JSON array matching this schema:
    [
      {{
        "id": 1,
        "question": "Question text string"
      }}
    ]
    Ensure you return ONLY the JSON content.
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini API interview questions failed: {e}")
        return simulate_interview_questions(topic, difficulty, count)

def evaluate_interview_answer_ai(question, answer, topic):
    if not model:
        return simulate_interview_evaluation(question, answer, topic)

    prompt = f"""
    Evaluate the following interview answer for the topic: {topic}
    Question: {question}
    Candidate Answer: {answer}

    Provide scores out of 10 for clarity, technical_accuracy, and completeness, as well as a composite overall rating (1-10) and constructed feedback (2-3 sentences).
    Return ONLY a valid JSON object matching this schema:
    {{
      "rating": number,
      "clarity": number,
      "technical_accuracy": number,
      "completeness": number,
      "feedback": "Feedback sentence strings"
    }}
    Ensure you return ONLY the JSON content.
    """
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f"Gemini API evaluation failed: {e}")
        return simulate_interview_evaluation(question, answer, topic)


# --- OFFLINE HIGH-FIDELITY SIMULATORS ---

def simulate_roadmap(goal, skill_level, hours_per_week):
    goal_lower = goal.lower()
    
    # 1. Machine Learning & Data Science / AI
    if any(k in goal_lower for k in ["machine learning", " ml ", "deep learning", "artificial intelligence", "ai", "data science"]):
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Math Foundations & Python Environment Setup",
                    "description": "Establish basic statistical understanding and configure data science libraries.",
                    "subtopics": [
                        f"Linear algebra and statistics for {goal}",
                        "Python environment setup with Anaconda and Jupyter",
                        "Data manipulation with NumPy and Pandas"
                    ],
                    "estimated_hours": 6
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Supervised Learning & Regression Models",
                    "description": "Understand core machine learning pipelines, feature engineering, and regression analysis.",
                    "subtopics": [
                        f"Supervised learning algorithms in {goal}",
                        "Linear and logistic regression models",
                        "Scikit-learn tutorial and model validation"
                    ],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Deep Learning & Neural Networks",
                    "description": "Introduction to multi-layer perceptrons, convolutional networks, and deep frameworks.",
                    "subtopics": [
                        f"Neural networks fundamentals for {goal}",
                        "TensorFlow and PyTorch crash course",
                        "Training and optimizing deep learning models"
                    ],
                    "estimated_hours": 10
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Model Deployment & Production Pipelines",
                    "description": "Export models and serve them via APIs for applications.",
                    "subtopics": [
                        f"Saving and loading serialized {goal} models",
                        "Building API endpoints using FastAPI for ML inference",
                        "Monitoring and scaling production AI systems"
                    ],
                    "estimated_hours": 6
                }
            ]
        }
        
    # 2. Python Programming
    elif "python" in goal_lower:
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Python Basics & Syntax Foundations",
                    "description": "Set up Python and learn the fundamentals of syntax, types, and variables.",
                    "subtopics": [
                        "Python installation and IDE configuration (VS Code)",
                        "Variables, basic data types, and operators",
                        "Control flows, loops, and conditional statements"
                    ],
                    "estimated_hours": 4
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Data Structures & Functions",
                    "description": "Master built-in collections and write reusable code structures.",
                    "subtopics": [
                        "Lists, dictionaries, tuples, and sets in Python",
                        "Defining functions, scope, and arguments",
                        "Standard library modules and package import guides"
                    ],
                    "estimated_hours": 6
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Object-Oriented Programming (OOP)",
                    "description": "Understand OOP principles, class structures, inheritance, and exception handling.",
                    "subtopics": [
                        "Classes, objects, attributes, and methods in Python",
                        "Inheritance, polymorphism, and encapsulation",
                        "Exception handling and file read/write operations"
                    ],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Advanced Python & Best Practices",
                    "description": "Leverage professional Python features like decorators, generators, and testing.",
                    "subtopics": [
                        "Decorators, generators, and list comprehensions",
                        "Writing unit tests with pytest",
                        "Publishing packages and code styling conventions"
                    ],
                    "estimated_hours": 6
                }
            ]
        }
        
    # 3. Data Structures & Algorithms (DSA)
    elif any(k in goal_lower for k in ["structure", "algorithm", "dsa", "leetcode"]):
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Complexity Analysis & Linear Data Structures",
                    "description": "Analyze performance bounds and master simple linear containers.",
                    "subtopics": [
                        "Big O notation and time complexity analysis",
                        "Arrays and dynamic lists implementations",
                        "Linked lists, stacks, and queues structures"
                    ],
                    "estimated_hours": 6
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Non-Linear Data Structures & Recursion",
                    "description": "Understand trees, hashes, and recursive solutions.",
                    "subtopics": [
                        "Recursion basics and call stack execution",
                        "Binary trees, BST traversal, and heaps",
                        "Hash tables and hash map design"
                    ],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Graph Algorithms & Dynamic Search",
                    "description": "Learn to traverse graphs and locate objects efficiently.",
                    "subtopics": [
                        "Graph representations, BFS, and DFS",
                        "Shortest path algorithms (Dijkstra)",
                        "Sorting and searching algorithms complexity"
                    ],
                    "estimated_hours": 9
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Advanced Algorithmic Paradigms",
                    "description": "Analyze complex patterns like dynamic programming and greedy strategies.",
                    "subtopics": [
                        "Dynamic programming foundations and memoization",
                        "Greedy algorithms and divide-and-conquer",
                        "Solving popular interview challenges (LeetCode patterns)"
                    ],
                    "estimated_hours": 7
                }
            ]
        }

    # 4. DevOps & Cloud
    elif any(k in goal_lower for k in ["docker", "devops", "kubernetes", "aws", "gcp", "cloud", "jenkins", "cicd"]):
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Linux Administration & Version Control",
                    "description": "Establish command line proficiency and configure version repository storage.",
                    "subtopics": [
                        "Linux terminal bash commands and shell scripts",
                        "Git command line workflows and branching",
                        "SSH setup and remote server configuration"
                    ],
                    "estimated_hours": 5
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Docker Containers & Virtualization",
                    "description": "Build, run, and scale virtual sandbox environments using Docker.",
                    "subtopics": [
                        "Docker containers, images, and Dockerfiles",
                        "Docker volumes and network configurations",
                        "Docker compose for multi-container deployments"
                    ],
                    "estimated_hours": 7
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: CI/CD Pipelines & Orchestration",
                    "description": "Automate tests and coordinate container clusters.",
                    "subtopics": [
                        "Building CI/CD pipelines with GitHub Actions or Jenkins",
                        "Kubernetes architecture and cluster components",
                        "Deploying applications to Kubernetes pods"
                    ],
                    "estimated_hours": 9
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Cloud Infrastructure & Monitoring",
                    "description": "Host production bundles and configure operational charts.",
                    "subtopics": [
                        "Terraform infrastructure as code setup",
                        "Hosting services on cloud providers (AWS EC2 / S3)",
                        "Monitoring with Prometheus and Grafana dashboards"
                    ],
                    "estimated_hours": 6
                }
            ]
        }

    # 5. Golang / Go
    elif "golang" in goal_lower or " go " in " " + goal_lower + " ":
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Go Fundamentals & Environment Setup",
                    "description": "Configure the Go compiler workspace and learn variables, syntax, and basic flows.",
                    "subtopics": [
                        "Installing Go and setting up visual workspace environment",
                        "Variables, types, and control flows in Go",
                        "Arrays, slices, and maps basic structures"
                    ],
                    "estimated_hours": 5
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Pointers, Structs & Interfaces",
                    "description": "Master pointer arithmetic safety, define compound structs, and write interfaces.",
                    "subtopics": [
                        "Pointers and memory allocation in Go",
                        "Structs, methods, and composition patterns",
                        "Interfaces and custom type systems implementation"
                    ],
                    "estimated_hours": 7
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Goroutines & Concurrency Patterns",
                    "description": "Dive deep into Go channels and asynchronous worker pools.",
                    "subtopics": [
                        "Goroutines execution and channel message pipes",
                        "Mutex locks and select controls",
                        "Concurrency design patterns in Go applications"
                    ],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Web Servers & API Deployment",
                    "description": "Construct JSON HTTP handlers and deploy compiled binary outputs.",
                    "subtopics": [
                        "Writing HTTP API servers with net/http",
                        "Database drivers and ORM (Gorm) integration",
                        "Building and deploying Go binary packages"
                    ],
                    "estimated_hours": 6
                }
            ]
        }

    # 6. Web Development (Original template, perfect for Web/React/HTML/Django/etc.)
    elif any(k in goal_lower for k in ["web", "react", "html", "css", "js", "javascript", "node", "django", "frontend", "backend", "fullstack", "full stack"]):
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Foundations & Core Concepts",
                    "description": f"Understand the core elements, environment setup, and fundamental concepts of {goal}.",
                    "subtopics": [f"{goal} Introduction & Environment Setup", f"Core syntax & variables in {goal}", f"Control flows & fundamental logic"],
                    "estimated_hours": 4
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Intermediate Architecture",
                    "description": f"Dive deep into patterns, modular file setups, and external API connectors.",
                    "subtopics": [f"Structuring components in {goal}", f"State management & routing controls", f"Connecting third-party APIs"],
                    "estimated_hours": 6
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Database & Testing",
                    "description": f"Integrate database repositories, write schemas, and construct tests.",
                    "subtopics": [f"Persistent database schemas for {goal}", f"Writing tests & mock coverage modules", f"Async processing & background queues"],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Deployment & Scaling",
                    "description": f"Deploy codebases to production and verify efficiency loads.",
                    "subtopics": [f"Building & optimizing build output", f"Hosting setup on public cloud infrastructures", f"Security hardening and CORS setup"],
                    "estimated_hours": 5
                }
            ]
        }

    # 7. General / Catch-All Template (Truly Topic-Agnostic)
    else:
        return {
            "title": f"Mastering {goal} ({skill_level.capitalize()})",
            "total_weeks": 4,
            "phases": [
                {
                    "phase_number": 1,
                    "title": "Phase 1: Core Fundamentals & Concept Introduction",
                    "description": f"Introduce key theories, terminologies, and baseline environments for {goal}.",
                    "subtopics": [
                        f"Overview of basic principles in {goal}",
                        f"Required software tools and configuration steps for {goal}",
                        f"Fundamental syntax and terminology for {goal}"
                    ],
                    "estimated_hours": 5
                },
                {
                    "phase_number": 2,
                    "title": "Phase 2: Implementation Patterns & Intermediate Practice",
                    "description": f"Master structure architectures and basic workflows in {goal}.",
                    "subtopics": [
                        f"Structural layout and patterns in {goal}",
                        f"Designing core reusable modules for {goal}",
                        f"Practical execution workflows and code patterns for {goal}"
                    ],
                    "estimated_hours": 7
                },
                {
                    "phase_number": 3,
                    "title": "Phase 3: Testing, Debugging & Integration",
                    "description": f"Identify error conditions, structure tests, and connect external modules.",
                    "subtopics": [
                        f"Best practices for debugging issues in {goal}",
                        f"Writing standard automated test suites for {goal}",
                        f"Integrating third-party integrations and storage with {goal}"
                    ],
                    "estimated_hours": 8
                },
                {
                    "phase_number": 4,
                    "title": "Phase 4: Optimization, Performance & Capstone",
                    "description": f"Deliver and compile performance-optimized profiles for production release.",
                    "subtopics": [
                        f"Speed optimizations and resource profiling in {goal}",
                        f"Hosting and publication setups for {goal}",
                        f"Final comprehensive capstone application for {goal}"
                    ],
                    "estimated_hours": 6
                }
            ]
        }

def simulate_notes(topic):
    topic_lower = topic.lower()
    
    # 1. Web Development & React / Frontend
    if any(k in topic_lower for k in ["web", "react", "html", "css", "js", "javascript", "node", "django", "frontend", "backend", "fullstack", "component", "state", "routing", "cors"]):
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest covering the definitions, concepts, implementation models, and scalability guidelines for modern web development.

---

## 1. Key Definitions
* **Component Model**: The foundational building block in modern declarative frontends. Components are self-contained, reusable units of user interface that manage their own state and render dynamic HTML.
* **Virtual DOM**: A lightweight, in-memory representation of the real DOM. Frameworks like React use it to compute minimal diffs before updating the browser screen.
* **State vs Props**: *State* represents the internal, mutable data owned and managed by a component. *Props* (properties) are read-only inputs passed down from parent to child components.

---

## 2. Core Concepts
### A. Unidirectional Data Flow
Modern web frameworks enforce a strict one-way data flow. Data flows down from parent components to children via props, while event notifications flow up via callback functions. This design makes state changes predictable and easier to debug.

### B. Hook Architecture
Hooks (introduced in React 16.8) allow functional components to utilize stateful logic and manage side effects without writing class declarations:
1. **useState**: Declares a local state variable and an updater function.
2. **useEffect**: Handles side-effects like data fetching, manual DOM updates, and subscriptions.
3. **useContext**: Subscribes to a shared context provider to avoid prop-drilling.

---

## 3. Code Example (React Component Pattern)
```javascript
import React, {{ useState, useEffect }} from 'react';

// A dynamic card component managing counters
export default function InteractiveCard({{ title }}) {{
  const [count, setCount] = useState(0);

  useEffect(() => {{
    console.log(`[${{title}}] Counter updated to: ${{count}}`);
  }}, [count]);

  return (
    <div style={{{{ border: '1px solid black', padding: '16px', margin: '8px' }}}}>
      <h3>{{title}}</h3>
      <p>Clicked: {{count}} times</p>
      <button onClick={{() => setCount(count + 1)}}>
        Increment Counter
      </button>
    </div>
  );
}}
```

---

## 4. Summary
Mastering component architecture and declarative state management is critical for building responsive, pixel-perfect user interfaces. Prioritize modular props design and avoid unnecessary re-renders by keeping state close to where it is used.
"""

    # 2. Python Programming
    elif "python" in topic_lower:
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest of Python fundamentals, design patterns, and programming best practices.

---

## 1. Key Definitions
* **Dynamic Typing**: A runtime system characteristic where variable names are bound to objects, not to rigid type declarations. This offers immense flexibility while requiring robust unit test coverage.
* **List Comprehensions**: A highly optimized, syntactic shorthand for generating lists based on existing iterables (e.g. `[x**2 for x in range(5)]`).
* **Object-Oriented Programming (OOP)**: A paradigm centered around *classes* and *objects*, supporting *Inheritance*, *Encapsulation*, *Polymorphism*, and *Abstraction*.

---

## 2. Core Concepts
### A. The Python Execution Model
1. **Compilation**: Python source code (`.py`) is compiled down into binary *bytecode* (`.pyc`).
2. **Virtual Machine**: The Python Virtual Machine (PVM) reads and executes the compiled bytecode instructions.
3. **Memory Management**: Handled automatically via reference counting and a generational garbage collector.

### B. OOP Principles
* **Inheritance**: Allows a child class to inherit attributes and methods from a parent class.
* **Encapsulation**: Restricts direct access to an object's internal state (e.g., using private attributes prefixed with double underscores `__`).
* **Polymorphism**: Enables different classes to implement identical method signatures (interfaces) with customized behaviors.

---

## 3. Code Example (Object-Oriented Python)
```python
class Animal:
    def __init__(self, name):
        self.name = name
        
    def speak(self):
        raise NotImplementedError("Subclasses must implement speak method")

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)
        self.breed = breed
        
    def speak(self):
        return f"{{self.name}} the {{self.breed}} says Woof!"

# Create instance
my_dog = Dog("Rex", "German Shepherd")
print(my_dog.speak())
```

---

## 4. Summary
Python provides developer velocity and readability. Focus on standard OOP modeling patterns, proper exception handlers, and the Zen of Python ("Simple is better than complex") to write robust, maintainable backend codebases.
"""

    # 3. Machine Learning & AI
    elif any(k in topic_lower for k in ["machine learning", " ml ", "deep learning", "artificial intelligence", "ai", "data science", "regression", "neural", "supervised"]):
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest covering supervised learning paradigms, deep neural networks, and model deployment pipelines.

---

## 1. Key Definitions
* **Supervised Learning**: Training a model on a labeled dataset (containing inputs and target outputs) so it learns to predict mappings for unseen test samples.
* **Loss Function**: A mathematical metric that calculates the error distance between the model's predictions and actual ground truth (e.g., Mean Squared Error or Binary Cross-Entropy).
* **Overfitting**: A common learning trap where the model memorizes noise patterns from the training dataset, resulting in high training scores but failing to generalize on test datasets.

---

## 2. Core Concepts
### A. Model Evaluation Strategy
1. **Training Set**: Used by the backpropagation loop to adjust and optimize the model weights.
2. **Validation Set**: Used during the optimization process to tune hyperparameters and monitor overfitting.
3. **Test Set**: An isolated holdout set used for final performance evaluation.

### B. Neural Networks Architecture
Deep learning pipelines utilize artificial layers of neurons connected by trainable weights:
* **Activation Function**: Introduces non-linearity (e.g., ReLU or Sigmoid) so the network can fit complex boundaries.
* **Backpropagation**: An algorithmic implementation of the chain rule that propagates the error gradient backward through the network to update weights via Gradient Descent.

---

## 3. Code Example (Model Definition with PyTorch)
```python
import torch
import torch.nn as nn

# Constructing a dynamic Multi-Layer Perceptron
class SimpleClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(SimpleClassifier, self).__init__()
        self.layer1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.layer2 = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        out = self.layer1(x)
        out = self.relu(out)
        out = self.layer2(out)
        return out

# Instantiating model
model = SimpleClassifier(input_dim=10, hidden_dim=32, output_dim=1)
print(model)
```

---

## 4. Summary
Mastering Machine Learning demands clean data preprocessing, thoughtful model selections, and rigorous validation bounds. Keep features normalized, combat overfitting with regularization (L1/L2 or dropout), and serve models using lightweight REST APIs.
"""

    # 4. Data Structures & Algorithms
    elif any(k in topic_lower for k in ["structure", "algorithm", "dsa", "leetcode", "tree", "graph", "search", "sort"]):
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest covering complexity bounds, linear/non-linear data containers, and routing search algorithms.

---

## 1. Key Definitions
* **Big O Notation**: A mathematical classification that bounds the worst-case asymptotic time or space complexity of an algorithm as the input size $n$ grows.
* **Balanced Binary Search Tree**: A hierarchical structure where every node has at most two children, maintaining a logarithmic search bound ($O(\\log n)$) by keeping subtree height differences minimal.
* **Stack (LIFO) & Queue (FIFO)**: Stack operates on a *Last-In, First-Out* model (like call stack execution); Queue operates on a *First-In, First-Out* sequence (like background job runners).

---

## 2. Core Concepts
### A. Algorithmic Paradigms
1. **Recursion**: A problem-solving strategy where a function resolves a complex problem by invoking itself with smaller sub-instances, terminating at a defined *base case*.
2. **Dynamic Programming**: An optimization technique that avoids redundant calculations by breaking problems into overlapping subproblems, storing results in memoization arrays.
3. **Greedy Strategy**: Makes the locally optimal decision at each step, hoping it leads to a global optimum.

### B. Graph Traversal Algorithms
* **Breadth-First Search (BFS)**: Uses a Queue to traverse a graph level-by-level, optimized for finding the shortest path on unweighted grids.
* **Depth-First Search (DFS)**: Uses a Stack (or recursion call stack) to plunge along each branch as deep as possible before backtracking.

---

## 3. Code Example (Binary Search Implementation)
```python
def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1 # Target not located

# Execute search on a sorted collection
data = [1, 3, 5, 7, 9, 11]
idx = binary_search(data, 7)
print(f"Target found at index: {{idx}}")
```

---

## 4. Summary
Mastering DSA lies in knowing when to utilize specialized data layouts. Hash maps offer lightning-fast $O(1)$ lookup times at the expense of extra memory, whereas trees and heaps manage sorted streams efficiently. Prioritize rigorous time/space optimization.
"""

    # 5. DevOps & Cloud
    elif any(k in topic_lower for k in ["docker", "devops", "kubernetes", "aws", "gcp", "cloud", "jenkins", "cicd", "pipeline"]):
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest of virtualization sandboxes, automated testing pipelines, and infrastructure scaling methods.

---

## 1. Key Definitions
* **Containerization**: An operating system-level virtualization method that packages an application and its dependencies into a lightweight container image that runs isolated on a shared OS kernel.
* **Continuous Integration (CI)**: The development practice of automating the build and test suites every time code updates are pushed to a central repository.
* **Infrastructure as Code (IaC)**: The process of provisioning and managing cloud infrastructure using machine-readable configuration files (e.g. Terraform).

---

## 2. Core Concepts
### A. Virtualization vs Containerization
* **Virtual Machines**: Emulate a full guest operating system on top of a hypervisor, resulting in high resource overhead and slower launch intervals.
* **Docker Containers**: Share the host operating system kernel, making them lightweight, extremely fast to spin up, and highly portable across host servers.

### B. Kubernetes Cluster Architecture
A production container orchestrator that automates deployment, scaling, and operational tasks:
1. **Pod**: The smallest deployable computing unit, wrapping one or more isolated Docker containers.
2. **Node**: A physical or virtual worker machine inside the cluster.
3. **Deployment**: Manages the desired state of Pods, enabling seamless rolling updates and scaling limits.

---

## 3. Code Example (Minimal Dockerfile definition)
```dockerfile
# Select lightweight base image
FROM python:3.10-slim

# Establish workspace
WORKDIR /app

# Copy lockfiles and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bundle application source files
COPY . .

# Expose port and configure entry runtime command
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 4. Summary
Adopting DevOps practices ensures software reliability and swift deployment timelines. Enforce automated tests in CI pipelines, encapsulate configurations within Docker containers, and leverage Kubernetes to scale server operations.
"""

    # 6. SQL & Database Systems
    elif any(k in topic_lower for k in ["sql", "database", "db", "schemas", "sqlite"]):
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest covering relational schemas, query structures, indexing optimization, and transaction safety.

---

## 1. Key Definitions
* **Relational Schema**: The formal structure and organization of a database, defining tables, column types, and relational constraints (e.g., Primary Keys and Foreign Keys).
* **ACID Transactions**: A set of properties that guarantee database transactions are processed reliably:
  1. *Atomicity*: All operations in the transaction succeed, or all fail together.
  2. *Consistency*: Transactions bring the database from one valid state to another.
  3. *Isolation*: Transactions execute concurrently without interfering.
  4. *Durability*: Committed changes survive system crashes.
* **Database Index**: A specialized data structure (usually a B-Tree) that speeds up data retrieval operations on a table at the cost of additional write overhead and memory.
---

## 2. Core Concepts
### A. Joins and Relations
Relational systems connect discrete tables based on foreign key relationships:
* **INNER JOIN**: Returns records that have matching values in both tables.
* **LEFT JOIN**: Returns all records from the left table, and matching records from the right.
* **One-to-Many vs Many-to-Many**: One-to-many models use foreign key columns; many-to-many models resolve dependencies using intermediate *join tables*.

### B. Query Performance Optimization
* **Index Selectivity**: Index columns frequently queried in `WHERE` and `JOIN` clauses.
* **Execution Plans**: Use `EXPLAIN QUERY PLAN` to analyze if the query utilizes index trees or triggers costly full-table scans.

---

## 3. Code Example (SQL Schema & Query)
```sql
-- Design user profile database schema
CREATE TABLE IF NOT EXISTS UserProfile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    xp_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fetch top learners with high XP scores
SELECT name, xp_points 
FROM UserProfile 
WHERE xp_points > 1000 
ORDER BY xp_points DESC 
LIMIT 5;
```

---

## 4. Summary
Relational databases provide strong consistency boundaries and robust querying power. Model tables with appropriate normalization, write precise JOIN queries, and maintain clean index arrays to keep request times under 50 milliseconds.
"""

    # 7. General Computer Science (Topic-Agnostic)
    else:
        return f"""# Study Notes: {topic}

Welcome to the AI-generated study notes for **{topic}**. Below is a comprehensive digest covering definitions, core concepts, implementation guidelines, and optimization best practices.

---

## 1. Key Definitions
* **{topic} Engine**: The primary coordination layer that manages active executions and data streams.
* **Structural Declarative Logic**: The core model pattern that maps system inputs to desired outputs.
* **Efficiency Optimization**: Minimizes resource overhead, ensuring minimal memory bounds and quick request loops.

---

## 2. Core Concepts
### A. Architectural Workflow
1. **Initialize**: Sets defaults, reads environment flags, and pre-connects client layers.
2. **Process**: Compiles inputs, maps templates, and coordinates active parameters.
3. **Execute**: Listens for user commands, event triggers, or background jobs.
4. **Finalize & Flush**: Disconnects socket streams, flushes caches, and records logs.

### B. Performance Best Practices
* **Keep Objects Shallow**: Avoid deep structures to keep computational loops simple.
* **Avoid Polling**: Prefer real-time push streams over periodic query loops.

---

## 3. Code Example (Declarative Pattern)
```python
# Implementing a standard controller pattern for {topic}
class SystemController:
    def __init__(self, debug=True):
        self.state = "idle"
        self.debug = debug
        print(f"[{topic}] Initializing core module...")

    def update_state(self, new_state):
        self.state = new_state
        if self.debug:
            print(f"[{topic}] State transitioned to: {{self.state}}")

# Instantiating the controller
processor = SystemController(debug=True)
processor.update_state("processing")
```

---

## 4. Summary
Mastering **{topic}** is critical for constructing scalable, modern engineering pipelines. Focus on clear interface separations, strict time/space resource optimization, and thorough automated test suites to build reliable applications.
"""


def simulate_quiz(topic):
    topic_lower = topic.lower()
    
    # 1. Machine Learning & AI
    if any(k in topic_lower for k in ["machine learning", " ml ", "deep learning", "artificial intelligence", "ai", "data science", "regression", "neural", "supervised"]):
        questions = [
            {
                "id": 1,
                "question": f"What is the primary purpose of a validation dataset when training models for {topic}?",
                "options": [
                    "To directly optimize model parameters and weights",
                    "To tune hyperparameters and detect potential overfitting",
                    "To perform final out-of-sample test scoring",
                    "To double the size of the training set"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"Which loss function is most commonly used for binary classification in {topic} pipelines?",
                "options": [
                    "Mean Squared Error (MSE)",
                    "Cross-Entropy Loss (Log Loss)",
                    "Mean Absolute Error (MAE)",
                    "Huber Loss"
                ],
                "correct_answer": 1
            },
            {
                "id": 3,
                "question": f"What does the term 'gradient descent' describe in {topic} models?",
                "options": [
                    "An optimization algorithm to minimize loss by stepping down the gradient",
                    "A method to automatically increase the model learning rate",
                    "The process of cleaning missing values from datasets",
                    "A visualization representing high-dimensional neural weights"
                ],
                "correct_answer": 0
            },
            {
                "id": 4,
                "question": f"What occurs when a {topic} model overfits its training dataset?",
                "options": [
                    "It performs exceptionally well on both training and test data",
                    "It memorizes training noise and fails to generalize to unseen data",
                    "It fails to capture the underlying pattern of both datasets",
                    "The training time decreases to zero instantly"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"In neural networks applied to {topic}, what is the role of an activation function?",
                "options": [
                    "To compute loss gradients across the network layer",
                    "To introduce non-linearity, allowing the network to learn complex patterns",
                    "To normalize weight vectors to a zero-mean distribution",
                    "To scale learning rate decay dynamically"
                ],
                "correct_answer": 1
            }
        ]
    
    # 2. Python Programming
    elif "python" in topic_lower:
        questions = [
            {
                "id": 1,
                "question": f"Which of the following is a key difference between a Python list and a tuple in {topic} contexts?",
                "options": [
                    "Lists are mutable, whereas tuples are immutable and fixed-size",
                    "Tuples are mutable, whereas lists are immutable",
                    "Lists can only contain homogeneous elements of a single type",
                    "Tuples cannot be indexed or sliced"
                ],
                "correct_answer": 0
            },
            {
                "id": 2,
                "question": f"In Python {topic} code, what does the expression `[x**2 for x in range(3)]` evaluate to?",
                "options": [
                    "[0, 1, 4]",
                    "[1, 4, 9]",
                    "[0, 1, 2]",
                    "[1, 2, 3]"
                ],
                "correct_answer": 0
            },
            {
                "id": 3,
                "question": f"Which keyword facilitates clean resource management (e.g. closing files) in {topic} scripts?",
                "options": [
                    "try/except",
                    "with",
                    "finally",
                    "lambda"
                ],
                "correct_answer": 1
            },
            {
                "id": 4,
                "question": f"How do you define a private instance attribute in a {topic} Python class?",
                "options": [
                    "Prefix the attribute name with double underscores (e.g. __value)",
                    "Prepend the 'private' keyword to the declaration",
                    "Suffix the attribute name with an exclamation mark (e.g. value!)",
                    "Use the @private decorator above the attribute"
                ],
                "correct_answer": 0
            },
            {
                "id": 5,
                "question": f"What is the primary role of the `__init__` constructor method in {topic} objects?",
                "options": [
                    "To clean up garbage-collected instances and free memory",
                    "To initialize class instance attributes upon object instantiation",
                    "To compile class syntax into bytecode representations",
                    "To output formatted debugging representations to standard output"
                ],
                "correct_answer": 1
            }
        ]
        
    # 3. Data Structures & Algorithms
    elif any(k in topic_lower for k in ["structure", "algorithm", "dsa", "leetcode", "tree", "graph", "search", "sort"]):
        questions = [
            {
                "id": 1,
                "question": f"What is the average-case time complexity of searching in a balanced Binary Search Tree for {topic}?",
                "options": [
                    "O(1)",
                    "O(log n)",
                    "O(n)",
                    "O(n log n)"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"Which fundamental data structure operates on a Last-In, First-Out (LIFO) model in {topic}?",
                "options": [
                    "Queue",
                    "Stack",
                    "Heap",
                    "Hash Map"
                ],
                "correct_answer": 1
            },
            {
                "id": 3,
                "question": f"What is a key benefit of a Hash Table over a Linked List in {topic} implementations?",
                "options": [
                    "It maintains insertion-order iteration",
                    "It utilizes minimal memory overhead",
                    "It offers O(1) average time complexity for insertions and lookups",
                    "It guarantees O(log n) worst-case time complexity for operations"
                ],
                "correct_answer": 2
            },
            {
                "id": 4,
                "question": f"Which graph search algorithm is optimized for locating shortest paths under weighted non-negative edges in {topic}?",
                "options": [
                    "Kruskal's Minimum Spanning Tree",
                    "Dijkstra's Algorithm",
                    "Bellman-Ford Dynamic Solver",
                    "Depth-First Search (DFS)"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"What does Big O notation represent in {topic} algorithmic performance profiling?",
                "options": [
                    "The exact execution duration of a routine in milliseconds",
                    "The worst-case mathematical bounds on runtime or space usage",
                    "The size of physical memory allocations",
                    "The compiler optimization level"
                ],
                "correct_answer": 1
            }
        ]
        
    # 4. DevOps & Cloud
    elif any(k in topic_lower for k in ["docker", "devops", "kubernetes", "aws", "gcp", "cloud", "jenkins", "cicd", "pipeline"]):
        questions = [
            {
                "id": 1,
                "question": f"What is a primary benefit of containerizing a {topic} service using Docker?",
                "options": [
                    "It automatically converts source scripts into assembly files",
                    "It encapsulates application code and dependencies in isolated, reproducible sandboxes",
                    "It completely eliminates the need for database storage layers",
                    "It bypasses all cloud network firewall rules by default"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"In a Kubernetes orchestration workflow for {topic}, what is a Pod?",
                "options": [
                    "The smallest deployable unit representing a single instance of a running process",
                    "A physical host machine located inside the cloud datacenter",
                    "A private virtual network routing table",
                    "A containerized registry repository"
                ],
                "correct_answer": 0
            },
            {
                "id": 3,
                "question": f"In CI/CD pipelines configured for {topic}, what does the 'CI' component signify?",
                "options": [
                    "Cloud Infrastructure",
                    "Continuous Integration",
                    "Compilation Instance",
                    "Containerized Interface"
                ],
                "correct_answer": 1
            },
            {
                "id": 4,
                "question": f"Which of the following describes the category and purpose of Terraform in {topic} setups?",
                "options": [
                    "An automated unit testing framework",
                    "An Infrastructure as Code (IaC) tool for provisioning servers and services",
                    "A container visualization and profiling dashboard",
                    "A low-latency message broker"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"What is the primary role of a load balancer within {topic} cloud topologies?",
                "options": [
                    "To distribute incoming network traffic across multiple nodes to maximize availability",
                    "To compress static media assets on disk",
                    "To encrypt backend tables using asymmetric keys",
                    "To compile dynamic client-side stylesheets"
                ],
                "correct_answer": 0
            }
        ]
        
    # 5. Golang / Go
    elif "golang" in topic_lower or " go " in " " + topic_lower + " " or "goroutine" in topic_lower:
        questions = [
            {
                "id": 1,
                "question": f"How do you spawn a concurrent thread of execution (Goroutine) in Go for {topic}?",
                "options": [
                    "Using the 'thread' keyword",
                    "Using the 'go' keyword prior to invoking a target function",
                    "Using the 'async' keyword decorator",
                    "Instantiating the sync.Goroutine factory class"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"What is the function of a channel in a concurrent Go implementation for {topic}?",
                "options": [
                    "A message pipe that connects goroutines, facilitating synchronized communication",
                    "An open socket connection to a backing relational database",
                    "A routing path matching pattern inside HTTP web servers",
                    "An array index pointer"
                ],
                "correct_answer": 0
            },
            {
                "id": 3,
                "question": f"In Go {topic} code, what is a key distinction between Go arrays and slices?",
                "options": [
                    "Slices are fixed-size structures, whereas arrays are dynamically resizable",
                    "Arrays are fixed-size at compile time; slices are dynamically sized wrappers over arrays",
                    "Slices can only accommodate elements of type float or int",
                    "Arrays do not utilize stack allocations"
                ],
                "correct_answer": 1
            },
            {
                "id": 4,
                "question": f"What is the default value of an uninitialized pointer variable in Go {topic} scripts?",
                "options": [
                    "void",
                    "nil",
                    "0",
                    "undefined"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"How does Go handle runtime execution failures or error states in {topic} packages?",
                "options": [
                    "By wrapping code inside try-catch-finally block scopes",
                    "By returning errors as normal, explicit values from functions that callers must check",
                    "By using standard 'raise' and 'throw' syntax keywords",
                    "By ignoring errors unless marked with throws annotations"
                ],
                "correct_answer": 1
            }
        ]
        
    # 6. Web Development / React / Django / API
    elif any(k in topic_lower for k in ["web", "react", "html", "css", "js", "javascript", "node", "django", "frontend", "backend", "fullstack", "api", "route", "http"]):
        questions = [
            {
                "id": 1,
                "question": f"In a React functional component designed for {topic}, what does the `useEffect` hook facilitate?",
                "options": [
                    "Executing state transitions synchronously during the draw loop",
                    "Executing side effects (e.g. data fetching, event listeners) cleanly",
                    "Parsing global CSS stylesheet layouts on screen",
                    "Managing local component variables without causing re-renders"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"What is the primary role of middleware components in web frameworks like Django for {topic}?",
                "options": [
                    "To generate static database tables and relations",
                    "To inspect, filter, or alter requests and responses globally before they reach a view or client",
                    "To compile templates into browser-executable JS bundles",
                    "To restrict physical ports on host servers"
                ],
                "correct_answer": 1
            },
            {
                "id": 3,
                "question": f"Which HTTP status code denotes the successful creation of a resource on a {topic} API server?",
                "options": [
                    "200 OK",
                    "201 Created",
                    "301 Moved Permanently",
                    "400 Bad Request"
                ],
                "correct_answer": 1
            },
            {
                "id": 4,
                "question": f"In modern {topic} architectures, how does Server-Side Rendering (SSR) differ from Client-Side Rendering (CSR)?",
                "options": [
                    "CSR sends fully composed HTML from servers; SSR compiles elements client-side",
                    "SSR pre-renders and delivers full HTML from servers; CSR renders layouts in browsers via JS",
                    "SSR only operates against embedded flat-file datasets",
                    "CSR disables browser networking behaviors entirely"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"What represents the primary objective of a CORS (Cross-Origin Resource Sharing) policy in {topic} systems?",
                "options": [
                    "A browser security feature that restricts cross-origin HTTP requests originating from scripts",
                    "A data compression standard designed for image assets",
                    "A database replication and synchronization mechanism",
                    "A hashing scheme for securing session credentials"
                ],
                "correct_answer": 0
            }
        ]
        
    # 7. General Catch-All
    else:
        questions = [
            {
                "id": 1,
                "question": f"Which core principle does the acronym DRY represent in software engineering applied to {topic}?",
                "options": [
                    "Do Repeat Yourself",
                    "Don't Repeat Yourself (keep code modular and non-redundant)",
                    "Double Resource Yield",
                    "Deploy Ready Yield"
                ],
                "correct_answer": 1
            },
            {
                "id": 2,
                "question": f"What is a defining attribute of a stateless RESTful API design for {topic}?",
                "options": [
                    "It relies on permanent session storage on the server",
                    "Each request must contain all the information necessary to process it, independent of prior calls",
                    "It requires using a custom binary socket format instead of standard HTTP",
                    "It only accepts data formatted in heavy XML structures"
                ],
                "correct_answer": 1
            },
            {
                "id": 3,
                "question": f"Which git command merges commits from one local branch to the active branch for {topic}?",
                "options": [
                    "git push",
                    "git merge",
                    "git clone",
                    "git commit"
                ],
                "correct_answer": 1
            },
            {
                "id": 4,
                "question": f"What represents the primary objective of writing isolated Unit Tests in {topic} projects?",
                "options": [
                    "To test the full system integration flow end-to-end",
                    "To verify the correctness of individual functions or components in strict isolation",
                    "To measure load-bearing traffic capabilities",
                    "To optimize the physical footprint of compiled assets"
                ],
                "correct_answer": 1
            },
            {
                "id": 5,
                "question": f"What is the purpose of defining an Interface in object-oriented structures for {topic}?",
                "options": [
                    "To implement concrete operations and store data",
                    "To define a contract of method signatures that implementing classes must fulfill",
                    "To represent graphical user layouts",
                    "To configure module dependencies"
                ],
                "correct_answer": 1
            }
        ]
        
    return {
        "topic": topic,
        "questions": questions
    }

def simulate_interview_questions(topic, difficulty, count):
    questions_pool = [
        f"Explain the architectural pattern that governs {topic} implementations.",
        f"How would you address a severe memory leak or CPU spike when running {topic}?",
        f"What are the trade-offs of using {topic} compared to other competitive frameworks?",
        f"Describe a real-world project where you integrated {topic} with asynchronous message brokers.",
        f"How do you secure endpoints and restrict unauthorized access in a {topic} setup?"
    ]
    # Return count questions
    results = []
    for i in range(min(count, len(questions_pool))):
        results.append({
            "id": i + 1,
            "question": questions_pool[i]
        })
    return results

def simulate_interview_evaluation(question, answer, topic):
    # Analyze word count and common keywords to calculate a mock score
    words = answer.split()
    score = 6
    if len(words) > 30:
        score += 1
    if len(words) > 60:
        score += 1
    if any(k in answer.lower() for k in ["asynchronous", "architecture", "scaling", "modular", "threading", "latency"]):
        score += 1
    score = min(score, 10)
    
    return {
        "rating": score,
        "clarity": min(score + 1, 10),
        "technical_accuracy": score,
        "completeness": min(score - 1, 10),
        "feedback": f"Your response is well-structured and covers the basic foundations of {topic}. To improve, try referencing actual libraries or frameworks and describe a concrete debugging scenario."
    }
