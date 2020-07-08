import React, { Fragment } from 'react';

const UsersWhoLikedPost = (props) => {
  return (
    <Fragment>
      {props.data.map((user) => (
        <div key={user} className="text-secondary">
          {user}
        </div>
      ))}
    </Fragment>
  );
};

export default UsersWhoLikedPost;
