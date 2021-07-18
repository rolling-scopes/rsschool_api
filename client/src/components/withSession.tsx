import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LoadingScreen } from './LoadingScreen';
import Router from 'next/router';

export type Role = 'student' | 'mentor' | 'coursemanager';

export interface Session {
  id: number;
  githubId: string;
  isAdmin: boolean;
  isHirer: boolean;
  isActivist: boolean;
  roles: { [key: number]: Role };
  coursesRoles?: { [key: string]: ('taskOwner' | 'juryActivist' | 'manager' | 'supervisor')[] | undefined };
}

let sessionCache: Session | undefined;

function withSession(WrappedComponent: React.ComponentType<any>, requiredRole?: Role) {
  return (props: any) => {
    const [isLoading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | undefined>();

    useEffect(() => {
      const load = async () => {
        if (sessionCache != null) {
          setLoading(false);
          setSession(sessionCache);
          return;
        }
        try {
          const response = await axios.get(`/api/session`);
          setLoading(false);
          sessionCache = response.data.data;
          setSession(sessionCache);
        } catch (e) {
          setLoading(false);
          Router.push('/login', {
            pathname: '/login',
            query: {
              url: encodeURIComponent(document.location.pathname + document.location.search),
            },
          });
        }
      };

      load();
    }, []);

    if (session && requiredRole) {
      const { roles, isAdmin } = session;
      if (roles[props.course.id] !== requiredRole && !isAdmin) {
        return (
          <h4 className="m-5 d-flex justify-content-center">
            You are not [{requiredRole}] in {props.course.alias}
          </h4>
        );
      }
    }
    return (
      <LoadingScreen show={isLoading}>{session && <WrappedComponent session={session} {...props} />}</LoadingScreen>
    );
  };
}

export default withSession;
export { withSession };
