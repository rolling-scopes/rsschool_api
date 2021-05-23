import { Session } from 'components/withSession';
import { CourseService } from 'services/course';

export async function loadHomeData(courseId: number, session: Session) {
  const isStudent = courseId && session.roles[courseId] === 'student';
  if (!isStudent) {
    return null;
  }
  const courseService = new CourseService(courseId);
  const [studentSummary, courseTasks] = await Promise.all([
    courseService.getStudentSummary('me'),
    courseService.getCourseTasks(),
  ]);
  return {
    studentSummary,
    courseTasks: courseTasks.map(t => ({ id: t.id })),
  };
}
