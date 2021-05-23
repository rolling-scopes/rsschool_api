import { CheckSquareOutlined, QuestionCircleTwoTone, StarOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Result, Row } from 'antd';
import React from 'react';
import { Course } from 'services/models';

type Props = {
  courses: Course[];
  preselectedCourses: Course[];
};

export function NoCourse({ courses, preselectedCourses }: Props) {
  {
    const hasPlanned = courses.some(course => course.planned && !course.completed);
    return (
      <Result
        icon={<QuestionCircleTwoTone twoToneColor="#52c41a" />}
        title="You are not student or mentor in any active course"
        subTitle={
          <div>
            <span>
              {hasPlanned
                ? 'You can register to the upcoming course.'
                : 'Unfortunately, there are no any planned courses for students but you can always register as mentor'}
              <Button target="_blank" size="small" type="link" href="https://docs.rs.school/#/how-to-enroll">
                More info
              </Button>
            </span>
          </div>
        }
        extra={
          <>
            <Row justify="center">
              <Button size="large" icon={<StarOutlined />} type="default" href="/registry/mentor">
                Register as Mentor
              </Button>
              {hasPlanned && (
                <Button
                  style={{ marginLeft: 16 }}
                  size="large"
                  icon={<UserOutlined />}
                  href="/registry/student"
                  type="default"
                >
                  Register as Student
                </Button>
              )}
            </Row>
            <Row justify="center" style={{ marginTop: 16 }}>
              {preselectedCourses.map(c => (
                <Button
                  key={c.id}
                  size="large"
                  icon={<CheckSquareOutlined />}
                  type="primary"
                  href={`/course/mentor/confirm?course=${c.alias}`}
                >
                  Confirm {c.name}
                </Button>
              ))}
            </Row>
          </>
        }
      />
    );
  }
}
