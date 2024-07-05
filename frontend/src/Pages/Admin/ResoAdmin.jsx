import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNavi from "./AdminNavi";
import axios from "axios";
import { URL } from "../../url";
import AOS from "aos";
import "aos/dist/aos.css";
import "./ProAdmin.css"; // Ensure you have a relevant CSS file for resources

const ResoAdmin = () => {
  const [resourcePosts, setResourcePosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    AOS.refresh(); // Refresh AOS on component mount/update
  }, []);

  useEffect(() => {
    const fetchResourcePosts = async () => {
      try {
        const response = await axios.get(`${URL}/api/resoposts`);
        setResourcePosts(response.data);
      } catch (error) {
        console.error("Error fetching resource posts:", error);
      }
    };

    fetchResourcePosts();
  }, []);

  useEffect(() => {
    const filteredResources = resourcePosts.filter((resourcePost) => {
      if (selectedStatus === "pending") return !resourcePost.approved && !resourcePost.rejected;
      if (selectedStatus === "approved") return resourcePost.approved;
      if (selectedStatus === "rejected") return resourcePost.rejected;
      return true;
    });
    setFilteredPosts(filteredResources);
    setCurrentPage(1); // Reset to the first page whenever the status filter changes
  }, [selectedStatus, resourcePosts]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div data-aos="fade-up" >
      <AdminNavi />
      <div className="proAdmin_content">
        <h1 style={{ marginTop: "80px" }}>Resources Page</h1> <br />
        <div className="proAdmin_filter-dropdown">
          <label htmlFor="statusFilter">Select Status: </label>
          <select
            id="statusFilter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              marginLeft: "10px",
              borderRadius: "5px",
              backgroundColor: "pink",
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <table className="proAdmin_table">
          <thead>
            <tr className="proAdmin_tr">
              <th className="proAdmin_th">Title</th>
              <th className="proAdmin_th">Posted By</th>
              <th className="proAdmin_th">Email</th>
              <th className="proAdmin_th">Time</th>
              <th className="proAdmin_th">Status</th>
              <th className="proAdmin_th">View</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map((resourcePost) => (
              <tr key={resourcePost._id} className="proAdmin_tr">
                <td className="proAdmin_td">{resourcePost.title}</td>
                <td className="proAdmin_td">
                  {resourcePost.user ? resourcePost.user.username : "Unknown"}
                </td>
                <td className="proAdmin_td">
                  {resourcePost.user ? resourcePost.user.email : "N/A"}
                </td>
                <td className="proAdmin_td">
                  {new Date(resourcePost.createdAt).toLocaleString()}
                </td>
                <td className="proAdmin_td">
                  {resourcePost.approved
                    ? "Approved"
                    : resourcePost.rejected
                    ? "Rejected"
                    : "Pending Approval"}
                </td>
                <td className="proAdmin_td">
                  <Link to={`/viewresourceadmin/${resourcePost._id}?status=${selectedStatus}`}>
                    <button
                      style={{
                        borderRadius: "10px",
                        color: "white",
                        background: "rgb(95, 95, 228)",
                        padding: "5px",
                        cursor: "pointer",
                      }}
                    >
                      See More
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="proAdmin_pagination">
          {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`proAdmin_pagination-button ${currentPage === i + 1 ? 'active' : ''}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResoAdmin;