import React from 'react';
import Posts from './components/Posts/Posts';
import CreatePost from './components/CreatePost/CreatePost';
import { withAuthenticator } from '@aws-amplify/ui-react';
import Header from './components/Header/Header';

const App = () => {
  return (
    <div>
      <Header />
      <CreatePost />
      <Posts />
    </div>
  );
};

export default withAuthenticator(App);
