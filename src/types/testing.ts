export interface TestQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  imagePath?: string;
  bankName: string;
}

export interface TestResult {
  studentId: string;
  studentName: string;
  group: string;
  course: number;
  lab: string;
  score: number;
  maxScore: number;
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }>;
  completedAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  group: string;
  course: number;
}

export interface LabInfo {
  course: number;
  labName: string;
  banks: string[];
}