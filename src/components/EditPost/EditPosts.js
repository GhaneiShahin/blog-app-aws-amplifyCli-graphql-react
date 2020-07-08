import React, { Component, Fragment } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { updatePost } from '../../graphql/mutations';

class EditPosts extends Component {
  state = {
    show: false,
    id: '',
    postOwnerId: '',
    postOwnerUsername: '',
    postTitle: '',
    postBody: '',
    postData: {
      postTitle: this.props.postTitle,
      postBody: this.props.postBody,
    },
  };

  handleModal = () => {
    this.setState({ show: !this.state.show });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  handleTitle = (e) => {
    this.setState({
      postData: { ...this.state.postData, postTitle: e.target.value },
    });
  };

  handleBody = (e) => {
    this.setState({
      postData: { ...this.state.postData, postBody: e.target.value },
    });
  };

  handleUpdatePost = async (e) => {
    e.preventDefault();
    const input = {
      id: this.props.id,
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postData.postTitle,
      postBody: this.state.postData.postBody,
    };
    await API.graphql(graphqlOperation(updatePost, { input }));

    //force close modal
    this.setState({ show: !this.state.show });
  };

  componentDidMount = async () => {
    await Auth.currentUserInfo().then((user) => {
      this.setState({
        postOwnerId: user.attributes.sub,
        postOwnerUsername: user.username,
      });
    });
  };

  render() {
    return (
      <Fragment>
        <Button variant="outline-primary" onClick={this.handleModal}>
          EDIT
        </Button>
        <Modal
          show={this.state.show}
          onHide={this.handleModal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          animation={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="d-flex justify-content-center mt-5">
              <Form onSubmit={(e) => this.handleUpdatePost(e)}>
                <Form.Group>
                  <Form.Control
                    type="text"
                    name="postTitle"
                    placeholder="Your Title..."
                    value={this.state.postData.postTitle}
                    onChange={this.handleTitle}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Control
                    value={this.state.postData.postBody}
                    as="textarea"
                    type="text"
                    rows="3"
                    cols="40"
                    name="postBody"
                    placeholder="Your new Blog Post..."
                    onChange={this.handleBody}
                    required
                  />
                </Form.Group>
                <div className="text-center">
                  <Button
                    variant="outline-success"
                    className="m-auto"
                    type="submit"
                  >
                    UPDATE POST
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

export default EditPosts;
