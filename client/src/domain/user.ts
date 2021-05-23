import { values } from 'lodash';
import { Session } from 'components/withSession';
import { Course } from 'services/models';

export function isAdmin(session: Session) {
  return session.isAdmin;
}

export function isMentor(session: Session, course: Course) {
  return session.roles?.[course.id] === 'mentor';
}

export function isStudent(session: Session, course: Course) {
  return session.roles?.[course.id] === 'student';
}

export function isCourseManager(session: Session, course: Course) {
  return session.isAdmin || (session.coursesRoles?.[course.id]?.includes('manager') ?? false);
}

export function isAnyCourseManager(session: Session) {
  return values(session.coursesRoles).some(item => item?.includes('manager'));
}

export function isCourseSupervisor(session: Session, course: Course) {
  return session.isAdmin || (session.coursesRoles?.[course.id]?.includes('supervisor') ?? false);
}

export function isAnyCourseSupervisor(session: Session) {
  return values(session.coursesRoles).some(item => item?.includes('supervisor'));
}

export function isAnyCoursePowerUserManager(session: Session) {
  return isAnyCourseManager(session) || isAnyCourseSupervisor(session);
}

export function isTaskOwner(session: Session, course: Course) {
  return session.coursesRoles?.[course.id]?.includes('taskOwner') ?? false;
}

export function isJuryActivist(session: Session, course: Course) {
  return session.coursesRoles?.[course.id]?.includes('juryActivist') ?? false;
}
