import React from 'react';

const Comment = (props) => {
  return (
    <div>
      <span style={{ fontStyle: 'italic' }} className="text-secondary">
        Comment by: {props.commentData.commentOwnerUsername} on{' '}
        <time>{new Date(props.commentData.createdAt).toDateString()}</time>
      </span>
      <p>{props.commentData.content}</p>
    </div>
  );
};

export default Comment;
