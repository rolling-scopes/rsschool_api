import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { ToolTwoTone } from '@ant-design/icons';
import { Alert, Button, Col, Layout, List, Row, Select, Typography } from 'antd';
import { AdminSider, FooterLayout, Header } from 'components';
import { Session } from 'components/withSession';
import { isAnyCoursePowerUserManager } from 'domain/user';
import { HomeSummary } from 'modules/Home/components/HomeSummary';
import { NoCourse } from 'modules/Home/components/NoCourse';
import { RegistryBanner } from 'modules/Home/components/RegistryBanner';
import { SystemAlerts } from 'modules/Home/components/SystemAlerts';
import { courseManagementLinks, LinkData, links } from 'modules/Home/data/links';
import { loadHomeData } from 'modules/Home/data/loadHomeData';
import { getCourses } from 'modules/Home/data/getCourses';
import { useActiveCourse } from 'modules/Home/hooks/useActiveCourse';
import { StudentSummary } from 'services/course';
import { CoursesService } from 'services/courses';
import { MentorRegistryService } from 'services/mentorRegistry';
import { Course } from 'services/models';
import { AlertsService } from 'services/alerts';
import { Alert as AlertType } from 'domain/alerts';

const { Content } = Layout;

type Props = {
  courses?: Course[];
  session: Session;
};

type LinkRenderData = Pick<LinkData, 'icon' | 'name'> & { url: string };

const mentorRegistryService = new MentorRegistryService();

export function HomePage(props: Props) {
  const plannedCourses = (props.courses || []).filter(course => course.planned && !course.inviteOnly);
  const wasMentor = Object.values(props.session.roles).some(v => v === 'mentor');
  const hasRegistryBanner =
    wasMentor && plannedCourses.length > 0 && plannedCourses.every(course => props.session.roles[course.id] == null);
  const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);

  const { isAdmin } = props.session;
  const isCoursePowerUser = isAnyCoursePowerUserManager(props.session);
  const courses = getCourses(props.session, props.courses ?? []);
  const [activeCourse, saveActiveCouseId] = useActiveCourse(courses);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [preselectedCourses, setPreselectedCourses] = useState<Course[]>([]);
  const [courseTasks, setCourseTasks] = useState<{ id: number }[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const courseLinks = activeCourse
    ? links
        .filter(route => route.access(props.session, activeCourse))
        .map(({ name, icon, getUrl }) => ({ name, icon, url: getUrl(activeCourse) }))
    : [];
  const adminLinks = activeCourse
    ? courseManagementLinks
        .filter(route => route.access(props.session, activeCourse))
        .map(({ name, icon, getUrl }) => ({ name, icon, url: getUrl(activeCourse) }))
    : [];

  const [approvedCourse] = preselectedCourses.filter(course => !props.session.roles?.[course.id]);
  const isPowerUser = isAdmin || isCoursePowerUser;

  const handleChange = async (courseId: number) => {
    saveActiveCouseId(courseId);
    await loadCourseData();
  };

  const loadCourseData = async () => {
    if (!activeCourse) {
      return;
    }
    const data = await loadHomeData(activeCourse.id, props.session);
    if (data) {
      setStudentSummary(data.studentSummary);
      setCourseTasks(data.courseTasks);
    }
  };

  useAsync(async () => {
    const [allCourses, alerts] = await Promise.all([
      new CoursesService().getCourses(),
      new AlertsService().getAll(),
      loadCourseData(),
    ]);
    setAllCourses(allCourses);
    setAlerts(alerts);

    const mentor = await mentorRegistryService.getMentor().catch(() => null);
    const preselectedCourses = allCourses.filter(c => mentor?.preselectedCourses.includes(c.id));
    setPreselectedCourses(preselectedCourses);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isPowerUser && <AdminSider isAdmin={isAdmin} isCoursePowerUser={isCoursePowerUser} />}

      <Layout style={{ background: '#fff' }}>
        <Header username={props.session.githubId} />
        <Content style={{ margin: 16, marginBottom: 32 }}>
          {!activeCourse && <NoCourse courses={allCourses} preselectedCourses={preselectedCourses} />}

          {approvedCourse && (
            <div style={{ margin: '16px 0' }}>
              <Alert
                type="success"
                showIcon
                message={`You are approved as a mentor to "${approvedCourse.name}" course`}
                description={
                  <Button type="primary" href={`/course/mentor/confirm?course=${approvedCourse.alias}`}>
                    Confirm Participation
                  </Button>
                }
              />
            </div>
          )}

          <SystemAlerts alerts={alerts} />

          {hasRegistryBanner && <RegistryBanner style={{ margin: '16px 0' }} />}

          {activeCourse && (
            <Select style={{ width: 250, marginBottom: 16 }} defaultValue={activeCourse.id} onChange={handleChange}>
              {courses.map(course => (
                <Select.Option key={course.id} value={course.id}>
                  {course.name} ({getStatus(course)})
                </Select.Option>
              ))}
            </Select>
          )}

          <Row gutter={24}>
            <Col xs={24} sm={12} md={10} lg={8} style={{ marginBottom: 16 }}>
              <List
                size="small"
                bordered
                dataSource={courseLinks}
                renderItem={(linkInfo: LinkRenderData) => (
                  <List.Item key={linkInfo.url}>
                    <a href={linkInfo.url}>
                      {linkInfo.icon} {linkInfo.name}
                    </a>
                  </List.Item>
                )}
              />

              {courseManagementLinks.length ? (
                <List
                  size="small"
                  style={{ marginTop: 16 }}
                  header={
                    <Typography.Text strong>
                      <ToolTwoTone twoToneColor="#000000" /> Course Management
                    </Typography.Text>
                  }
                  bordered
                  dataSource={adminLinks}
                  renderItem={(linkInfo: LinkRenderData) => (
                    <List.Item key={linkInfo.url}>
                      <a href={linkInfo.url}>
                        {linkInfo.icon} {linkInfo.name}
                      </a>
                    </List.Item>
                  )}
                />
              ) : null}
            </Col>
            <Col xs={24} sm={12} md={12} lg={16}>
              {studentSummary && <HomeSummary courseTasks={courseTasks} summary={studentSummary} />}
            </Col>
          </Row>
        </Content>
        <FooterLayout />
      </Layout>
    </Layout>
  );
}

const getStatus = (course: Course) => {
  if (course.completed) {
    return 'Completed';
  }
  if (course.planned) {
    return 'Planned';
  }
  return 'Active';
};
