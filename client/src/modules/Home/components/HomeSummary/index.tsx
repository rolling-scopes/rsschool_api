import { Card, Col, Row, Statistic, Typography } from 'antd';
import { GithubUserLink } from 'components';
import * as React from 'react';
import { StudentSummary } from 'services/course';

type Props = {
  summary: StudentSummary;
  courseTasks: { id: number }[];
};

export function HomeSummary({ summary, courseTasks }: Props) {
  const { name, githubId, contactsEmail, contactsPhone, contactsSkype, contactsTelegram, contactsNotes } =
    summary.mentor ?? {};
  const tasksCount = summary.results.filter(r => r.score > 0).length;
  const totalTaskCount = courseTasks.length;

  const contacts = [
    { label: 'Email', value: contactsEmail },
    { label: 'Phone', value: contactsPhone },
    { label: 'Skype', value: contactsSkype },
    { label: 'Telegram', value: contactsTelegram },
    { label: 'Notes', value: contactsNotes },
  ];

  return (
    <Row gutter={24}>
      <Col xs={24} sm={24} md={24} lg={12}>
        <Card style={{ marginBottom: 16 }} size="small" title="Your stats">
          <Row>
            <Col span={12}>
              <Statistic title="Score Points" value={summary.totalScore} />
            </Col>
            <Col span={12}>
              <Statistic title="Completed Tasks" value={`${tasksCount}/${totalTaskCount}`} />
            </Col>
            <Col span={24} style={{ marginTop: 16 }}>
              <Statistic
                title="Status"
                valueStyle={{ color: summary.isActive ? '#87d068' : '#ff5500' }}
                value={summary.isActive ? 'Active' : 'Inactive'}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      {summary.mentor && (
        <Col xs={24} sm={24} md={24} lg={12}>
          <Card size="small" title="Your mentor">
            <div>
              <div>{name}</div>
              <div>
                <GithubUserLink value={githubId!} />
              </div>
            </div>
            {contacts.map(({ label, value }) =>
              value ? (
                <Typography.Paragraph>
                  <Typography.Text type="secondary">{label}:</Typography.Text> {value}
                </Typography.Paragraph>
              ) : null,
            )}
          </Card>
        </Col>
      )}
    </Row>
  );
}
