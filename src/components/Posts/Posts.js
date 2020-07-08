import React, { Component, Fragment } from 'react';
import { listPosts } from '../../graphql/queries';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import DeletePosts from '../DeletePosts/DeletePosts';
import EditPosts from '../EditPost/EditPosts';
import { Card, Badge, OverlayTrigger, Popover } from 'react-bootstrap';
import {
  onCreatePost,
  onDeletePost,
  onUpdatePost,
  onCreateComment,
  onCreateLike,
} from '../../graphql/subscriptions';
import CreateComment from '../CreateComment/CreateComment';
import Comment from '../Comment/Comment';
import { FaHeart } from 'react-icons/fa';
import { createLike } from '../../graphql/mutations';
import UsersWhoLikedPost from '../UsersWhoLikedPost/UsersWhoLikedPost';

class Posts extends Component {
  state = {
    posts: [],
    ownerId: '',
    ownerUsername: '',
    isHovering: false,
    errorMsg: '',
    postLikedBy: [],
  };

  handleLike = async (postId) => {
    if (this.likedPost(postId)) {
      return this.setState({ errorMsg: "Can't Like Your Own Post!" });
    } else {
      const input = {
        numberLikes: 1,
        likeOwnerId: this.state.ownerId,
        likeOwnerUsername: this.state.ownerUsername,
        likePostId: postId,
      };
      try {
        const res = await API.graphql(graphqlOperation(createLike, { input }));
        console.log(res.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  handleMouseHover = async (postId) => {
    this.setState({ isHovering: !this.state.isHovering });
    let innerLikes = this.state.postLikedBy;
    for (let post of this.state.posts) {
      if (post.id === postId) {
        for (let like of post.likes.items) {
          innerLikes.push(like.likeOwnerUsername);
        }
      }
      this.setState({ postLikedBy: innerLikes });
    }
  };

  handleMouseLeave = async () => {
    this.setState({ isHovering: !this.state.isHovering });
    this.setState({ postLikedBy: [] });
  };

  componentDidMount = async () => {
    this.getPosts();

    await Auth.currentUserInfo().then((user) => {
      this.setState({
        ownerId: user.attributes.sub,
        ownerUsername: user.username,
      });
    });

    this.createPostListener = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (postData) => {
        const newPost = postData.value.data.onCreatePost;
        const prevPosts = this.state.posts.filter(
          (post) => post.id !== newPost.id
        );
        const updatedPosts = [newPost, ...prevPosts];

        this.setState({ posts: updatedPosts });
      },
    });

    this.deletePostListener = API.graphql(
      graphqlOperation(onDeletePost)
    ).subscribe({
      next: (postData) => {
        const deletedPost = postData.value.data.onDeletePost;
        const updatedPosts = this.state.posts.filter(
          (post) => post.id !== deletedPost.id
        );
        this.setState({ posts: updatedPosts });
      },
    });

    this.editPostListener = API.graphql(
      graphqlOperation(onUpdatePost)
    ).subscribe({
      next: (postData) => {
        const editePost = postData.value.data.onUpdatePost;
        const index = this.state.posts.findIndex(
          (post) => post.id === editePost.id
        );
        const updatedPosts = [
          ...this.state.posts.slice(0, index),
          editePost,
          ...this.state.posts.slice(index + 1),
        ];
        this.setState({ posts: updatedPosts });
      },
    });

    this.createPostCommentListener = API.graphql(
      graphqlOperation(onCreateComment)
    ).subscribe({
      next: (commentData) => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdComment.post.id === post.id) {
            post.comments.items.push(createdComment);
          }
        }
        this.setState({ posts });
      },
    });

    this.createPostLikeListener = API.graphql(
      graphqlOperation(onCreateLike)
    ).subscribe({
      next: (postData) => {
        const createdLike = postData.value.data.onCreateLike;
        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdLike.post.id === post.id) {
            post.likes.items.push(createdLike);
          }
        }
        this.setState({ posts });
      },
    });
  };

  getPosts = async () => {
    const res = await API.graphql(graphqlOperation(listPosts));
    this.setState({ posts: res.data.listPosts.items });
    // console.log('ALL POSTS: ', res.data.listPosts.items);
  };

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.editPostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
    this.createPostLikeListener.unsubscribe();
  }

  likedPost = (postId) => {
    for (let post of this.state.posts) {
      if (post.id === postId) {
        if (post.postOwnerId === this.state.ownerId) return true;
        for (let like of post.likes.items) {
          if (like.likeOwnerId === this.state.ownerId) {
            return true;
          }
        }
      }
    }
    return false;
  };

  render() {
    let loggedInUser = this.state.ownerId;

    let popUp = (
      <Popover id="popover-positioned-right" className="shadow-lg">
        <Fragment>
          {this.state.postLikedBy.length === 0 ? (
            <Popover.Content>
              <strong>Liked by no one!</strong>
            </Popover.Content>
          ) : (
            <>
              <Popover.Title as="h3">Liked by:</Popover.Title>
              <Popover.Content>
                <UsersWhoLikedPost data={this.state.postLikedBy} />
              </Popover.Content>
            </>
          )}
        </Fragment>
      </Popover>
    );

    return (
      <div>
        {this.state.posts.map((post) => (
          <div className="d-flex justify-content-center" key={post.id}>
            <Card className="text-center col-lg-6 col-md-8 col-sm-12 mt-4 mb-4 p-0 shadow-lg">
              <Card.Header>
                <h2>{post.postTitle}</h2>
              </Card.Header>
              <Card.Body>
                <Card.Text>{post.postBody}</Card.Text>
                <span>
                  {post.postOwnerId === loggedInUser && (
                    <DeletePosts deletePostProps={post} />
                  )}
                  {post.postOwnerId === loggedInUser && <EditPosts {...post} />}
                  <br />
                  <OverlayTrigger
                    transition={null}
                    key="right"
                    placement="right"
                    overlay={popUp}
                  >
                    <Badge
                      onMouseEnter={() => this.handleMouseHover(post.id)}
                      onMouseLeave={() => this.handleMouseLeave()}
                      className="mt-3"
                      variant={
                        post.likes.items.length > 0 ? 'light' : 'secondary'
                      }
                      style={{
                        height: '45px',
                        cursor: 'pointer',
                        fontSize: '18px',
                      }}
                    >
                      <p
                        className="mt-2"
                        onClick={() => this.handleLike(post.id)}
                        style={{
                          color: post.likes.items.length > 0 ? 'red' : 'white',
                        }}
                      >
                        <FaHeart className="mr-1" />
                        {post.likes.items.length}
                      </p>
                    </Badge>
                  </OverlayTrigger>
                  <p className="text-danger mt-2">
                    {post.postOwnerId === loggedInUser && this.state.errorMsg}
                  </p>
                </span>
                <span className="d-flex flex-column align-items-center justify-content-start mt-3">
                  <Card className="w-75" body>
                    {post.comments.items.length > 0 && (
                      <>
                        <b className="text-left">Comments:</b>
                        <hr />
                      </>
                    )}
                    {post.comments.items.map((comment, index) => (
                      <Fragment key={index}>
                        <Comment commentData={comment} />
                        <hr />
                      </Fragment>
                    ))}
                  </Card>
                  <CreateComment postId={post.id} />
                </span>
              </Card.Body>
              <Card.Footer className="text-muted">
                {`Wrote by: ${post.postOwnerUsername}`} on{' '}
                <time>{new Date(post.createdAt).toDateString()}</time>
              </Card.Footer>
            </Card>
          </div>
        ))}
      </div>
    );
  }
}

export default Posts;
