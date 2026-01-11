import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { Student, Question } from '../types/filesystem';

export interface CourseData {
  id: number;
  name: string;
  labs: LabData[];
}

export interface LabData {
  id: string;
  name: string;
  banks: BankData[];
}

export interface BankData {
  id: string;
  name: string;
  questionsCount: number;
}

export const useAppData = () => {
  const data = useData();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Используем useRef для стабильных ссылок
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Мемоизированная функция загрузки структуры курсов
  const loadCoursesStructure = useCallback(async () => {
    setIsLoading(true);
    try {
      const coursesList: CourseData[] = [];
      
      // Получаем список курсов
      const rootFiles = await dataRef.current.listDirectory('');
      const courseDirs = rootFiles.filter(f => f.isDirectory && (f.name === '2kurs' || f.name === '3kurs'));
      
      for (const courseDir of courseDirs) {
        const courseId = parseInt(courseDir.name.replace('kurs', ''));
        const labs: LabData[] = [];
        
        // Получаем лабораторные работы
        const labFiles = await dataRef.current.listDirectory(courseDir.name);
        const labDirs = labFiles.filter(f => f.isDirectory && f.name.startsWith('lab'));
        
        for (const labDir of labDirs) {
          const banks: BankData[] = [];
          
          // Получаем банки вопросов
          const bankFiles = await dataRef.current.listDirectory(`${courseDir.name}/${labDir.name}`);
          const bankDirs = bankFiles.filter(f => f.isDirectory && f.name.startsWith('bank'));
          
          for (const bankDir of bankDirs) {
            // Считаем количество вопросов
            const questionFiles = await dataRef.current.listDirectory(`${courseDir.name}/${labDir.name}/${bankDir.name}`);
            const questionsCount = questionFiles.filter(f => !f.isDirectory && f.name.endsWith('.txt')).length;
            
            banks.push({
              id: bankDir.name,
              name: `Банк ${bankDir.name.replace('bank', '')}`,
              questionsCount
            });
          }
          
          labs.push({
            id: labDir.name,
            name: `Лабораторная ${labDir.name.replace('lab', '').replace('-', '.')}`,
            banks
          });
        }
        
        coursesList.push({
          id: courseId,
          name: `${courseId} курс`,
          labs
        });
      }
      
      setCourses(coursesList);
    } catch (err) {
      console.error('Error loading courses structure:', err);
      setError('Ошибка загрузки структуры курсов');
    } finally {
      setIsLoading(false);
    }
  }, []); // Пустой массив зависимостей - функция создается один раз

  // Мемоизированная функция загрузки студентов
  const loadStudents = useCallback(async (course?: number) => {
    try {
      const studentsList = await dataRef.current.getStudents(course);
      setStudents(studentsList);
    } catch (err) {
      console.error('Error loading students:', err);
      setError('Ошибка загрузки студентов');
    }
  }, []);

  // Мемоизированная функция получения изображения
  const getQuestionImage = useCallback(async (course: number, lab: string, imagePath: string): Promise<string | null> => {
    if (!imagePath) return null;
    
    try {
      const fullPath = `${course}kurs/${lab}/${imagePath}`;
      const imageData = await dataRef.current.readImage(fullPath);
      return imageData;
    } catch (err) {
      console.error('Error loading question image:', err);
      return null;
    }
  }, []);

  // Мемоизированная функция получения вопросов
  const getQuestions = useCallback(async (course: number, lab: string, bank: string): Promise<Question[]> => {
    try {
      const questionsList = await dataRef.current.getQuestions(course, lab, bank);
      return questionsList;
    } catch (err) {
      console.error('Error getting questions:', err);
      return [];
    }
  }, []);

  // Мемоизированная функция экспорта
  const exportCourseData = useCallback(async (courseId: number, labId: string) => {
    try {
      const result = await dataRef.current.exportData();
      if (result.success) {
        return { 
          success: true, 
          message: `Данные курса ${courseId} экспортированы`,
          filePath: result.filePath 
        };
      }
      return { success: false, message: result.error || 'Ошибка экспорта' };
    } catch (err) {
      return { success: false, message: 'Ошибка при экспорте' };
    }
  }, []);

  // Инициализация - загружаем данные один раз при монтировании
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadCoursesStructure(),
          loadStudents()
        ]);
      } catch (err) {
        setError('Ошибка инициализации данных');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, [loadCoursesStructure, loadStudents]); // Зависимости стабильны благодаря useCallback

  return {
    // Данные
    courses,
    students,
    
    // Функции загрузки
    loadCoursesStructure,
    loadStudents,
    getQuestions,
    getQuestionImage,
    
    // Операции
    exportCourseData,
    importData: data.importData,
    
    // Состояние
    isLoading: isLoading || data.isLoading,
    error: error || data.error
  };
};