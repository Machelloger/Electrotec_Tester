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