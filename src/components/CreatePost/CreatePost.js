import React, { Component, Fragment } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { createPost } from '../../graphql/mutations';

class CreatePost extends Component {
  state = {
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: '',
    isModalOpen: false,
  };

  componentDidMount = async () => {
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        postOwnerId: user.attributes.sub,
        postOwnerUsername: user.username,
      });
    });
  };

  handleChangePost = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddPost = async (e) => {
    e.preventDefault();
    const input = {
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString(),
    };
    await API.graphql(graphqlOperation(createPost, { input }));
    this.setState({ postBody: '', postTitle: '' });

    //force close modal
    this.setState({isModalOpen: false});
  };

  ModalHandler = () => {
    this.setState({isModalOpen: !this.state.isModalOpen})
  };

  render() {
    const { isModalOpen } = this.state;

    return (
      <Fragment>
        <Button variant="outline-secondary" onClick={this.ModalHandler}>
          New Post
        </Button>
        <Modal
          show={isModalOpen}
          onHide={this.ModalHandler}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          animation={false} 
        >
          <Modal.Header closeButton>
            <Modal.Title>Create new Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center mt-5">
              <Form onSubmit={this.handleAddPost}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="postTitle"
                    placeholder="Your Title..."
                    value={this.state.postTitle}
                    onChange={this.handleChangePost}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Control
                    value={this.state.postBody}
                    as="textarea"
                    type="text"
                    rows="3"
                    cols="40"
                    name="postBody"
                    placeholder="Your new Blog Post..."
                    onChange={this.handleChangePost}
                    required
                  />
                </Form.Group>
                <div className="text-center">
              <Button
                variant="outline-success"
                className="m-auto"
                type="submit"
              >
                POST
              </Button>
            </div>
              </Form>
            </div>
          </Modal.Body>
        </Modal>
      </Fragment>
    );
  }
}

export default CreatePost;
