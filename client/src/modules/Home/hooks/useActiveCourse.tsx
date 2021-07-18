import { useState } from 'react';
import { Course } from 'services/models';

export function useActiveCourse(courses: Course[]): [Course | null, (courseId: number) => void] {
  const [courseId, setCourseId] = useState<number>();
  const activeCourseId = courseId || Number(loadActiveCourseId());
  const course = courses.find(course => course.id === activeCourseId) ?? courses[0];
  return [
    course,
    (courseId: number) => {
      setCourseId(courseId);
      saveActiveCouseId(courseId);
    },
  ];
}

function loadActiveCourseId() {
  return localStorage.getItem('activeCourseId');
}

function saveActiveCouseId(courseId: number) {
  localStorage.setItem('activeCourseId', courseId as any);
}
