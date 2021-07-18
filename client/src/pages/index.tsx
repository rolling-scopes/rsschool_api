import { withSession } from 'components/withSession';
import { getServerSideProps } from 'modules/Home/data/getServerSideProps';
import { HomePage } from 'modules/Home/pages/HomePage';

export { getServerSideProps };
export default withSession(HomePage);
