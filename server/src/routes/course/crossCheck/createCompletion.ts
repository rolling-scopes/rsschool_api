import Router from '@koa/router';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ILogger } from '../../../logger';
import { courseService, taskResultsService, taskService } from '../../../services';
import { setResponse } from '../../utils';

const defaultPairsCount = 4;

export const createCompletion = (__: ILogger) => async (ctx: Router.RouterContext) => {
  const { courseTaskId } = ctx.params;

  const courseTask = await taskService.getCourseTask(courseTaskId);
  if (courseTask == null) {
    setResponse(ctx, BAD_REQUEST);
    return;
  }
  const pairsCount = Math.max((courseTask.pairsCount ?? defaultPairsCount) - 1, 1);
  const studentScores = await courseService.getTaskSolutionCheckers(courseTaskId, pairsCount);

  for (const studentScore of studentScores) {
    const data = { authorId: -1, comment: 'Cross-Check score', score: studentScore.score };
    await taskResultsService.saveScore(studentScore.studentId, courseTaskId, data);
  }
  setResponse(ctx, OK);
};
