export interface FileItem {
  name: string;
  isDirectory: boolean;
  path: string;
  extension?: string;
  size?: number;
  modified?: Date;
}

export interface Student {
  id: string;
  fullName: string;
  group: string;
  course: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  imagePath?: string;
  points: number;
  bankName: string;
}

export interface TestResult {
  id: string;
  studentId: string;
  fullName: string;
  group: string;
  course: number;
  testName: string;  // например: "lab2-1"
  score: number;
  maxScore: number;
  percentage: number;
  completedAt: string; // ISO строка даты
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}