import Router from '@koa/router';
import { DateTime } from 'luxon';
import { omit } from 'lodash';
import { ILogger } from '../../logger';
import { setResponse } from '../utils';
import { NOT_FOUND, OK, CREATED, CONFLICT } from 'http-status-codes';
import { guard } from '../guards';
import { getRepository } from 'typeorm';
import { CV, IUserSession, User, Feedback, Student, Certificate, Mentor, Course } from '../../models';
import { getFullName } from '../../rules';

const getFeedbackCV = async (githubId: string) => {
  return await getRepository(Feedback)
    .createQueryBuilder('feedback')
    .select('"feedback"."updatedDate" AS "feedbackDate"')
    .addSelect('"feedback"."comment" AS "comment"')
    .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .orderBy('"feedback"."updatedDate"', 'DESC')
    .getRawMany();
};

const getFeedbackJobSeeker = async (githubId: string) => {
  return await getRepository(Feedback)
    .createQueryBuilder('feedback')
    .select('"feedback"."badgeId" AS "badgeId"')
    .leftJoin(User, 'user', '"user"."id" = "feedback"."toUserId"')
    .where('"user"."githubId" = :githubId', { githubId })
    .orderBy('"feedback"."updatedDate"', 'DESC')
    .getRawMany();
};

const getStudentsStats = async (githubId: string) => {
  const query = await getRepository(Student)
    .createQueryBuilder('student')
    .addSelect('"course"."id" AS "courseId"')
    .addSelect('"course"."name" AS "courseName"')
    .addSelect('"course"."locationName" AS "locationName"')
    .addSelect('"course"."fullName" AS "courseFullName"')
    .addSelect('"student"."courseCompleted" AS "isCourseCompleted"')
    .addSelect('"student"."totalScore" AS "totalScore"')
    .addSelect('"userMentor"."firstName" AS "mentorFirstName"')
    .addSelect('"userMentor"."lastName" AS "mentorLastName"')
    .addSelect('"userMentor"."githubId" AS "mentorGithubId"')
    .addSelect('"certificate"."publicId" AS "certificateId"');

  query
    .leftJoin(User, 'user', '"user"."id" = "student"."userId"')
    .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
    .leftJoin(Course, 'course', '"course"."id" = "student"."courseId"')
    .leftJoin(Mentor, 'mentor', '"mentor"."id" = "student"."mentorId"')
    .leftJoin(User, 'userMentor', '"userMentor"."id" = "mentor"."userId"');

  query
    .where('"user"."githubId" = :githubId', { githubId })
    .andWhere('"student"."isExpelled" != :expelled', { expelled: true })
    .groupBy('"course"."id", "student"."id", "userMentor"."id", "certificate"."publicId"')
    .orderBy('"course"."endDate"', 'DESC');

  const rawStats = await query.getRawMany();

  const studentStats = rawStats.map(
    ({
      courseId,
      courseName,
      locationName,
      courseFullName,
      isCourseCompleted,
      totalScore,
      mentorFirstName,
      mentorLastName,
      mentorGithubId,
      certificateId,
    }: any) => {
      return {
        courseId,
        courseName,
        locationName,
        courseFullName,
        isCourseCompleted,
        totalScore,
        certificateId,
        position: null,
        mentor: {
          githubId: mentorGithubId,
          name: getFullName(mentorFirstName, mentorLastName, mentorGithubId),
        },
      };
    },
  );

  const studentPositions = await Promise.all(
    studentStats.map(async ({ totalScore, courseId }: { totalScore: number; courseId: number }) => {
      const rawPositions = await getRepository(Student)
        .createQueryBuilder('student')
        .select('"student"."courseId" AS "courseId"')
        .addSelect('COUNT(*) AS "position"')
        .where('"student"."courseId" = :courseId', { courseId })
        .andWhere('"student"."totalScore" >= :totalScore', { totalScore })
        .groupBy('"student"."courseId"')
        .getRawMany();
      return rawPositions.map(({ position }) => ({ position: Number(position) }))[0];
    }),
  );

  return studentStats.map((stats, idx) => ({ ...omit(stats, ['courseId']), ...studentPositions[idx] }));
};

