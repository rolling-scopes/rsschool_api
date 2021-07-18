import {
  AudioTwoTone,
  CalendarTwoTone,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CodeTwoTone,
  CompassTwoTone,
  DashboardTwoTone,
  FireTwoTone,
  LikeOutlined,
  PlayCircleTwoTone,
  StopTwoTone,
} from '@ant-design/icons';
import { Session } from 'components/withSession';
import React from 'react';
import { Course } from 'services/models';
import {
  isStudent,
  isAdmin,
  isTaskOwner,
  isMentor,
  isCourseManager,
  isJuryActivist,
  isCourseSupervisor,
} from 'domain/user';

const anyAccess = () => true;
const isCourseNotCompleted = (_: Session, course: Course) => !course.completed;

const every =
  (...checks: ((session: Session, course: Course) => boolean)[]) =>
  (session: Session, course: Course) =>
    checks.every(check => check(session, course));

const some =
  (...checks: ((session: Session, course: Course) => boolean)[]) =>
  (session: Session, course: Course) =>
    checks.some(check => check(session, course));

export type LinkData = {
  name: string;
  icon?: JSX.Element;
  getUrl: (course: Course) => string;
  access: (session: Session, course: Course) => boolean;
  newTab?: boolean;
};

export const links: LinkData[] = [
  {
    name: 'Dashboard',
    icon: <DashboardTwoTone />,
    getUrl: (course: Course) => `/course/student/dashboard?course=${course.alias}`,
    access: every(isCourseNotCompleted, isStudent),
  },
  {
    name: 'Score',
    icon: <FireTwoTone twoToneColor="orange" />,
    getUrl: (course: Course) => `/course/score?course=${course.alias}`,
    access: anyAccess,
  },
  {
    name: 'Schedule',
    icon: <CalendarTwoTone twoToneColor="#eb2f96" />,
    getUrl: (course: Course) => `/course/schedule?course=${course.alias}`,
    access: anyAccess,
  },
  {
    name: 'Submit Review',
    icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
    getUrl: (course: Course) => `/course/mentor/submit-review?course=${course.alias}`,
    access: every(isCourseNotCompleted, some(isMentor, isTaskOwner, isCourseManager)),
  },
  {
    name: 'Submit Review By Jury',
    icon: <CheckCircleTwoTone />,
    getUrl: (course: Course) => `/course/mentor/submit-review-jury?course=${course.alias}`,
    access: every(isCourseNotCompleted, some(isAdmin, isJuryActivist)),
  },
  {
    name: 'Submit Scores',
    icon: <CheckSquareTwoTone twoToneColor="#52c41a" />,
    getUrl: (course: Course) => `/course/submit-scores?course=${course.alias}`,
    access: every(isCourseNotCompleted, some(isTaskOwner, isAdmin, isCourseManager)),
  },

  {
    name: 'Feedback on student',
    icon: <LikeOutlined />,
    getUrl: () => `/feedback`,
    access: isMentor,
  },
  {
    name: 'Cross-Check: Submit',
    icon: <CodeTwoTone />,
    getUrl: (course: Course) => `/course/student/cross-check-submit?course=${course.alias}`,
    access: every(isCourseNotCompleted, isStudent),
  },
  {
    name: 'Cross-Check: Review',
    icon: <CheckCircleTwoTone twoToneColor="#f56161" />,
    getUrl: (course: Course) => `/course/student/cross-check-review?course=${course.alias}`,
    access: every(isCourseNotCompleted, isStudent),
  },
  {
    name: 'Interviews',
    icon: <AudioTwoTone />,
    getUrl: (course: Course) => `/course/student/interviews?course=${course.alias}`,
    access: every(isCourseNotCompleted, isStudent),
  },
  {
    name: 'Interviews',
    icon: <AudioTwoTone twoToneColor="orange" />,
    getUrl: (course: Course) => `/course/mentor/interviews?course=${course.alias}`,
    access: every(isCourseNotCompleted, isMentor),
  },
  {
    name: 'Cross Mentors',
    icon: <CompassTwoTone twoToneColor="#52c41a" />,
    getUrl: (course: Course) => `/course/student/cross-mentors?course=${course.alias}`,
    access: every(isCourseNotCompleted, isStudent),
  },
  {
    name: 'Auto-Test',
    icon: <PlayCircleTwoTone twoToneColor="#7f00ff" />,
    getUrl: (course: Course) => `/course/student/auto-test?course=${course.alias}`,
    access: every(isCourseNotCompleted, some(isStudent, isCourseManager)),
  },
  {
    name: 'Expel Student',
    icon: <StopTwoTone twoToneColor="red" />,
    getUrl: (course: Course) => `/course/mentor/expel-student?course=${course.alias}`,
    access: every(isCourseNotCompleted, isMentor),
  },
];

export const courseManagementLinks: LinkData[] = [
  {
    name: 'Course Events',
    getUrl: (course: Course) => `/course/admin/events?course=${course.alias}`,
    access: isCourseManager,
  },
  {
    name: `Course Tasks`,
    getUrl: (course: Course) => `/course/admin/tasks?course=${course.alias}`,
    access: isCourseManager,
  },
  {
    name: `Course Students`,
    getUrl: (course: Course) => `/course/admin/students?course=${course.alias}`,
    access: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: `Course Mentors`,
    getUrl: (course: Course) => `/course/admin/mentors?course=${course.alias}`,
    access: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: `Course Users`,
    getUrl: (course: Course) => `/course/admin/users?course=${course.alias}`,
    access: isAdmin,
  },
  {
    name: `Cross-Сheck Table`,
    getUrl: (course: Course) => `/course/admin/cross-check-table?course=${course.alias}`,
    access: isCourseManager,
  },
  {
    name: `Technical Screening`,
    getUrl: (course: Course) => `/course/admin/stage-interviews?course=${course.alias}`,
    access: some(isCourseManager, isCourseSupervisor),
  },
  {
    name: `CoreJs Interviews`,
    getUrl: (course: Course) => `/course/admin/interviews?course=${course.alias}`,
    access: isCourseManager,
  },
];
