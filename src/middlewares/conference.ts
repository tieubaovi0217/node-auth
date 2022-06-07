import { body } from 'express-validator';

import * as _ from 'lodash';

export const checkTimeline = body('timeline').custom((value, { req }: any) => {
  for (const t of value) {
    if (isNaN(Date.parse(t.time))) {
      throw new Error('timeline is not valid');
    }
    if (!_.isString(t.content)) {
      throw new Error('content is not valid');
    }
  }

  let previousTime = new Date(0);
  for (const t of value) {
    if (_.isNil(t.time)) {
      throw new Error('timeline is required!');
    }
    const currentTime = new Date(t.time);
    if (
      currentTime < previousTime ||
      new Date(req.body.startTime) > currentTime ||
      currentTime > new Date(req.body.endTime)
    ) {
      throw new Error('timeline is not valid!');
    }
    previousTime = currentTime;
  }

  return true;
});

export const checkNameConference = body('name')
  .trim()
  .isLength({ min: 4 })
  .withMessage('name of conference must be at least 4 characters long');

export const checkStartTime = body('startTime')
  .isISO8601()
  .withMessage('start time is not valid');

export const checkEndTime = body('endTime')
  .isISO8601()
  .withMessage('start time is not valid');
