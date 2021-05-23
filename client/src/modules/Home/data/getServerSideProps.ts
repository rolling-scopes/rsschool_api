import { GetServerSideProps } from 'next';
import { UserService } from 'services/user';

export const getServerSideProps: GetServerSideProps<any> = async ctx => {
  const courses = await new UserService(ctx).getCourses();
  return {
    props: { courses },
  };
};
