import React, { Component } from 'react';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { Form, Button } from 'react-bootstrap';
import { createComment } from '../../graphql/mutations';

export class CreateComment extends Component {
  state = {
    commentOwnerId: '',
    commentOwnerUsername: '',
    content: '',
  };

  handleChangeContent = (e) => {
    this.setState({ content: e.target.value });
  };

  handleAddComment = async (e) => {
    e.preventDefault();
    const input = {
      commentPostId: this.props.postId,
      commentOwnerUsername: this.state.commentOwnerUsername,
      commentOwnerId: this.state.commentOwnerId,
      content: this.state.content,
      createdAt: new Date().toISOString(),
    };
    await API.graphql(graphqlOperation(createComment, { input }));
    this.setState({ content: '' });
  };

  componentWillMount = async () => {
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        commentOwnerId: user.attributes.sub,
        commentOwnerUsername: user.username,
      });
    });
  };
  render() {
    return (
      <Form onSubmit={this.handleAddComment} className="w-75 m-auto">
        <Form.Group controlId="exampleForm.ControlTextarea1" className="mt-3">
          <Form.Control
            as="textarea"
            rows="3"
            name="content"
            placeholder="Add your Comment..."
            value={this.state.content}
            onChange={this.handleChangeContent}
          />
        </Form.Group>
        <Button variant="outline-success" type="submit" block>
          POST
        </Button>
      </Form>
    );
  }
}

export default CreateComment;
