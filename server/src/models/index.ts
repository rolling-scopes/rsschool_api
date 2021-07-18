import { Alert, AlertTypes } from './alert';
import { Certificate } from './certificate';
import { Consent, ChannelType } from './consent';
import { Course } from './course';
import { CourseEvent } from './courseEvent';
import { CourseManager } from './courseManager';
import { CourseTask } from './courseTask';
import { CourseUser } from './courseUser';
import { CV } from './cv';
import { DiscordServer } from './discordServer';
import { UserGroup } from './userGroup';
import { Event } from './event';
import { ExternalAccount, User } from './user';
import { Feedback } from './feedback';
import { Mentor } from './mentor';
import { MentorRegistry } from './mentorRegistry';
import { PrivateFeedback } from './privateFeedback';
import { ProfilePermissions } from './profilePermissions';
import { Registry } from './registry';
import { RepositoryEvent } from './repositoryEvent';
import { Stage } from './stage';
import { StageInterview } from './stageInterview';
import { StageInterviewFeedback } from './stageInterviewFeedback';
import { StageInterviewStudent } from './stageInterviewStudent';
import { Student } from './student';
import { StudentFeedback } from './studentFeedback';
import { Task } from './task';
import { TaskArtefact } from './taskArtefact';
import { TaskChecker } from './taskChecker';
import { TaskInterviewResult } from './taskInterviewResult';
import { TaskInterviewStudent } from './taskInterviewStudent';
import { TaskResult } from './taskResult';
import { TaskSolution } from './taskSolution';
import { TaskSolutionChecker } from './taskSolutionChecker';
import { TaskSolutionResult } from './taskSolutionResult';
import { TaskVerification } from './taskVerification';

export * from './session';
export {
  Alert,
  AlertTypes,
  Certificate,
  Course,
  CourseEvent,
  CourseManager,
  CourseTask,
  CourseUser,
  DiscordServer,
  UserGroup,
  Event,
  ExternalAccount,
  Feedback,
  Mentor,
  MentorRegistry,
  PrivateFeedback,
  ProfilePermissions,
  Registry,
  RepositoryEvent,
  Stage,
  StageInterview,
  StageInterviewFeedback,
  StageInterviewStudent,
  Student,
  StudentFeedback,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskInterviewStudent,
  TaskResult,
  TaskSolution,
  TaskSolutionChecker,
  TaskSolutionResult,
  TaskVerification,
  User,
  Consent,
  ChannelType,
  CV,
};

export const models = [
  Alert,
  Certificate,
  Course,
  CourseEvent,
  CourseManager,
  CourseTask,
  CourseUser,
  DiscordServer,
  UserGroup,
  Event,
  Feedback,
  Mentor,
  MentorRegistry,
  PrivateFeedback,
  ProfilePermissions,
  Registry,
  RepositoryEvent,
  Stage,
  StageInterview,
  StageInterviewFeedback,
  StageInterviewStudent,
  Student,
  StudentFeedback,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskInterviewStudent,
  TaskResult,
  TaskSolution,
  TaskSolutionChecker,
  TaskSolutionResult,
  TaskVerification,
  User,
  Consent,
  CV,
];

export interface IApiResponse<T> {
  data: T | T[] | null;
  error?: {
    message: string;
  };
}
