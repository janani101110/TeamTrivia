
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { URL } from "../../url";
import AdminNavi from "./AdminNavi";
import "./ViewProjectAdmin.css";
import ReactQuill from "react-quill"; // Import ReactQuill for rendering
import "./ViewProjectAdmin.css";

import AOS from "aos";
import "aos/dist/aos.css";

const ViewResourceAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resoPost, setResoPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.refreshHard(); // Refresh AOS on component mount/update
  }, [resoPost]);

  const fetchResoPost = async () => {
    try {
      const response = await axios.get(`${URL}/api/resoposts/${id}`);
      setResoPost(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching resource post:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResoPost();
  }, [id]);

  const fetchUserProfile = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}`);
      return res.data; // Assuming res.data contains { username, email, ... }
    } catch (err) {
      console.error(`Error fetching user profile for user ${userId}:`, err);
      return null;
    }
  };

  const handleApproval = async (approvedStatus) => {
    const confirmMessage = `Are you sure you want to ${
      approvedStatus ? "approve" : "reject"
    } this resource?`;
    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return; // User clicked "Cancel", stop further execution
    }

    try {
      const url = `${URL}/api/resoposts/${
        approvedStatus ? "approve" : "reject"
      }/${id}`;
      await axios.put(url);
      await sendNotification(approvedStatus);
      navigate("/admin");
    } catch (err) {
      console.log(err);
    }
  };

  const sendNotification = async (approvedStatus) => {
    try {
      const notification = {
        userId: resoPost.userId,
        message: `Your resource has been ${
          approvedStatus ? "approved" : "rejected"
        }.`,
        read: false,
      };
      await axios.post(`${URL}/api/notifications`, notification);
    } catch (err) {
      console.log("Error sending notification:", err);
    }
  };

  const renderButtons = () => {
    if (!resoPost.approved && !resoPost.rejected) {
      return (
        <>
          <button
            type="submit"
            className="approved"
            onClick={() => handleApproval(true)}
          >
            Approve
          </button>
          <button
            type="submit"
            className="reject"
            onClick={() => handleApproval(false)}
          >
            Reject
          </button>
        </>
      );
    } else if (resoPost.approved) {
      return (
        <button
          type="submit"
          className="reject"
          onClick={() => handleApproval(false)}
        >
          Reject
        </button>
      );
    } else if (resoPost.rejected) {
      return (
        <button
          type="submit"
          className="approved"
          onClick={() => handleApproval(true)}
        >
          Approve
        </button>
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!resoPost) {
    return <div>Error loading resource post</div>;
  }

  return (
    <div>
      <AdminNavi />
      <div className="admin_content">
        <div className="project_seemore_container" data-aos="fade-up">
          <h1 className="resource_title" data-aos="fade-up">{resoPost.title}</h1>
          <hr className="resource_line" />
          <div className="resource_inline_user" data-aos="fade-up">
            <div className="resopost-image" data-aos="fade-up">
            <p className="resource_figure" data-aos="fade-up"> <strong>Image:</strong></p>
              <img src={resoPost.photo} alt={resoPost.title} width={600} />
            </div>
          </div>
          <br />
          <div data-aos="fade-up">
            <p className="resource_head" data-aos="fade-up"><strong>Explanation of the resource:</strong></p>
           
            <ReactQuill value={resoPost.desc} readOnly={true} theme="bubble" />
          
            <p data-aos="fade-up"><strong>Category:</strong></p>
            <div className="reso-post-categories" data-aos="fade-up">
            <br />
            <div data-aos="fade-up">
              {resoPost.categories?.map((c, i) => (
                <div key={i}>{c}</div>
              ))}
            </div>
      </div>
          </div>
          <br />
          <br />
          <div className="button_flex" data-aos="fade-up">{renderButtons()}</div>
        </div>
      </div>
    </div>
  );
};

export default ViewResourceAdmin;
