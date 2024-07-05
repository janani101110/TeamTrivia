import React, { useState,  useEffect  } from "react";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { URL } from "../../url";
import { useUsers } from "../../Context/UserContext";
import { formatDistanceToNow, format } from "date-fns";
import replyIcon from "../Resources/Assets/resreply.png";
import Alert from "../../Component/Alert/Alert";
import { useNavigate } from "react-router-dom"; 

export const ResoComment = ({ c, fetchPostComments }) => {
  const [reply, setReply] = useState("");
  const [author, setAuthor] = useState(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false); // State to toggle display of replies
  const { user } = useUsers();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false); // State for login alert
  const navigate = useNavigate(); 

  const deleteComment = (id) => {
    setShowDeleteAlert(true); // Show the delete confirmation alert
  };

  const handleAlertClose = () => {
    confirmDelete(true); // Close the delete confirmation alert
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${URL}/api/resocomments/${c._id}`, {
        withCredentials: true,
      });
      fetchPostComments(); // Refresh comments after deletion
      setShowDeleteAlert(false); // Close the alert after successful deletion
    } catch (err) {
      console.log(err);
      // Handle error appropriately (e.g., show error message)
    }
  };
  const handleAlertCloselogin = () =>{
    setShowLoginAlert(false);
    navigate('/login');
  }
  

  const fetchUserData = async (userId) => {
    try {
      const response = await fetch(`${URL}/api/auth/details/${userId}`);
      const userData = await response.json();
      return userData; // Return parsed JSON data
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const userData = await fetchUserData(c.postedBy);
        setAuthor(userData); // Set author data
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    fetchAuthor();
  }, [c.postedBy]);

  const postReply = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowLoginAlert(true); // Show login alert if user is not logged in
      return;
    }
    try {
      await axios.post(
        `${URL}/api/resocomments/create`,
        { answer: reply, postId: c.postId, parentId: c._id, postedBy: user._id },
        { withCredentials: true }
      );
      fetchPostComments();
      setReply("");
      setShowReplyInput(false);
    } catch (err) {
      console.log(err);
    }
  };

  // Toggle function to show/hide replies
  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  // Render only if author is fetched
  if (!author) return null;
  const createdAtDate = new Date(c.createdAt);
  const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
  const formattedDate = format(createdAtDate, "MMM dd");

  return (
    <div className="reso-comment">
      <div className="reso-comment-header">

          <div className="resocomuser">
          <img src={author.profilePicture} alt="" className="authorProfilePicture" />
          <p className="user">{author.username}</p>
          <p className="time">
            {createdAtDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ? timeAgo
              : formattedDate}
          </p>
          </div>

        <div className="reso-comment-actions">
          {user && author._id === user._id && (
            <MdDelete onClick={() => deleteComment(c._id)} />
          )}
          <button onClick={() => setShowReplyInput(!showReplyInput)} className="reply">
          <img src={replyIcon} alt="Reply" />
          </button>
        </div>       
       
      </div>

      <p>{c.comment}</p>

      <div className="comreplyshow">
        {c.replies && c.replies.length > 0 && (
          <button onClick={toggleReplies} className="showreply">
            {showReplies ? "Hide replies" : "Show replies"}
          </button>
        )}
        </div>

      {showReplyInput && (
        <div className="reso-write-comment">
          <input
            onChange={(e) => setReply(e.target.value)}
            type="text"
            value={reply}
            placeholder="Write a reply"
            className="resocomsection"
          />
          <button onClick={postReply} className="addreply">Add Reply</button>
        </div>
      )}
      
      {showReplies && (
      <div className="reso-comment-replies">
        {c.replies && c.replies.map(reply => (
          <ResoComment key={reply._id} c={reply} fetchPostComments={fetchPostComments} />
        ))}
      </div>
      )}
      {showDeleteAlert && (
        <Alert
          message="Are you sure you want to delete this comment?"
          onClose={handleAlertClose}
          onConfirm={confirmDelete}
        />
      )}
      {showLoginAlert && (
        <Alert
          message="Please log in "
          onClose={handleAlertCloselogin}
        />
      )}
    </div>
  );
};