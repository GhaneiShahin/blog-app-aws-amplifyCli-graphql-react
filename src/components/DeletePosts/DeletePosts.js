import React from 'react';
import { Button } from 'react-bootstrap';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../../graphql/mutations';

const DeletePosts = ({ deletePostProps }) => {
  const handleDeletePost = async (postId) => {
    const input = {
      id: postId,
    };
    await API.graphql(graphqlOperation(deletePost, { input }));
  };
  return (
    <Button
      variant="outline-danger"
      className="mr-2"
      onClick={() => handleDeletePost(deletePostProps.id)}
    >
      DELETE
    </Button>
  );
};

export default DeletePosts;
