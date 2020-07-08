import React, { useEffect, useState } from 'react';
import { AmplifyGreetings } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';

const Header = () => {
const [username, setUsername] = useState()

  useEffect( () => {
    fetchData()
  }, []);
  
  const fetchData = async () => {
    await Auth.currentUserInfo().then((user) => {
      setUsername(user.username)
    });
  }
  return <AmplifyGreetings username={username} />;
};

export default Header;