export const getOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.query;

  const user = await getRepository(User).findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  setResponse(ctx, OK, user.opportunitiesConsent);
};

export const setOpportunitiesConsent = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.request.body;

  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { githubId } });

  if (user === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const { opportunitiesConsent: reqConsent } = ctx.request.body;
  const prevConsent = user.opportunitiesConsent;

  if (reqConsent === prevConsent) {
    setResponse(ctx, OK, user.opportunitiesConsent);
    return;
  }

  const userWithEmptyOpportunities = {
    ...user,
    opportunitiesConsent: reqConsent,
  };

  const result = await userRepository.save({ ...user, ...userWithEmptyOpportunities });

  setResponse(ctx, OK, result.opportunitiesConsent);
};

const getJobSeekersData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const currentTimestamp = new Date().getTime();

  let cvProfiles = await getRepository(CV)
    .createQueryBuilder('cv')
    .select(
      'cv.name, cv.githubId, cv.desiredPosition, cv.englishLevel, cv.fullTime, cv.location, cv.startFrom, cv.expires',
    )
    .leftJoin(User, 'user', 'cv.githubId = user.githubId')
    .where('user.opportunitiesConsent = true')
    .andWhere('cv.expires >= :currentTimestamp', { currentTimestamp })
    .getRawMany();

  if (cvProfiles.length) {
    cvProfiles = await Promise.all(
      cvProfiles.map(async (cv: any) => {
        const { githubId } = cv;

        const feedback = await getFeedbackJobSeeker(githubId);

        const courses = await getStudentsStats(githubId);

        return {
          ...cv,
          feedback,
          courses,
        };
      }),
    );
  }

  setResponse(ctx, OK, cvProfiles);
};

const saveCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const data = ctx.request.body;

  const result = await cvRepository.save({
    ...cv,
    ...data,
  });

  setResponse(ctx, OK, result);
};

export const createCV = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);

  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv != undefined) {
    setResponse(ctx, CONFLICT);
    return;
  }

  const newCV = await cvRepository.create({
    githubId,
  });

  await cvRepository.save(newCV);

  setResponse(ctx, CREATED, newCV);
};

export const getCVData = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.query;

  const cvRepository = getRepository(CV);

  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const feedback = await getFeedbackCV(githubId);
  const courses = await getStudentsStats(githubId);

  const { id, githubId: omittedGithubId, ...cvData } = cv;

  const res = {
    ...cvData,
    feedback,
    courses,
  };

  setResponse(ctx, OK, res);
};

export const extendCV = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.state!.user as IUserSession;

  const cvRepository = getRepository(CV);
  const cv = await cvRepository.findOne({ where: { githubId } });

  if (cv === undefined) {
    setResponse(ctx, NOT_FOUND);
    return;
  }

  const EXPIRATION_DAYS_PROLONGATION = 14;

  const expirationTimestamp = DateTime.local().plus({ days: EXPIRATION_DAYS_PROLONGATION }).valueOf();
  const result = await cvRepository.save({ ...cv, expires: expirationTimestamp });

  setResponse(ctx, OK, Number(result.expires));
};

export const checkCVExistance = (_: ILogger) => async (ctx: Router.RouterContext) => {
  const { githubId } = ctx.query;

  const user = await getRepository(CV).findOne({ where: { githubId } });

  setResponse(ctx, OK, user !== undefined);
};

export function opportunitiesRoute(logger: ILogger) {
  const router = new Router<any, any>({ prefix: '/opportunities' });

  router.get('/exists', guard, checkCVExistance(logger));
  router.post('/extend', guard, extendCV(logger));
  router.get('/consent', guard, getOpportunitiesConsent(logger));
  router.post('/consent', guard, setOpportunitiesConsent(logger));
  router.get('/', guard, getJobSeekersData(logger));
  router.get('/cv', guard, getCVData(logger));
  router.put('/cv', guard, createCV(logger));
  router.post('/', guard, saveCVData(logger));

  return router;
}
