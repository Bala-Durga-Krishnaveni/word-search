// Course content and game settings.
export const syllabus = {
  courseName: "Data Science with Python",
  units: [
    { id: 1, title: "Python Basics and Programming Concepts",
      topics: ["Types and Operations", "Statements and Syntax", "Functions", "Modules", "Classes and OOP", "Exceptions and Tools"],
      keywords: ["PYTHON", "STRINGS", "TUPLES", "LOOPS", "FUNCTIONS", "CLASSES", "MODULES", "SCOPES"] },
    { id: 2, title: "Python Tools for Data Handling: GUI, APIs, Web Data and Databases",
      topics: ["GUI Programming", "Jupyter Notebook", "Internet Programming", "Web Scraping", "Databases and Persistence"],
      keywords: ["TKINTER", "JUPYTER", "REQUESTS", "SCRAPING", "SQL", "DATABASES", "SQLITE", "JSON"] },
    { id: 3, title: "Pandas and NumPy",
      topics: ["Numpy Basics", "Pandas Data Structures", "Descriptive Statistics", "Missing Data", "Hierarchical Indexing"],
      keywords: ["NUMPY", "ARRAYS", "PANDAS", "INDEXING", "STATISTICS", "MISSINGDATA", "FILEIO", "ELEMENTWISE"] },
    { id: 4, title: "Data Preprocessing and Visualization",
      topics: ["Data Loading and Storage", "Data Wrangling", "Data Aggregation", "Data Visualization"],
      keywords: ["DATALOADING", "WRANGLING", "MERGING", "RESHAPING", "GROUPBY", "AGGREGATION", "MATPLOTLIB", "SEABORN"] },
    { id: 5, title: "Machine Learning for Data Science",
      topics: ["Introduction to ML", "Data Preparation for ML", "Supervised Learning", "Unsupervised Learning", "Model Evaluation"],
      keywords: ["SUPERVISED", "UNSUPERVISED", "REGRESSION", "CLUSTERING", "DECISIONTREES", "KMEANS", "PCA", "OVERFITTING"] },
  ],
};

export const SCORES = { correct: 100, wrong: -5, hint: -20 };

export const UNIT_COLORS = { 1: "var(--blue)", 2: "var(--green)", 3: "var(--pink)", 4: "var(--orange)", 5: "var(--purple)" };

export const WORD_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#14B8A6", "#EF4444", "#6366F1"];
