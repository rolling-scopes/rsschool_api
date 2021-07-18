import { Session } from 'components/withSession';
import { Course } from 'services/models';
import { isEmpty } from 'lodash';

export const getCourses = (session: Session, courses: Course[]) => {
  if (!session || !courses) {
    return [];
  }
  const { isAdmin } = session;
  // TODO: it seems no need to filter. It is done on the server already.
  return courses
    .filter(course => isAdmin || session.roles[course.id] || !isEmpty(session.coursesRoles?.[course.id]))
    .filter(course => !(!isAdmin && course.alias === 'epamlearningjs' && session.roles[course.id] === 'student'))
    .sort((a, b) => (a.startDate && b.startDate ? b.startDate.localeCompare(a.startDate) : 0));
};
